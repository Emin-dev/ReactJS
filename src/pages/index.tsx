import { InferGetStaticPropsType, NextPage } from 'next';
import { getProjectsStaticProps } from 'lib/github-repositories';
import Layout from 'components/ui/Layout';
import SEO from 'components/SEO';
import Intro from 'components/modules/Intro';
import Projects from 'components/modules/Projects';
import Skills from 'components/modules/Skills';
import Contact from 'components/modules/Contact';

const HomePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ repos }) => (
  <Layout>
    <SEO />
    <Intro />
    <Projects data={repos} />
    <Skills />
    <Contact />
  </Layout>
);

export const getStaticProps = () => getProjectsStaticProps(process.env.GITHUB_TOKEN);

export default HomePage;
