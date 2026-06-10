'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { slugifyHeading } from '@/lib/slugifyHeading'

// Build a heading component for a given level that adds a slug id
function makeHeading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as const

  // Return a component compatible with react-markdown's Components type
  const HeadingComponent = ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    // Flatten children to a plain string for the slug
    const text = Array.isArray(children)
      ? children
          .map((c) => (typeof c === 'string' ? c : ''))
          .join('')
      : typeof children === 'string'
      ? children
      : ''

    const id = slugifyHeading(text)

    return (
      <Tag id={id} className="scroll-mt-24" {...props}>
        {children}
      </Tag>
    )
  }

  HeadingComponent.displayName = `H${level}`
  return HeadingComponent
}

const components: Components = {
  h1: makeHeading(1),
  h2: makeHeading(2),
  h3: makeHeading(3),
  h4: makeHeading(4),
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
