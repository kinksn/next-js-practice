import { Post, Content } from "@/lib/types";
import { FC } from 'react';
import styles from './index.module.css';
import { Highlight } from 'prism-react-renderer';

type ContentComponentProps = {
  post: Post;
  content: Content;
  index: number;
}

const key = (postId: string, index: number) =>  `${postId}_${index}`;

export const Heading2: FC<ContentComponentProps> = ({ post, content, index }) => {
  return (
    <h2 key={key(post.id, index)} className={styles.heading2}>
      {content.text}
    </h2>
  )
}
export const Heading3: FC<ContentComponentProps> = ({ post, content, index }) => {
  return (
    <h3 key={key(post.id, index)} className={styles.heading3}>
      {content.text}
    </h3>
  )
}

export const Paragraph: FC<ContentComponentProps> = ({ post, content, index }) => {
  return (
    <p key={key(post.id, index)} className={styles.paragraph}>
      {content.text}
    </p>
  )
}

export const Quote: FC<ContentComponentProps> = ({ post, content, index }) => {
  return (
    <blockquote key={key(post.id, index)} className={styles.quote}>
      {content.text}
    </blockquote>
  )
}

export const PostImage: FC<ContentComponentProps>  = ({ post, content, index }) => {
  if(!content.text) return;
  
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={content.text}
      style={{
        maxWidth: 400,
        height: 'auto'
      }}
      key={key(post.id, index)}
      alt=""
    />
  )
}

export const Code: FC<ContentComponentProps> = ({ post, content, index }) => {
  if (content.type !== 'code') return;
  if (!content.text || !content.language) return;
  
  return (
      <Highlight code={content.text} language={content.language} key={post.id}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre key={`${className}_${key(post.id, index)}`} className={className} style={style}>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line })} key={`${i}_${key(post.id, index)}`}>
                {line.map((token, tokenKey) => (
                  <span {...getTokenProps({ token })} key={`${tokenKey}_${key(post.id, index)}`} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
  )
}

export const RenderPostContents: FC<ContentComponentProps> = ({ post, content, index }) => {
  const renderContent = () => {
    switch(content.type) {
      case 'heading_2':
        return <Heading2 post={post} content={content} index={index} key={key(post.id, index)} />
      case 'heading_3':
        return <Heading3 post={post} content={content} index={index} key={key(post.id, index)} />
      case 'paragraph':
        return <Paragraph post={post} content={content} index={index} key={key(post.id, index)} />
      case 'code':
        return <Code post={post} content={content} index={index} key={key(post.id, index)} />
      case 'quote':
        return <Quote post={post} content={content} index={index} key={key(post.id, index)} />
      case 'image':
        return <PostImage post={post} content={content} index={index} key={key(post.id, index)} />
    }
  }

  return (
    <>
      {renderContent()}
    </>
  )
}