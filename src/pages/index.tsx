import { GetStaticProps, NextPage } from "next";
import { Layout } from "@/lib/component/Layout";
import { PostComponent } from "@/lib/component/Post";
import { StaticProps } from "@/lib/types";
import { getPosts, getPostContents } from "@/lib/notion";
import { Post } from "@/lib/types";

export const getStaticProps: GetStaticProps<StaticProps> = async () => {
  const posts = await getPosts();
  const postsAddContents = await Promise.all(
    posts.map( async(post: Post) => {
      const contents = await getPostContents(post);
      return { ...post, contents }
    })
  );
  
  return {
    props: { posts: postsAddContents },
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
