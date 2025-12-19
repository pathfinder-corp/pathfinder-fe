'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';

const SOCIAL_LINKS = [
  { icon: Github, href: 'https://github.com/pathfinder', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/pathfinder', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/pathfinder', label: 'Twitter' }
];

const FOOTER_LINKS = {
  product: [
    { label: 'Roadmap Generator', href: '/roadmap' },
    { label: 'Career Assessment', href: '/assessment' },
    { label: 'Mentor Matching', href: '/mentors' },
    { label: 'Learning Paths', href: '/roadmap' },
    { label: 'AI Insights', href: '/about-ai' }
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'About AI', href: '/about-ai' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '#' },
    { label: 'Partners', href: '#' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Data Protection', href: '#' },
    { label: 'Accessibility', href: '#' }
  ]
};

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-[1100px] mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link href="/" className="text-4xl font-bold tracking-tight hover:text-neutral-300 transition-colors">
              Pathfinder.
            </Link>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
              AI-Powered Academic and Career Pathway Recommendation System. 
              Guide your future with intelligent insights.
            </p>
            <div className="flex items-center gap-4 mt-8">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-6">Product</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.product.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-lg text-neutral-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.company.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-lg text-neutral-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.legal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-lg text-neutral-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-lg text-neutral-500">
            © {new Date().getFullYear()} Pathfinder. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-lg text-neutral-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}