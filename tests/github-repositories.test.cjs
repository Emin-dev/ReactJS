const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const axios = require('axios');
const {
  publicRepositoriesQuery,
  selectPublicRepositories,
  getPublicRepositories,
  getProjectsStaticProps,
} = require('../.test-build/github-repositories.js');

// All API responses and the non-working token below are synthetic. Replacing
// Axios's adapter prevents these tests from making any network requests.
const originalAdapter = axios.defaults.adapter;
axios.defaults.adapter = () => { throw new Error('Unexpected network request in test'); };
after(() => { axios.defaults.adapter = originalAdapter; });

const publicNode = (changes = {}) => ({
  id: 'synthetic-public-id',
  name: 'synthetic-public-project',
  url: 'https://github.com/example/synthetic-public-project',
  description: 'Synthetic public description',
  isPrivate: false,
  visibility: 'PUBLIC',
  stargazers: { totalCount: 7 },
  forkCount: 2,
  languages: { nodes: [{ id: 'synthetic-language-id', name: 'TypeScript' }] },
  ...changes,
});
const payload = (nodes) => ({ data: { viewer: { repositories: { edges: nodes.map((node) => ({ node })) } } } });
const respondWith = (data, inspect = () => {}) => {
  axios.defaults.adapter = async (config) => {
    inspect(config);
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
};

test('retrieval explicitly requests public repositories and privacy markers', () => {
  assert.match(publicRepositoriesQuery, /repositories\(first: 8, privacy: PUBLIC,/);
  assert.match(publicRepositoriesQuery, /\bisPrivate\b/);
  assert.match(publicRepositoriesQuery, /\bvisibility\b/);
});

test('retains a public repository using only allowlisted display fields', () => {
  const result = selectPublicRepositories([{ node: publicNode({
    privateMetadata: 'SYNTHETIC_DO_NOT_SERIALIZE',
    stargazers: { totalCount: 7, secret: 'SYNTHETIC_DO_NOT_SERIALIZE' },
    languages: { nodes: [{ id: 'lang', name: 'TypeScript', secret: 'SYNTHETIC_DO_NOT_SERIALIZE' }] },
  }), secret: 'SYNTHETIC_DO_NOT_SERIALIZE' }]);
  assert.deepEqual(result, [{ node: {
    id: 'synthetic-public-id', name: 'synthetic-public-project',
    url: 'https://github.com/example/synthetic-public-project', description: 'Synthetic public description',
    stargazers: { totalCount: 7 }, forkCount: 2, languages: { nodes: [{ id: 'lang', name: 'TypeScript' }] },
  } }]);
  assert.doesNotMatch(JSON.stringify(result), /SYNTHETIC_DO_NOT_SERIALIZE|isPrivate|visibility/);
});

test('private and every missing or malformed privacy marker fail closed', () => {
  for (const marker of [true, undefined, null, 0, 1, '', 'false', 'true', [], {}]) {
    const node = publicNode({ isPrivate: marker });
    if (marker === undefined) delete node.isPrivate;
    assert.deepEqual(selectPublicRepositories([{ node }]), []);
  }
});

test('internal, conflicting, missing and malformed visibility fails closed', () => {
  for (const visibility of ['PRIVATE', 'INTERNAL', undefined, null, false, 'public', '', {}, []]) {
    assert.deepEqual(selectPublicRepositories([{ node: publicNode({ visibility }) }]), []);
  }
  assert.deepEqual(selectPublicRepositories([{ node: publicNode({ isPrivate: true, visibility: 'PUBLIC' }) }]), []);
});

test('malformed edges and required display fields do not reach serialized props', () => {
  for (const edges of [undefined, null, {}, 'not an array']) assert.deepEqual(selectPublicRepositories(edges), []);
  assert.deepEqual(selectPublicRepositories([null, {}, { node: null }, { node: [] }, { node: 'unknown' }]), []);
  for (const field of ['id', 'name']) {
    for (const value of [null, undefined, '', ' ', 3, {}]) {
      assert.deepEqual(selectPublicRepositories([{ node: publicNode({ [field]: value }) }]), []);
    }
  }
  for (const url of [undefined, null, {}, 'javascript:alert(1)', 'https://example.com/a/b',
    'http://github.com/a/b', 'https://github.com.evil.test/a/b', 'https://user:pass@github.com/a/b',
    'https://github.com/a/b?private=1', 'https://github.com/a/b#secret']) {
    assert.deepEqual(selectPublicRepositories([{ node: publicNode({ url }) }]), []);
  }
});

test('normalizes optional fields and bounds repository and language output', () => {
  const nodes = Array.from({ length: 12 }, (_, i) => ({ node: publicNode({ id: String(i),
    description: { secret: 'SYNTHETIC_DO_NOT_SERIALIZE' }, forkCount: -1, stargazers: { totalCount: NaN },
    languages: { nodes: [null, {}, { id: 'a', name: {} }, ...Array.from({ length: 5 }, (_, j) => ({ id: String(j), name: 'JS' }))] },
  }) }));
  const result = selectPublicRepositories(nodes);
  assert.equal(result.length, 8);
  assert.deepEqual(result.map(({ node }) => node.id), ['0', '1', '2', '3', '4', '5', '6', '7']);
  assert.equal(result[0].node.description, null);
  assert.equal(result[0].node.forkCount, 0);
  assert.equal(result[0].node.stargazers.totalCount, 0);
  assert.equal(result[0].node.languages.nodes.length, 3);
  assert.doesNotMatch(JSON.stringify(result), /SYNTHETIC_DO_NOT_SERIALIZE/);
});

test('static serialization excludes synthetic private and unknown records even if returned by the API', async () => {
  const secret = 'SYNTHETIC_PRIVATE_MUST_NOT_APPEAR';
  respondWith(payload([
    publicNode(),
    publicNode({ id: secret, name: secret, description: secret, url: `https://github.com/example/${secret}`, isPrivate: true, visibility: 'PRIVATE' }),
    publicNode({ id: secret, name: secret, isPrivate: undefined }),
    publicNode({ id: secret, visibility: 'INTERNAL' }),
  ]), (config) => {
    assert.equal(config.url, 'https://api.github.com/graphql');
    assert.equal(config.method, 'post');
    assert.equal(JSON.parse(config.data).query, publicRepositoriesQuery);
    assert.equal(config.headers.Authorization, 'bearer synthetic-token-not-a-credential');
    assert.equal(config.timeout, 10000);
    assert.equal(config.maxRedirects, 0);
  });
  const result = await getProjectsStaticProps('synthetic-token-not-a-credential');
  assert.equal(result.props.repos.length, 1);
  assert.equal(result.revalidate, 10);
  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /SYNTHETIC_PRIVATE_MUST_NOT_APPEAR|synthetic-token-not-a-credential/);
  assert.match(serialized, /synthetic-public-project/);
});

test('credential-free static builds make no request and render no repository records', async () => {
  axios.defaults.adapter = () => { throw new Error('No request should be made'); };
  for (const token of [undefined, '', '  ']) {
    assert.deepEqual(await getProjectsStaticProps(token), { props: { repos: [] }, revalidate: 10 });
  }
});

test('GraphQL errors, partial results and malformed responses are rejected without response metadata', async () => {
  const secret = 'SYNTHETIC_ERROR_MUST_NOT_APPEAR';
  for (const response of [null, {}, { data: null }, { data: { viewer: null } },
    { data: { viewer: { repositories: { edges: {} } } } },
    { ...payload([publicNode()]), errors: [{ message: secret }] },
    { ...payload([publicNode()]), errors: secret }]) {
    respondWith(response);
    await assert.rejects(getPublicRepositories('synthetic-token-not-a-credential'), (error) => {
      assert.equal(error.message, 'Unable to load public GitHub repositories. Check server-side configuration and try again.');
      assert.doesNotMatch(String(error.stack), /SYNTHETIC_ERROR_MUST_NOT_APPEAR|synthetic-token-not-a-credential/);
      assert.equal(error.cause, undefined);
      return true;
    });
  }
});

test('request failures do not expose Authorization or provider responses', async () => {
  axios.defaults.adapter = async (config) => {
    const error = new Error('SYNTHETIC_PROVIDER_ERROR');
    error.config = config;
    error.response = { data: 'SYNTHETIC_PRIVATE_RESPONSE' };
    throw error;
  };
  await assert.rejects(getProjectsStaticProps('synthetic-token-not-a-credential'), (error) => {
    assert.doesNotMatch(JSON.stringify(error) + error.stack, /SYNTHETIC_PROVIDER_ERROR|SYNTHETIC_PRIVATE_RESPONSE|synthetic-token-not-a-credential/);
    assert.equal(error.config, undefined);
    assert.equal(error.response, undefined);
    return true;
  });
});

test('valid empty public repository results are allowed', async () => {
  respondWith(payload([]));
  assert.deepEqual(await getPublicRepositories('synthetic-token-not-a-credential'), []);
});
