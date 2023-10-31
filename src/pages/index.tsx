import { GetStaticProps, NextPage } from "next";
import { Layout } from "@/lib/component/Layout";
import { PostComponent } from "@/lib/component/Post";
import { StaticProps } from "@/lib/types";
import { getPostsInContents } from "@/lib/notion";

export const getStaticProps: GetStaticProps<StaticProps> = async () => {
  return {
    props: { posts: await getPostsInContents() },
    revalidate: 60
  }
};

const Home: NextPage<StaticProps> = ({ posts }) => {
  return (
    <Layout>
      {posts.map((post) => <PostComponent post={post} key={post.id} />)}
    </Layout>
  )
}

export default Home;
