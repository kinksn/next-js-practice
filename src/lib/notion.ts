import { Client } from "@notionhq/client";
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { Content, Post } from "@/lib/types";

const notion = new Client({
    auth: process.env.NOTION_TOKEN
  });

export const getPosts = async (slug?: string) => {
    let database: QueryDatabaseResponse | undefined = undefined;
  
    if(slug) {
      database = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID || '',
        filter: {
          and: [
            {
              property: 'Slug',
              rich_text: {
                equals: slug
              }
            }
          ]
        }
      })
    } else {
      database = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID || '',
        filter: {
          and: [
            {
              property: 'Published',
              checkbox: {
                equals: true
              }
            }
          ]
        },
        sorts: [
          {
            timestamp: 'created_time',
            direction: 'descending'
          }
        ]
      })
    }
    if(!database) return [];
  
    const posts: Post[] = [];
    database.results.forEach((page, index) => {
      if(!('properties' in page)) {
        posts.push({
          id: page.id,
          title: null,
          slug: null,
          createdTs: null,
          lastEditedTs: null,
          contents: []
        });
        return;
      }
  
      let title: string | null = null;
      if(page.properties['Name'].type === 'title') {
        title =
          page.properties['Name'].title[0]?.plain_text ?? null;
      }
    
      let slug: string | null = null;
      if(page.properties['Slug'].type === 'rich_text') {
        slug =
          page.properties['Slug'].rich_text[0]?.plain_text ?? null;
      }
    
      posts.push({
        id: page.id,
        title,
        slug,
        createdTs: page.created_time,
        lastEditedTs: page.last_edited_time,
        contents: []
      });
    });
    
    return posts;
  };
  
export const getPostContents = async (post: Post) => {
    const blockResponse = await notion.blocks.children.list({
        block_id: post.id
    });
    const contents: Content[] = [];
    blockResponse.results.forEach((block) => {
        if (!('type' in block)) {
            return;
        }
        switch (block.type) {
            case 'paragraph':
                contents.push({
                    type: block.type,
                    text:
                        block.paragraph.rich_text[0]
                            ?.plain_text ?? null
                });
                break;
            case 'heading_2':
                contents.push({
                    type: block.type,
                    text:
                        block.heading_2.rich_text[0]
                            ?.plain_text ?? null
                });
                break;
            case 'heading_3':
                contents.push({
                    type: block.type,
                    text:
                        block.heading_3.rich_text[0]
                            ?.plain_text ?? null
                });
                break;
            case 'quote':
                contents.push({
                    type: block.type,
                    text:
                        block.quote.rich_text[0]?.plain_text ??
                        null
                });
                break;
            case 'code':
                contents.push({
                    type: block.type,
                    text:
                        block.code.rich_text[0]?.plain_text ??
                        null,
                    language: block.code.language
                });
        }
    });
    return contents;
  };
  