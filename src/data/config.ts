const config = {
  defaultTitle: 'John Doe',
  url: process.env.NODE_ENV !== 'development' ? process.env.NEXT_PUBLIC_PORTFOLIO_URL : 'http://localhost:3040',
  defaultDescription: 'I’m John and I’m a Backend & Devops engineer!',
  googleAnalyticsID: /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '')
    ? process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
    : undefined,
  NEXT_PUBLIC_PORTFOLIO_URL: process.env.NEXT_PUBLIC_PORTFOLIO_URL,
};

export default config;
