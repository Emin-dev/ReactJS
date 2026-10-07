import axios from 'axios';

// Deliberately smaller than GitHub's Repository type: only display fields may
// cross the getStaticProps boundary into public HTML and Next.js JSON.
export type PublicRepository = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  stargazers: { totalCount: number };
  forkCount: number;
  languages: { nodes: { id: string; name: string }[] };
};

export type PublicRepositoryEdge = { node: PublicRepository };

export const publicRepositoriesQuery = `
  query PublicPortfolioRepositories {
    viewer {
      repositories(first: 8, privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
        edges {
          node {
            isPrivate
            visibility
            id
            name
            url
            description
            stargazers { totalCount }
            forkCount
            languages(first: 3) { nodes { id name } }
          }
        }
      }
    }
  }
`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonemptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const countOrZero = (value: unknown): number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;

const isRepositoryUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.host === 'github.com' &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
};

export const selectPublicRepositories = (edges: unknown): PublicRepositoryEdge[] => {
  if (!Array.isArray(edges)) return [];

  const repos: PublicRepositoryEdge[] = [];
  for (const edge of edges) {
    if (!isRecord(edge) || !isRecord(edge.node)) continue;
    const node = edge.node;

    // Never infer public visibility from a missing or merely falsy marker.
    // Both checks are required so internal and conflicting records fail closed.
    if (node.isPrivate !== false || node.visibility !== 'PUBLIC') continue;
    if (!isNonemptyString(node.id) || !isNonemptyString(node.name) || !isRepositoryUrl(node.url)) continue;

    const languages: PublicRepository['languages']['nodes'] = [];
    if (isRecord(node.languages) && Array.isArray(node.languages.nodes)) {
      for (const language of node.languages.nodes) {
        if (isRecord(language) && isNonemptyString(language.id) && isNonemptyString(language.name)) {
          languages.push({ id: language.id, name: language.name });
        }
        if (languages.length === 3) break;
      }
    }

    // Do not spread provider objects, even after checking their visibility.
    repos.push({
      node: {
        id: node.id,
        name: node.name,
        url: node.url,
        description: typeof node.description === 'string' ? node.description : null,
        stargazers: { totalCount: isRecord(node.stargazers) ? countOrZero(node.stargazers.totalCount) : 0 },
        forkCount: countOrZero(node.forkCount),
        languages: { nodes: languages },
      },
    });
    if (repos.length === 8) break;
  }
  return repos;
};

export const getPublicRepositories = async (token: string | undefined): Promise<PublicRepositoryEdge[]> => {
  // A credential-free build is safe and usable; it renders an empty project list.
  if (!token?.trim()) return [];

  try {
    const response = await axios({
      url: 'https://api.github.com/graphql',
      method: 'post',
      data: { query: publicRepositoriesQuery },
      headers: { Authorization: `bearer ${token}` },
      timeout: 10000,
      maxRedirects: 0,
      maxContentLength: 512 * 1024,
    });
    const payload: unknown = response.data;
    if (!isRecord(payload) || (payload.errors !== undefined && (!Array.isArray(payload.errors) || payload.errors.length))) {
      throw new Error('Invalid GitHub response');
    }
    const data = payload.data;
    if (!isRecord(data) || !isRecord(data.viewer) || !isRecord(data.viewer.repositories)) {
      throw new Error('Invalid GitHub response');
    }
    const edges = data.viewer.repositories.edges;
    if (!Array.isArray(edges)) throw new Error('Invalid GitHub response');
    return selectPublicRepositories(edges);
  } catch {
    // Axios errors may contain Authorization headers and GraphQL errors may
    // contain repository metadata. Never log, serialize, or rethrow those.
    throw new Error('Unable to load public GitHub repositories. Check server-side configuration and try again.');
  }
};

export const getProjectsStaticProps = async (token: string | undefined) => ({
  props: { repos: await getPublicRepositories(token) },
  revalidate: 10,
});
