import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { getPostsInContents } from "@/lib/notion";
import { Layout } from "@/lib/component/Layout";
import { PostComponent } from "@/lib/component/Post";
import { Post } from "@/lib/types";

export type StaticPathsParams = {
  slug: string;
};

type StaticProps = {
  post?: Post;
};

const getCachedPosts = async (slug?: string): Promise<Post[]> => {
  let cachedPosts: Post[] | null = null;
  if (slug || !cachedPosts) {
    const newPosts = await getPostsInContents(slug);
    if (!slug) {
      cachedPosts = newPosts;
    }
    return newPosts;
  }
  
  return cachedPosts;
};

export const getStaticPaths: GetStaticPaths<StaticPathsParams> = async () => {
  const posts = await getCachedPosts();
  const paths = posts.flatMap((post) => {
    if(post.slug) {
      return [{ params: { slug: post.slug } }]
    }
    return [];
  });

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<
  StaticProps,
  StaticPathsParams
> = async ({ params }) => {
  const notFoundProps = {
    props: {},
    redirect: {
      destination: '/404'
    }
  }
  if(!params || !params.slug) return notFoundProps;
  const posts = await getCachedPosts(params.slug);
  
  if(posts) {
    return ({ props: { post: posts[0] }})
  } else {
    return notFoundProps
  }
};

const PostPage: NextPage<StaticProps> = ({ post }) => {
  return (
    <Layout>
      <PostComponent post={post} />
    </Layout>
  );
};

export default PostPage;