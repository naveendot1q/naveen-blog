import BlogAuthBar from '@/components/BlogAuthBar'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogAuthBar />
      {children}
    </>
  )
}
