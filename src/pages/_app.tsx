import { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { generateDefaultSeo } from 'next-seo/pages';
import { ThemeProvider } from 'next-themes';
import config from 'data/config';
import SEO from 'data/next-seo.config';
import 'components/ui/fonts.css';
import 'components/ui/globals.css';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    if (!config.googleAnalyticsID) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };
    window.gtag('js', new Date());
    window.gtag('config', config.googleAnalyticsID, { page_path: window.location.pathname });
    const handleRouteChange = (url: string) => {
      window.gtag?.('config', config.googleAnalyticsID, { page_path: url });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => { router.events.off('routeChangeComplete', handleRouteChange); };
  }, [router.events]);

  return (
    <>
      {config.googleAnalyticsID && (
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsID}`} />
      )}
      <ThemeProvider attribute="class">
        <Head>{generateDefaultSeo({
          ...SEO,
          additionalMetaTags: [
            {
              property: 'twitter:image',
              content: `${process.env.NODE_ENV !== 'development' ? config.NEXT_PUBLIC_PORTFOLIO_URL : ''}/twitter-cover.png`,
            },
            { property: 'og:type', content: 'website' },
          ],
        })}</Head>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
};

export default MyApp;
