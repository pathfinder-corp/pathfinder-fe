'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores';

import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const CONTACT_INFO = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'support@pathfinder.ai',
    description: 'We\'ll respond within 24 hours',
    href: 'mailto:support@pathfinder.ai'
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+84 123 456 789',
    description: 'Mon-Fri from 9am to 6pm',
    href: 'tel:+84123456789'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: 'Ho Chi Minh City, Vietnam',
    description: 'Innovation District, Tech Park',
    href: 'https://maps.google.com'
  },
  {
    icon: Clock,
    title: 'Working Hours',
    value: '9:00 AM - 6:00 PM',
    description: 'Monday to Friday (GMT+7)',
    href: null
  }
];

const FAQ_ITEMS = [
  {
    question: 'How does the AI-powered recommendation system work?',
    answer: 'Our AI analyzes your skills, interests, academic background, and career goals through comprehensive assessments. Using advanced machine learning algorithms, it generates personalized learning roadmaps and career pathway recommendations tailored specifically to your profile.'
  },
  {
    question: 'Is Pathfinder free to use?',
    answer: 'Pathfinder offers a free tier that includes basic assessments and roadmap generation. Premium features like mentorship connections, advanced analytics, and personalized coaching are available through our subscription plans.'
  },
  {
    question: 'How accurate are the career recommendations?',
    answer: 'Our recommendations are based on extensive data analysis from successful career trajectories, industry trends, and academic research. We continuously improve our algorithms based on user feedback and outcomes, achieving over 85% user satisfaction rate.'
  },
  {
    question: 'Can I connect with real mentors through the platform?',
    answer: 'Yes! Pathfinder connects you with verified mentors who are industry professionals and academic experts. You can browse mentor profiles, read reviews, and request mentorship based on your specific career goals.'
  },
  {
    question: 'How do I update my career preferences?',
    answer: 'You can update your preferences anytime through your profile settings or by retaking assessments. Our AI will regenerate recommendations based on your updated information to ensure relevance.'
  },
  {
    question: 'What industries does Pathfinder cover?',
    answer: 'Pathfinder covers a wide range of industries including Technology, Healthcare, Finance, Education, Engineering, Creative Arts, Business, and more. We continuously expand our database to include emerging fields and career paths.'
  }
];

export default function ContactPage() {
  const initializeUser = useUserStore((state) => state.initializeUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
      <PublicHeader />

      <div className="absolute inset-x-0 top-0 h-[800px] overflow-hidden">
        <BackgroundBeams />
      </div>

      <main className="relative z-10 pt-40">
        <section className="px-8 pb-24">
          <div className="max-w-[1100px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-lg text-neutral-300 mb-8"
            >
              <MessageSquare className="size-5" />
              Get in Touch
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-7xl md:text-8xl font-bold tracking-tight mb-8"
            >
              Let&apos;s Start a{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-neutral-200 to-neutral-500">
                Conversation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl text-neutral-400 max-w-4xl mx-auto leading-relaxed"
            >
              Have questions about your career pathway? Want to learn more about our AI-powered recommendations? 
              We&apos;re here to help you navigate your future.
            </motion.p>
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CONTACT_INFO.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  {info.href ? (
                    <a
                      href={info.href}
                      target={info.href.startsWith('http') ? '_blank' : undefined}
                      rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block h-full p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all duration-300 group"
                    >
                      <ContactInfoContent info={info} />
                    </a>
                  ) : (
                    <div className="h-full p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all duration-300 group">
                      <ContactInfoContent info={info} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="mb-10">
                  <h2 className="text-5xl font-bold mb-4">Send us a Message</h2>
                  <p className="text-xl text-neutral-400">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-xl text-neutral-300">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-16! text-xl! bg-neutral-900/50 border-neutral-800 focus:border-white/30 rounded-xl px-5"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-xl text-neutral-300">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-16! text-xl! bg-neutral-900/50 border-neutral-800 focus:border-white/30 rounded-xl px-5"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-xl text-neutral-300">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="h-16! text-xl! bg-neutral-900/50 border-neutral-800 focus:border-white/30 rounded-xl px-5"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-xl text-neutral-300">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleInputChange}
                      className="min-h-[180px] text-xl! bg-neutral-900/50 border-neutral-800 focus:border-white/30 rounded-xl px-5 py-4"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="w-full h-16 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xl font-semibold transition-all duration-300 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        Sending...
                        <Loader2 className="size-6 animate-spin" />
                      </>
                    ) : isSubmitted ? (
                      <>
                        Message Sent!
                        <CheckCircle2 className="size-6" />
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="size-6" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="mb-10">
                  <h2 className="text-5xl font-bold mb-4">
                    <span className="inline-flex items-center gap-3">
                      <Sparkles className="size-10 text-white" />
                      FAQ
                    </span>
                  </h2>
                  <p className="text-xl text-neutral-400">
                    Find quick answers to commonly asked questions about Pathfinder.
                  </p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {FAQ_ITEMS.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border border-neutral-800 rounded-xl px-6 bg-neutral-900/30 data-[state=open]:bg-neutral-900/50 transition-colors"
                    >
                      <AccordionTrigger className="text-xl text-left py-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-lg text-neutral-400 pb-6 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-10 p-8 rounded-2xl bg-linear-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800">
                  <h3 className="text-2xl font-semibold mb-3">Still have questions?</h3>
                  <p className="text-lg text-neutral-400 mb-6">
                    Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 rounded-xl border-neutral-700 dark:hover:bg-white hover:text-neutral-950 text-lg px-8 transition-all duration-300"
                  >
                    <a href="mailto:support@pathfinder.ai">
                      Contact Support
                      <ArrowRight className="size-5" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <PublicFooter />
      </main>
    </div>
  );
}

function ContactInfoContent({ info }: { info: typeof CONTACT_INFO[0] }) {
  return (
    <>
      <div className="size-14 rounded-xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-neutral-950 transition-all duration-300">
        <info.icon className="size-7" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
      <p className="text-2xl font-medium text-white mb-2">{info.value}</p>
      <p className="text-lg text-neutral-500">{info.description}</p>
    </>
  );
}

