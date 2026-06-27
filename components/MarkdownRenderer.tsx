'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { slugifyHeading } from '@/lib/slugifyHeading'

function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(c => childrenToText(c)).join('')
  if (children && typeof children === 'object' && 'props' in (children as object))
    return childrenToText((children as { props: { children: React.ReactNode } }).props.children)
  return ''
}

function HeadingRenderer({ level, children }: { level: 1|2|3|4; children?: React.ReactNode }) {
  const Tag = `h${level}` as 'h1'|'h2'|'h3'|'h4'
  const id = slugifyHeading(childrenToText(children))
  return <Tag id={id} className="scroll-mt-24">{children}</Tag>
}

// Use a cast to Components so react-markdown accepts our renderers
// without requiring the exact internal prop signature
const mdComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <HeadingRenderer level={1}>{children}</HeadingRenderer>,
  h2: ({ children }: { children?: React.ReactNode }) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
  h3: ({ children }: { children?: React.ReactNode }) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
  h4: ({ children }: { children?: React.ReactNode }) => <HeadingRenderer level={4}>{children}</HeadingRenderer>,
} as Components

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
