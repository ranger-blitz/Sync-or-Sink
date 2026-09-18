import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
  <title>Sync or Sink</title>
  <meta
    name="description"
    content="Sync or Sink — an arcade survival game."
  />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;