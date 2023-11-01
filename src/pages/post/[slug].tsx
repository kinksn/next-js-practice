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
  // slugが提供された場合、またはキャッシュがまだ存在しない場合はデータを再取得
  if (slug || !cachedPosts) {
    const newPosts = await getPostsInContents(slug);
    // slugが提供されていない場合のみキャッシュを更新
    if (!slug) {
      cachedPosts = newPosts;
    }
    return newPosts;
  }
  return cachedPosts;
};

export const getStaticPaths: GetStaticPaths<StaticPathsParams> = async () => {
  const posts = await getCachedPosts();
  const paths = posts.reduce((acc: { params: StaticPathsParams }[], post) => {
    if(post.slug) {
      return [{ params: { slug: post.slug } }]
    }
    return acc;
  }, []);

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

  if(!params) return notFoundProps;
  const posts = await getCachedPosts(params.slug);
  
  if(!posts) return notFoundProps;

  return {
    props: {
      post: posts[0]
    },
    revalidate: 60
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