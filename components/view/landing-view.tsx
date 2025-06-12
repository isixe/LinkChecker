import { CheckCircle, Globe, Link2, Rss, Zap } from 'lucide-react'
import React, { ReactElement } from 'react'

type FeatureCardProps = {
  icon: ReactElement
  title: string
  description: string
  variant?: 'dark' | 'light'
}

const featureCards = [
  {
    icon: <Link2 />,
    title: 'Comprehensive Link Analysis',
    description:
      'Check all links on a webpage, categorize them as internal or external, and identify broken links in real-time with detailed reporting.',
    variant: 'light' as const
  },
  {
    icon: <Zap />,
    title: 'Real-time Checking',
    description:
      'See results as they come in with a beautiful progress indicator showing the status of each link check with live updates.',
    variant: 'light' as const
  },
  {
    icon: <Globe />,
    title: 'Domain Grouping',
    description:
      'Intelligently group links by domain to see which external sites are most frequently referenced and analyze your link patterns.',
    variant: 'light' as const
  },
  {
    icon: <Rss />,
    title: 'RSS Feed Discovery',
    description:
      'Automatically discover and validate RSS feeds linked on your page, helping you identify content syndication opportunities.',
    variant: 'light' as const
  }
]

const altFeatureCards = [
  {
    icon: <Link2 />,
    title: 'Batch Processing',
    description:
      'Analyze multiple pages simultaneously with our powerful batch processing feature. Perfect for large websites and comprehensive audits.',
    variant: 'light' as const
  },
  {
    icon: <Zap />,
    title: 'Detailed Link Reports',
    description:
      'Generate comprehensive reports listing all discovered links, grouped statistics, and issue summaries to help you quickly identify optimization priorities.',
    variant: 'light' as const
  }
]

const benefits: string[] = [
  'Instant broken link detection saves time and improves SEO',
  'Comprehensive reports help optimize your link strategy',
  'Real-time analysis provides immediate feedback',
  'Domain grouping reveals link patterns and opportunities'
]

const testimonials = [
  {
    quote:
      'LinkAnalyzer saved us hours of manual work. The broken link detection is incredibly accurate.',
    author: 'Sarah Chen',
    role: 'SEO Manager'
  },
  {
    quote:
      'The real-time analysis feature is fantastic. We can see results instantly as the tool works.',
    author: 'Mike Rodriguez',
    role: 'Web Developer'
  },
  {
    quote:
      'Domain grouping helped us identify which external sites we link to most. Great insights!',
    author: 'Emma Watson',
    role: 'Content Strategist'
  }
]

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  variant = 'dark'
}) => {
  const isDark = variant === 'dark'
  const cardClass =
    'group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ' +
    (isDark
      ? 'bg-black text-white'
      : 'border border-gray-200 bg-white text-black')
  const iconBgClass = isDark ? 'bg-white/10' : 'bg-black/10'
  const iconColorClass = isDark ? 'text-white' : 'text-black'
  const descClass =
    'leading-relaxed ' + (isDark ? 'text-gray-300' : 'text-gray-600')
  const circleBgClass =
    'absolute -bottom-10 -right-10 h-32 w-32 rounded-full transition-transform duration-500 group-hover:scale-150 ' +
    (isDark ? 'bg-white/5' : 'bg-black/5')

  return (
    <div className={cardClass}>
      <div className="relative z-10">
        <div className={`mb-4 inline-flex rounded-xl p-3 ${iconBgClass}`}>
          {React.cloneElement(icon, { className: `h-6 w-6 ${iconColorClass}` })}
        </div>
        <h3 className="mb-3 text-xl font-bold">{title}</h3>
        <p className={descClass}>{description}</p>
      </div>
      <div className={circleBgClass}></div>
    </div>
  )
}

const LandingPage: React.FC = () => {
  const containerClass = 'mx-auto max-w-7xl'
  const sectionClass = 'bg-white px-6 md:py-20 py-10'

  return (
    <div className="min-h-screen bg-white">
      {/* Features Section */}
      <section className="px-6 py-10 md:py-20">
        <div className={containerClass}>
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold text-black md:text-4xl">
              Powerful Features
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Everything you need to analyze and optimize your website&#39;s
              link structure
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
            {featureCards.map((card, idx) => (
              <FeatureCard key={idx} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={sectionClass}>
        <div className={containerClass}>
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h3 className="mb-6 text-3xl font-bold text-black">
                Why Choose LinkAnalyzer?
              </h3>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-black" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Analysis Progress
                    </span>
                    <span className="text-sm font-semibold text-black">
                      85%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-black"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                      <div className="text-2xl font-bold text-black">147</div>
                      <div className="text-sm text-gray-600">Links Found</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 text-center">
                      <div className="text-2xl font-bold text-black">3</div>
                      <div className="text-sm text-gray-600">Broken Links</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Features Section */}
      <section className={sectionClass}>
        <div className={containerClass}>
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold text-black md:text-4xl">
              Built for Professionals
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Advanced tools for comprehensive website analysis
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
            {altFeatureCards.map((card, idx) => (
              <FeatureCard key={idx} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={sectionClass}>
        <div className={containerClass}>
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold text-black md:text-4xl">
              What Our Users Say
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
              >
                <p className="mb-4 italic text-gray-700">
                  &#39;{testimonial.quote}&#39;
                </p>
                <div>
                  <div className="font-semibold text-black">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
