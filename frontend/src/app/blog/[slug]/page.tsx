import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts, getBlogPost } from '@/lib/blog-posts';
import { Activity, ArrowRight, Clock, ArrowLeft, Tag, Calendar, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: 'Post Not Found - Clinixy Blog' };
  }

  return {
    title: `${post.title} | Clinixy Blog`,
    description: post.description,
    keywords: post.tags.join(', '),
    alternates: {
      canonical: `https://useclinixy.online/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://useclinixy.online/blog/${post.slug}`,
      siteName: 'Clinixy',
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Clinixy',
      logo: { '@type': 'ImageObject', url: 'https://useclinixy.online/icon.png' },
    },
    url: `https://useclinixy.online/blog/${post.slug}`,
    keywords: post.tags.join(', '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://useclinixy.online/blog/${post.slug}` },
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">Clinixy</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <ThemeToggle />
            <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Blog</span>
            </Link>
            <Link href="/register-clinic" className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs sm:text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1">
              Start Free <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 dark:text-slate-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-400 line-clamp-1 max-w-[200px] sm:max-w-none">{post.title}</span>
        </nav>

        {/* Post Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-slate-400 text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {post.readTime}
            </span>
            <span className="flex items-center gap-1 text-slate-400 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="text-4xl sm:text-5xl mb-4">{post.coverEmoji}</div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            {post.description}
          </p>

          <div className="flex items-center gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{post.author}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{post.authorRole}</p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
          <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mr-1">
            <Tag className="w-4 h-4" /> Tags:
          </span>
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-14 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-7 sm:p-10 text-center">
          <h2 className="text-lg sm:text-2xl font-black text-white mb-3">Ready to modernize your clinic?</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto text-sm sm:text-base">Start your free 14-day trial of Clinixy. No credit card needed. Setup in under 5 minutes.</p>
          <Link href="/register-clinic" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-white text-blue-700 font-bold hover:bg-blue-50 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/30 text-sm sm:text-base">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-6">More Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {relatedPosts.map(related => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="group block">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl mb-3">{related.coverEmoji}</div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 text-sm sm:text-base">
                      {related.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{related.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
