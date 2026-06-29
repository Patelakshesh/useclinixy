import { Metadata } from 'next';
import Link from 'next/link';
import { Activity, ArrowRight, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'FAQ - Clinixy | Clinic Management Software Questions Answered',
  description: 'Frequently asked questions about Clinixy clinic management software. Learn about pricing, EMR features, appointment booking, data security, and getting started.',
  keywords: [
    'clinic management software FAQ',
    'Clinixy FAQ',
    'clinic software questions',
    'EMR software India FAQ',
    'doctor appointment software help',
    'clinic software pricing questions',
    'how to use clinic management software',
    'patient management software India',
  ],
  alternates: {
    canonical: 'https://useclinixy.online/faq',
  },
  openGraph: {
    title: 'FAQ - Clinixy | Clinic Management Software Questions Answered',
    description: 'Get answers to the most common questions about Clinixy clinic management software for doctors in India.',
    url: 'https://useclinixy.online/faq',
    siteName: 'Clinixy',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Clinixy FAQ' }],
  },
};

const faqs = [
  {
    question: 'What is Clinixy and who is it for?',
    answer: 'Clinixy is a cloud-based clinic management software designed specifically for doctors and medical clinics in India. It helps you manage patient appointments, electronic medical records (EMR), billing, staff, and more — all from one simple dashboard. It is ideal for solo practitioners, multi-doctor clinics, and polyclinics of all sizes.',
  },
  {
    question: 'How much does Clinixy cost?',
    answer: 'Clinixy offers a free 14-day trial with no credit card required. After the trial, you can choose from our affordable monthly plans starting at just ₹999/month. All plans include appointment booking, patient management, and billing. Visit our Pricing page to see all plan details.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! Every new clinic gets a full 14-day free trial with access to all features. No credit card is required to start. You can set up your clinic, add patients, and test all features completely free for 14 days.',
  },
  {
    question: 'Can I use Clinixy on my mobile phone?',
    answer: 'Yes. Clinixy is fully responsive and works perfectly on all devices — smartphones, tablets, laptops, and desktop computers. You and your staff can access the clinic dashboard from any device with an internet connection.',
  },
  {
    question: 'How secure is my patient data on Clinixy?',
    answer: 'Patient data security is our top priority. Clinixy uses industry-standard encryption (HTTPS/TLS) for all data transmission, stores data on secure cloud servers, uses httpOnly cookies for authentication to prevent XSS attacks, and implements strict multi-tenant data isolation — meaning it is technically impossible for one clinic to access another clinic\'s patient data.',
  },
  {
    question: 'Can I add multiple doctors to one clinic account?',
    answer: 'Yes. Clinixy fully supports multi-doctor clinics and polyclinics. You can add multiple doctors, each with their own separate schedule, patient queue, and fee structure. The clinic admin gets a bird\'s-eye view of all doctors and appointments from a single dashboard.',
  },
  {
    question: 'Does Clinixy support electronic prescriptions?',
    answer: 'Yes. Clinixy allows doctors to create and print professional digital prescriptions directly from the software. You can add medicines, dosage instructions, and doctor\'s notes. This eliminates illegible handwriting and makes the process faster for both the doctor and the patient.',
  },
  {
    question: 'What is a UHID and does Clinixy generate it?',
    answer: 'UHID stands for Unique Health ID. It is a unique identification number assigned to each patient in your clinic for easy tracking and retrieval of their medical history. Yes — Clinixy automatically generates a UHID for every new patient you register.',
  },
  {
    question: 'Can patients book appointments online?',
    answer: 'Yes. Every clinic on Clinixy gets a free online booking portal that patients can access 24/7. Patients can book their own appointments without calling the clinic, which reduces the receptionist\'s workload and significantly reduces patient no-shows.',
  },
  {
    question: 'How long does it take to set up Clinixy for my clinic?',
    answer: 'Most clinics are fully set up and operational within 30 minutes to 2 hours. Our registration wizard guides you step by step through adding your clinic details, setting your working hours, adding your doctors, and registering your first patients. No technical knowledge is required.',
  },
  {
    question: 'Is Clinixy suitable for small single-doctor clinics?',
    answer: 'Absolutely. Clinixy is designed to be equally powerful for a single-doctor general practice as it is for a large multi-specialty polyclinic. Our Starter plan is specifically priced for small clinics. Many solo practitioners use Clinixy to replace paper registers and spreadsheets.',
  },
  {
    question: 'Does Clinixy work without internet?',
    answer: 'Clinixy is a cloud-based system and requires an internet connection to work. However, a basic 4G mobile internet connection is sufficient. We recommend all clinic computers and tablets are connected to WiFi for the best experience.',
  },
  {
    question: 'Can I export or download my patient data?',
    answer: 'Yes. You always own your data. Clinixy allows clinic admins to export patient records and reports. If you ever decide to stop using Clinixy, you can download a complete copy of all your patient data.',
  },
  {
    question: 'How is Clinixy different from Practo?',
    answer: 'Practo is primarily a patient-facing platform where patients discover doctors. Clinixy is a clinic-first management system built for the doctor and clinic staff to internally manage operations — appointments, EMR, billing, and staff. Clinixy is also significantly more affordable for independent clinics and gives you full control over your data without dependency on a large marketplace platform.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function FAQPage() {
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
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/register-clinic" className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs sm:text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1">
              Start Free <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm mb-6 border border-blue-100 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Got Questions? We Have Answers.
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Clinixy clinic management software. Can't find the answer? Contact us anytime.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-200 dark:hover:border-blue-800 transition-colors duration-200"
            >
              <summary className="flex items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer list-none select-none">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors pr-2">
                  {faq.question}
                </h2>
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed pt-4">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 text-center">
          <h2 className="text-xl sm:text-3xl font-black text-white mb-3">Still have questions?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto text-sm sm:text-base">
            Start your free 14-day trial and explore Clinixy yourself. No credit card required. Setup takes under 30 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register-clinic" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-blue-700 font-bold hover:bg-blue-50 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/30 text-sm sm:text-base">
              Start Free 14-Day Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 transition-all text-sm sm:text-base border border-white/30">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
