import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog-posts';
import { Activity, ArrowRight, Clock, Tag, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Blog - Clinixy | Clinic Management Insights for Doctors in India',
  description: 'Expert guides and tips on clinic management, patient management software, digital EMR, and appointment booking systems for doctors and clinics in India.',
  alternates: {
    canonical: 'https://useclinixy.online/blog',
  },
  openGraph: {
    title: 'Blog - Clinixy | Clinic Management Insights',
    description: 'Expert guides and tips on clinic management, patient management software, and digital EMR for Indian clinics.',
    url: 'https://useclinixy.online/blog',
    siteName: 'Clinixy',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Clinixy Blog',
  description: 'Expert guides and tips on clinic management, patient management software, and digital EMR for doctors in India.',
  url: 'https://useclinixy.online/blog',
  publisher: {
    '@type': 'Organization',
    name: 'Clinixy',
    logo: {
      '@type': 'ImageObject',
      url: 'https://useclinixy.online/icon.png',
    },
  },
};

const categoryColors: Record<string, string> = {
  'Clinic Management': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Digital Health': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Clinic Operations': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">Clinixy</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <ThemeToggle />
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Link href="/register-clinic" className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1">
              Start Free <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm mb-6 border border-blue-100 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Expert Insights for Clinics
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Clinic Management Blog
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Practical guides for doctors and clinic owners on improving patient management, reducing workload, and growing your practice.
          </p>
        </div>

        {/* Featured Post */}
        <Link href={`/blog/${featured.slug}`} className="group block mb-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12 shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-1">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4 backdrop-blur-sm">
                ✨ Featured Article
              </span>
              <div className="text-5xl mb-4">{featured.coverEmoji}</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight group-hover:text-blue-100 transition-colors">
                {featured.title}
              </h2>
              <p className="text-blue-100 text-base mb-6 max-w-2xl line-clamp-2">
                {featured.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Clock className="w-4 h-4" />
                  {featured.readTime}
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Tag className="w-4 h-4" />
                  {featured.category}
                </div>
                <div className="ml-auto flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Rest of posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-7 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-950/60 hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4">{post.coverEmoji}</div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-slate-100 text-slate-600'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-5">
                  {post.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-12">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Transform Your Clinic?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join hundreds of doctors across India who are already saving 3+ hours every day with Clinixy.</p>
          <Link href="/register-clinic" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
            Start Free 14-Day Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
