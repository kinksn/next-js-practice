import { Client } from "@notionhq/client";
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { Content, Post, StaticProps } from "@/lib/types";

type NotionDatabase = QueryDatabaseResponse | undefined;

const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

const getDatabase = async (params: any): Promise<NotionDatabase> => {
  try {
    return await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID ?? '',
    ...params
    })
  } catch(error) {
    console.error(`Error query notion database: ${error}`);
    return undefined;
  }
}

const getQueryParams = (slug?: string) => {
  const defaultParam = {
    filter: {
    property: 'Published',
    checkbox: {
      equals: true
    }
    },
    sorts: [
      {
        timestamp: 'created_time',
        direction: 'descending'
      }
      ]
  };
  const existSlugParam = {
    filter: {
      property: 'Slug',
      rich_text: {
        equals: slug
      }
    }
  }

  if (slug) {
    return existSlugParam
  } else {
    return defaultParam
  }

}

export const getPosts = async (slug?: string) => {
  const queryParams = getQueryParams(slug);
  const database = await getDatabase(queryParams);

  if(!database) return [];

  return database.results.map((post) => {
    const defaultPost: Post = {
      id: post.id,
      title: null,
      slug: null,
      createdTs: null,
      lastEditedTs: null,
      contents: []
    };

    if(!('properties' in post)) return defaultPost;

    const title = post.properties['Name'].type === 'title'
      ? post.properties['Name'].title[0].plain_text
      : null;
    
    const slug = post.properties['Slug'].type === 'rich_text'
      ? post.properties['Slug'].rich_text[0].plain_text
      : null;
    
    return {
      ...defaultPost,
      title,
      slug,
      createdTs: post.created_time,
      lastEditedTs: post.last_edited_time
    }
  })
};

export const getPostContents = async (post: Post): Promise<Content[]> => {
  const blockResponse = await notion.blocks.children.list({
    block_id: post.id
  });

  return blockResponse.results
    .map((block) => {
      if (!('type' in block)) return;
      const type = block.type;
      let text: string | undefined;
      let language: string | undefined;

      switch (type) {
        case 'paragraph':
          text = block.paragraph.rich_text[0]?.plain_text;
          break;
        case 'heading_2':
          text = block.heading_2.rich_text[0]?.plain_text;
          break;
        case 'heading_3':
          text = block.heading_3.rich_text[0]?.plain_text;
          break;
        case 'quote':
          text = block.quote.rich_text[0]?.plain_text;
          break;
        case 'code':
          text = block.code.rich_text[0]?.plain_text;
          language = block.code.language;
          break;
        case 'image':
          if (block.image.type === 'external') {
            text = block.image.external.url
          }
          if (block.image.type === 'file') {
            text = block.image.file.url
          }
          break;
      }

      return {
        type,
        text: text ?? '',
        language: language ?? ''
      }
    }) as Content[];
};

export const getPostsInContents = async (slug?: string): Promise<Post[]> => {
  const posts = slug ? await getPosts(slug) : await getPosts();
  const postsInContents = await Promise.all(
    posts.map( async (post: Post) => {
      const contents = await getPostContents(post);

      return { ...post, contents };
    })
  );

  return postsInContents;
}