'use client';

import Link from 'next/link';
import { FaGithub, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';

const SOCIAL_LINKS = [
  {
    icon: FaGithub,
    href: 'https://github.com/pathfinder-corp',
    label: 'GitHub',
  },
  {
    icon: FaLinkedinIn,
    href: 'https://linkedin.com/',
    label: 'LinkedIn',
  },
  {
    icon: FaXTwitter,
    href: 'https://twitter.com/',
    label: 'Twitter',
  },
];

const FOOTER_LINKS = {
  product: [
    { label: 'Roadmap Generator', href: '/roadmap' },
    { label: 'Career Assessment', href: '/assessment' },
    { label: 'Mentor Matching', href: '/mentors' },
    { label: 'Learning Paths', href: '/roadmap' },
    { label: 'AI Insights', href: '/about-ai' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'About AI', href: '/about-ai' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '#' },
    { label: 'Partners', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Data Protection', href: '#' },
    { label: 'Accessibility', href: '#' },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1100px] px-8 py-20">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-4xl font-bold tracking-tight transition-colors hover:text-neutral-300"
            >
              Pathfinder.
            </Link>
            <p className="mt-6 text-lg leading-relaxed text-neutral-400">
              Navigate your career journey with AI-powered insights.
              Your future, intelligently mapped.
            </p>
            <div className="mt-8 flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-xl font-semibold">Product</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.product.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-lg text-neutral-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xl font-semibold">Company</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-lg text-neutral-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xl font-semibold">Legal</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-lg text-neutral-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-neutral-800 pt-10 md:flex-row">
          <p className="text-lg text-neutral-500">
            © {new Date().getFullYear()} Pathfinder. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-lg text-neutral-400">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
