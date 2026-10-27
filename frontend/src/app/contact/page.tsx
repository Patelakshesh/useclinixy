import { Metadata } from 'next';
import Link from 'next/link';
import { Activity, ArrowLeft, Mail, MessageCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Contact Us - Clinixy | Get Support for Clinic Management Software',
  description: 'Contact the Clinixy team for support, demo requests, or partnership inquiries. We help clinics across India, Philippines, Hong Kong, and UAE get started with digital clinic management.',
  alternates: {
    canonical: 'https://useclinixy.online/contact',
  },
  openGraph: {
    title: 'Contact Clinixy | Clinic Management Software Support',
    description: 'Get in touch with the Clinixy team. We are here to help your clinic go digital.',
    url: 'https://useclinixy.online/contact',
    siteName: 'Clinixy',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Clinixy',
  url: 'https://useclinixy.online/contact',
  description: 'Contact the Clinixy team for clinic management software support, demo requests, and partnership inquiries.',
  mainEntity: {
    '@type': 'Organization',
    name: 'Clinixy',
    url: 'https://useclinixy.online',
    email: 'aksheshpatel97@gmail.com',
    telephone: '+91-94080-26510',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'aksheshpatel97@gmail.com',
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
        areaServed: ['IN', 'PH', 'HK', 'AE', 'AU'],
      },
    ],
  },
};

export default function ContactPage() {
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
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
              Clinixy
            </span>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm mb-6 border border-blue-100 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            We reply within 24 hours
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Have questions about Clinixy? Want a free demo for your clinic? We are here to help doctors across India, Philippines, Hong Kong, UAE, and Australia go digital.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {/* Email */}
              <a
              href="mailto:aksheshpatel97@gmail.com"
              className="flex items-start gap-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Email Us</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold text-base">aksheshpatel97@gmail.com</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">For support, demo requests, and general inquiries</p>
              </div>
            </a>

            {/* WhatsApp */}
              <a
              href="https://wa.me/919408026510"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">WhatsApp Support</h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-base">+91-94080-26510</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Fastest way to get help — we reply within hours</p>
              </div>
            </a>

            {/* Response Time */}
            <div className="flex items-start gap-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Response Time</h3>
                <p className="text-amber-600 dark:text-amber-400 font-semibold text-base">Within 24 hours</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monday to Saturday, 9 AM – 7 PM IST</p>
              </div>
            </div>

            {/* Serving */}
            <div className="flex items-start gap-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <MapPin className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Serving Clinics In</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['🇮🇳 India', '🇵🇭 Philippines', '🇭🇰 Hong Kong', '🇦🇪 UAE', '🇦🇺 Australia'].map((country) => (
                    <span key={country} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Send us a message</h2>
            <form
              action="https://formsubmit.co/aksheshpatel97@gmail.com"
              method="POST"
              className="space-y-5"
            >
              <input type="hidden" name="_subject" value="New Contact Form Submission - Clinixy" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_next" value="https://useclinixy.online/contact?sent=true" />

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Dr. John Smith"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="doctor@yourclinic.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What can we help with?
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="demo">Request a Free Demo</option>
                  <option value="support">Technical Support</option>
                  <option value="pricing">Pricing & Plans</option>
                  <option value="partnership">Partnership / Reseller</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your clinic — number of doctors, specialty, city, and what you need help with..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Send Message <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-xs text-slate-400 text-center">
                We typically respond within 24 hours. Your information is kept private.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-12">
          <h2 className="text-3xl font-black text-white mb-4">Ready to try Clinixy?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Start your free 14-day trial today. No credit card required. Set up in under 5 minutes.
          </p>
          <Link
            href="/register-clinic"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-blue-600 font-bold text-lg transition-all hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-0.5"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
