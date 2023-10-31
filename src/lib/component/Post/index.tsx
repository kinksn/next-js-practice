import { FC } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Post } from "@/lib/types";
import styles from './index.module.css';
import { Heading2, Heading3, Paragraph, Quote, Code, PostImage } from '@/lib/component/Post/postComponents';

export const PostComponent: FC<{
    post: Post | undefined
}> = ({ post }) => {
    if (!post) return;
    return (
      <div className={styles.post} key={post.id}>
        <h1 className={styles.title}>
          <Link
            href={`/post/${encodeURIComponent(
              post.slug ?? ''
            )}`}
          >
            {post.title}
          </Link>
        </h1>
        <div className={styles.timestampWrapper}>
          <div className={styles.timestamp}>
            作成日時： { dayjs(post.createdTs).format('YYYY-MM-DD HH:mm:ss') }
          </div>
          <div className={styles.timestamp}>
            更新日時： { dayjs(post.lastEditedTs).format('YYYY-MM-DD HH:mm:ss') }
          </div>
        </div>
        <div>
          {post.contents.map((content, index) => {
            const key = `${post.id}_${index}`;
            switch(content.type) {
              case 'heading_2':
                return <Heading2 post={post} content={content} index={index} key={key} />
              case 'heading_3':
                return <Heading3 post={post} content={content} index={index} key={key} />
              case 'paragraph':
                return <Paragraph post={post} content={content} index={index} key={key} />
              case 'code':
                return <Code post={post} content={content} index={index} key={key} />
              case 'quote':
                return <Quote post={post} content={content} index={index} key={key} />
              case 'image':
                return <PostImage post={post} content={content} index={index} key={key} />
            }
          })}
        </div>
      </div>
    )
  }
  