import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views/home";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Sync or Sink</title>
        <meta
          name="description"
          content="Sync or Sink Game"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
