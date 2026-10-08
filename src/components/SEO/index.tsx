import config from 'data/config';
import Head from 'next/head';
import { generateNextSeo } from 'next-seo/pages';

const { url, defaultDescription, defaultTitle } = config;

const SEO = ({
  location = '',
  title = defaultTitle,
  description = defaultDescription,
}) => (
  <Head>{generateNextSeo({
    title,
    description,
    canonical: `${url}${location}`,
    additionalMetaTags: [
      {
        name: 'image',
        content: `${url}/assets/thumbnail/thumbnail.png`,
      },
      {
        property: 'og:title',
        content: title,
      },
      {
        property: 'og:description',
        content: description,
      },
      {
        property: 'og:url',
        content: `${url}${location}`,
      },
      {
        property: 'og:image',
        content: `${url}/assets/thumbnail/thumbnail.png`,
      },
      {
        name: 'twitter:url',
        content: `${url}${location}`,
      },
      {
        name: 'twitter:title',
        content: title,
      },
      {
        name: 'twitter:description',
        content: description,
      },
      {
        name: 'twitter:image:src',
        content: `${url}/assets/thumbnail/thumbnail.png`,
      },
      {
        name: 'twitter:image',
        content: `${url}/assets/thumbnail/thumbnail.png`,
      },
    ],
  })}</Head>
);

export default SEO;
