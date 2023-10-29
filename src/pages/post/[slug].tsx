import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { getPosts, getPostContents } from "@/lib/notion";
import { Layout } from "@/lib/component/Layout";
import { PostComponent } from "@/lib/component/Post";
import { Post } from "@/lib/types";

type StaticPathsParams = {
    slug: string;
};

type StaticProps = {
    post?: Post;
};

export const getStaticPaths: GetStaticPaths<StaticPathsParams> = async () => {
    const posts = await getPosts();
    const paths = posts.reduce((acc: { params: { slug: string } }[], post) => {
        if(post.slug) {
            return [...acc, { params: { slug: post.slug } }]
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
    if(!params) {
        return notFoundProps;
    }
    const { slug } = params;
    const posts = await getPosts(slug);
    const post = posts.shift();
    if(!post) {
        return notFoundProps;
    }
    const contents = await getPostContents(post);
    post.contents = contents;
    return {
        props: {
            post
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