import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-muted-foreground">
            &copy; {currentYear} LinkChecker. All rights reserved.
          </div>
          <div className="text-sm text-muted-foreground">
            Created by{' '}
            <Link
              href="https://github.com/isixe"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              isixe
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
