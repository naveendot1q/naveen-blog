'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugifyHeading } from '@/lib/slugifyHeading'

// Extract text from react-markdown's children (can be string, array, or node)
function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) {
    return children.map((c) => childrenToText(c)).join('')
  }
  if (children && typeof children === 'object' && 'props' in (children as object)) {
    return childrenToText((children as { props: { children: React.ReactNode } }).props.children)
  }
  return ''
}

// A single generic heading renderer used for h1-h4
function HeadingRenderer({
  level,
  children,
}: {
  level: 1 | 2 | 3 | 4
  children?: React.ReactNode
}) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
  const id = slugifyHeading(childrenToText(children))
  return (
    <Tag id={id} className="scroll-mt-24">
      {children}
    </Tag>
  )
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h1: ({ children }: any) => <HeadingRenderer level={1}>{children}</HeadingRenderer>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h2: ({ children }: any) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h3: ({ children }: any) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h4: ({ children }: any) => <HeadingRenderer level={4}>{children}</HeadingRenderer>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
