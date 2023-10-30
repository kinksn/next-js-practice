import { FC } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from "@/lib/types";
import styles from './index.module.css';
import { Highlight } from 'prism-react-renderer';

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
                return(
                  <h2 key={key} className={styles.heading2}>
                    {content.text}
                  </h2>
                );
              case 'heading_3':
                return(
                  <h3 key={key} className={styles.heading3}>
                    {content.text}
                  </h3>
                );
              case 'paragraph':
                return(
                  <p key={key} className={styles.paragraph}>
                    {content.text}
                  </p>
                );
              case 'code':
                if (!content.text || !content.language) {
                  return null;
                }
                return (
                  <Highlight code={content.text} language={content.language} key={`highlight_${index}`}>
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre key={key} className={className} style={style}>
                        {tokens.map((line, i) => (
                          <div {...getLineProps({ line })} key={`${key}_line_${i}`}>
                            {line.map((token, tokenKey) => (
                              <span {...getTokenProps({ token })} key={`${key}_token_${tokenKey}`} />
                            ))}
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                );
              case 'quote':
                return(
                  <blockquote key={key} className={styles.quote}>
                    {content.text}
                  </blockquote>
                );
              case 'image':
                if(!content.text) return;
                return(
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={content.text}
                      style={{
                        maxWidth: 400,
                        height: 'auto'
                      }}
                      key={key}
                      alt=""
                    />
                );
            }
          })}
        </div>
      </div>
    )
  }
  