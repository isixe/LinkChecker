import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { LinkChecker } from '@/components/link-checker'
import { Toaster } from '@/components/ui/toaster'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <LinkChecker />
        </div>
      </main>
      <Toaster />
      <Footer />
    </div>
  )
}
