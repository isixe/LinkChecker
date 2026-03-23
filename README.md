# LinkChecker

<p align="center">
<img src="https://raw.githubusercontent.com/isixe/LinkChecker/refs/heads/main/public/favicon.ico" alt="LinkChecker" width="100" height="100">
</p>

<p align="center">
  A powerful tool for checking the validity of URLs in your website. Ensure all links are working correctly.
</p>


## Features

- **URL Validation** - Check the validity of any URL in real-time
- **Link Categorization** - Identify internal, external, and broken links
- **Domain Grouping** - Group links by domain to see which external sites are most frequently referenced
- **RSS Feed Validation** - Discover and validate RSS feeds

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **UI Library**: [Shadcn-ui](https://shadcn-ui.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Animations**: [Framer Motion](https://www.framer.com/motion)
- **Icons**: [Lucide React](https://lucide.dev)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/isixe/LinkChecker.git
   ```

2. Navigate to the project directory:

   ```sh
   cd LinkChecker
   ```

3. Install dependencies:

   ```sh
   pnpm install
   ```

### Usage

Start the development server:

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
LinkChecker/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── link/         # Link check API
│   │   └── rss/          # RSS check API
│   ├── data/             # Static data
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── icons/            # Icon components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── view/             # View components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── styles/               # Global styles
└── type/                 # TypeScript type definitions
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.