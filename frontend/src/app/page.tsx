'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, CheckCircle2, LayoutDashboard, Shield, Activity, Star, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const floatAnimation = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Clinixy",
    "operatingSystem": "Web",
    "applicationCategory": "HealthApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "14-Day Free Trial"
    },
    "description": "Clinixy is the ultimate SaaS platform for doctors and medical clinics. Automate appointment scheduling, patient management, staff coordination, and billing all in one place.",
    "url": "https://useclinixy.online"
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden selection:bg-blue-500/30 font-sans transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight transition-colors">Clinixy</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            <ThemeToggle />
            <Link 
              href="/login" 
              className="text-sm sm:text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/register-clinic" 
              className="px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold transition-all hover:shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-white/20 hover:-translate-y-0.5 flex items-center gap-1 sm:gap-2 text-xs sm:text-base whitespace-nowrap"
            >
              Start Free <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-40 sm:pt-48 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative min-h-screen flex items-center">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[5%] md:left-[10%] w-64 h-64 md:w-[500px] md:h-[500px] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-40 right-[5%] md:right-[10%] w-72 h-72 md:w-[600px] md:h-[600px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[100px]" 
          />
        </div>

        <motion.div 
          className="text-center max-w-5xl mx-auto w-full"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-semibold text-sm mb-8 sm:mb-10 border border-blue-100 dark:border-blue-900/50 shadow-sm shadow-blue-900/5 dark:shadow-none transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            Clinixy is Live
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-8 transition-colors">
            The Future of <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Clinic Management</span>
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-lg sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-10 sm:mb-12 leading-relaxed max-w-3xl mx-auto font-medium transition-colors">
            Automate patient booking, manage doctor schedules, and scale your practice with an intelligent, all-in-one SaaS platform.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link 
              href="/register-clinic"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base sm:text-lg transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Start 14-Day Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-lg transition-all shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 border border-slate-200 dark:border-slate-800 flex items-center justify-center"
            >
              See How It Works
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Floating UI Mockup Section */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative -mt-20 hidden md:block">
        <motion.div 
          variants={floatAnimation}
          initial="initial"
          animate="animate"
          className="relative rounded-[2.5rem] bg-white dark:bg-slate-900 p-4 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/50 dark:border-slate-800 mx-auto max-w-5xl transition-colors"
        >
          <div className="rounded-[2rem] bg-slate-900 dark:bg-slate-950 overflow-hidden aspect-[16/9] relative border border-slate-800 dark:border-slate-800/50">
            {/* Fake UI Header */}
            <div className="h-14 border-b border-slate-800 flex items-center px-6 gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="h-6 w-64 bg-slate-800 rounded-md ml-4"></div>
            </div>
            {/* Real Dashboard Image Placeholder */}
            <div className="relative w-full h-[500px] overflow-hidden bg-slate-900">
              <img 
                src="/dashboard-preview.png" 
                alt="Clinixy Dashboard Preview" 
                className="w-full h-full object-cover object-top opacity-90 transition-opacity hover:opacity-100"
                onError={(e) => {
                  // Fallback if they haven't uploaded the image yet
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-slate-500">
                      <p>Please take a screenshot of your dashboard</p>
                      <p>and save it as <b>public/dashboard-preview.png</b></p>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust & Features Section */}
      <section id="features" className="py-32 bg-white dark:bg-slate-950 relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight transition-colors">Built for modern practices</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium transition-colors">Everything you need to run your clinic smoothly, from patient onboarding to daily schedule management.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-7 h-7 text-amber-500" />}
              title="Lightning Fast"
              description="Built on cutting-edge tech. Pages load instantly, keeping your front desk moving at top speed."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Calendar className="w-7 h-7 text-blue-600 dark:text-blue-400" />}
              title="Smart Booking"
              description="Patients book 24/7. Automated SMS/Email reminders reduce costly no-shows by up to 45%."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />}
              title="Multi-Doctor"
              description="Manage endless staff members. Each doctor gets their own dashboard, schedule, and permissions."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* How it Works / Subdomain Feature */}
      <section className="py-32 bg-slate-950 dark:bg-slate-900 text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-950 dark:to-slate-900" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold text-sm mb-6 border border-indigo-500/20">
                <Star className="w-4 h-4" /> Premium Branding
              </div>
              <h2 className="text-4xl sm:text-6xl font-black mb-8 leading-tight">Your own dedicated <br/>clinic portal</h2>
              <p className="text-slate-400 text-xl mb-10 leading-relaxed font-medium">
                When you join Clinixy, you instantly get a custom, enterprise-grade web address (e.g., <strong className="text-white">apollo.useclinixy.online</strong>). Look like a massive hospital network, even if you are a solo practitioner.
              </p>
              <ul className="space-y-6">
                {[
                  { title: 'Instant Custom Subdomain', desc: 'Go live in 60 seconds with your brand.' },
                  { title: 'White-labeled Booking', desc: 'Patients never see competitor clinics.' },
                  { title: 'Mobile-Optimized', desc: 'Looks like a native app on phones.' }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-300">
                    <div className="mt-1 bg-indigo-500/20 p-2 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{item.title}</h4>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative hidden md:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl transform rotate-6 scale-105 opacity-30 blur-2xl"></div>
              <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <Shield className="w-6 h-6 text-emerald-400" /> 
                  <span className="text-slate-300 font-mono">https://</span>
                  <span className="text-white font-mono font-bold">apollo</span>
                  <span className="text-slate-500 font-mono">.useclinixy.online</span>
                </div>
                <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img 
                    src="/booking-preview.png" 
                    alt="Patient Booking Preview" 
                    className="w-full h-full object-cover object-top opacity-90 transition-opacity hover:opacity-100"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full text-slate-500 text-sm text-center px-4">
                          <p>Take a screenshot of the patient booking page</p>
                          <p>and save it as <b>public/booking-preview.png</b></p>
                        </div>
                      `;
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white dark:bg-slate-950 relative transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-8 transition-colors">Ready to upgrade your clinic?</h2>
          <p className="text-2xl text-slate-500 dark:text-slate-400 mb-12 transition-colors">Join hundreds of modern doctors using Clinixy today.</p>
          <Link 
            href="/register-clinic"
            className="inline-flex px-12 py-6 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xl transition-all shadow-2xl hover:shadow-slate-900/30 dark:hover:shadow-white/20 hover:-translate-y-1 items-center justify-center gap-3"
          >
            Start 14-Day Free Trial <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity mb-4">
              <Activity className="w-6 h-6 text-slate-900 dark:text-white" />
              <span className="font-black text-xl text-slate-900 dark:text-white transition-colors">Clinixy</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
              The modern operating system for medical clinics. Automate scheduling, manage patients, and scale your practice.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Specialties</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li><Link href="/software-for/dentists" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Software for Dentists</Link></li>
              <li><Link href="/software-for/pediatricians" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Software for Pediatricians</Link></li>
              <li><Link href="/software-for/chiropractors" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Software for Chiropractors</Link></li>
              <li><Link href="/software-for/physiotherapists" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Software for Physiotherapists</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li><Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/register-clinic" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Register Clinic</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 font-medium text-sm text-center md:text-left">
            © {new Date().getFullYear()} Clinixy. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 dark:from-blue-900/10 to-indigo-50 dark:to-indigo-900/10 rounded-bl-[4rem] -z-10 transition-transform duration-500 group-hover:scale-110"></div>
      
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md shadow-slate-200 dark:shadow-none border border-slate-50 dark:border-slate-700 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight transition-colors">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed transition-colors">{description}</p>
    </motion.div>
  );
}
