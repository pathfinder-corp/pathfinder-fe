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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores';
import { contactService } from '@/services';
import type { ContactType } from '@/types';

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
    value: 'support@pathfinder.powof.tech',
    description: "We'll respond within 24 hours",
    href: 'mailto:support@pathfinder.powof.tech',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+84 123 456 789',
    description: 'Mon-Fri from 9am to 6pm',
    href: 'tel:+84123456789',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: 'Ho Chi Minh City, Vietnam',
    description: '1 Vo Van Ngan Street, Thu Duc Ward',
    href: 'https://maps.app.goo.gl/sgFthvayPCJNGtSQ7',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    value: '9:00 AM - 6:00 PM',
    description: 'Monday to Friday (GMT+7)',
    href: null,
  },
];

const FAQ_ITEMS = [
  {
    question: 'How does the AI-powered recommendation system work?',
    answer:
      'Our AI analyzes your skills, interests, academic background, and career goals through comprehensive assessments. Using advanced machine learning algorithms, it generates personalized learning roadmaps and career pathway recommendations tailored specifically to your profile.',
  },
  {
    question: 'Is Pathfinder free to use?',
    answer:
      'Pathfinder offers a free tier that includes basic assessments and roadmap generation. Premium features like mentorship connections, advanced analytics, and personalized coaching are available through our subscription plans.',
  },
  {
    question: 'How accurate are the career recommendations?',
    answer:
      'Our recommendations are based on extensive data analysis from successful career trajectories, industry trends, and academic research. We continuously improve our algorithms based on user feedback and outcomes, achieving over 85% user satisfaction rate.',
  },
  {
    question: 'Can I connect with real mentors through the platform?',
    answer:
      'Yes! Pathfinder connects you with verified mentors who are industry professionals and academic experts. You can browse mentor profiles, read reviews, and request mentorship based on your specific career goals.',
  },
  {
    question: 'How do I update my career preferences?',
    answer:
      'You can update your preferences anytime through your profile settings or by retaking assessments. Our AI will regenerate recommendations based on your updated information to ensure relevance.',
  },
  {
    question: 'What industries does Pathfinder cover?',
    answer:
      'Pathfinder covers a wide range of industries including Technology, Healthcare, Finance, Education, Engineering, Creative Arts, Business, and more. We continuously expand our database to include emerging fields and career paths.',
  },
];

export default function ContactPage() {
  const { user, initializeUser } = useUserStore();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    subject: string;
    message: string;
  }>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await contactService.createContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || undefined,
        message: formData.message.trim(),
        type: 'general' as ContactType,
      });

      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll get back to you soon.");

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send message';
      toast.error('Failed to send message', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <PublicHeader />

      <div className="absolute inset-x-0 top-0 h-[800px] overflow-hidden">
        <BackgroundBeams />
      </div>

      <main className="relative z-10 pt-40">
        <section className="px-8 pb-24">
          <div className="mx-auto max-w-[1100px] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/50 px-6 py-3 text-lg text-neutral-300 backdrop-blur-sm"
            >
              <MessageSquare className="size-5" />
              Get in Touch
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 text-7xl font-bold tracking-tight md:text-8xl"
            >
              Let&apos;s Start a{' '}
              <span className="bg-linear-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                Conversation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto max-w-4xl text-2xl leading-relaxed text-neutral-400"
            >
              Have questions about your career pathway? Want to learn more about
              our AI-powered recommendations? We&apos;re here to help you
              navigate your future.
            </motion.p>
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="mx-auto max-w-[1100px]">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                      target={
                        info.href.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        info.href.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="group block h-full rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/80"
                    >
                      <ContactInfoContent info={info} />
                    </a>
                  ) : (
                    <div className="group h-full rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/80">
                      <ContactInfoContent info={info} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="mx-auto max-w-[1100px]">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="mb-10">
                  <h2 className="mb-4 text-5xl font-bold">Send us a Message</h2>
                  <p className="text-xl text-neutral-400">
                    Fill out the form below and we&apos;ll get back to you as
                    soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="text-xl text-neutral-300"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-16! rounded-xl border-neutral-800 bg-neutral-900/50 px-5 text-xl! focus:border-white/30"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="text-xl text-neutral-300"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-16! rounded-xl border-neutral-800 bg-neutral-900/50 px-5 text-xl! focus:border-white/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="subject"
                      className="text-xl text-neutral-300"
                    >
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="h-16! rounded-xl border-neutral-800 bg-neutral-900/50 px-5 text-xl! focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="message"
                      className="text-xl text-neutral-300"
                    >
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleInputChange}
                      className="min-h-[180px] rounded-xl border-neutral-800 bg-neutral-900/50 px-5 py-4 text-xl! focus:border-white/30"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="h-16 w-full rounded-xl bg-white text-xl font-semibold text-neutral-950 transition-all duration-300 hover:bg-neutral-200 disabled:opacity-70"
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
                  <h2 className="mb-4 text-5xl font-bold">
                    <span className="inline-flex items-center gap-3">FAQ</span>
                  </h2>
                  <p className="text-xl text-neutral-400">
                    Find quick answers to commonly asked questions about
                    Pathfinder.
                  </p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {FAQ_ITEMS.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-6 transition-colors data-[state=open]:bg-neutral-900/50"
                    >
                      <AccordionTrigger className="py-6 text-left text-xl hover:no-underline [&[data-state=open]>svg]:rotate-180">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-lg leading-relaxed text-neutral-400">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {/* <div className="mt-10 rounded-2xl border border-neutral-800 bg-linear-to-br from-neutral-900 to-neutral-900/50 p-8">
                  <h3 className="mb-3 text-2xl font-semibold">
                    Still have questions?
                  </h3>
                  <p className="mb-6 text-lg text-neutral-400">
                    Can&apos;t find the answer you&apos;re looking for? Our
                    support team is here to help.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 rounded-xl border-neutral-700 px-8 text-lg transition-all duration-300 hover:text-neutral-950 dark:hover:bg-white"
                  >
                    <a href="mailto:support@pathfinder.ai">
                      Contact Support
                      <ArrowRight className="size-5" />
                    </a>
                  </Button>
                </div> */}
              </motion.div>
            </div>
          </div>
        </section>

        <PublicFooter />
      </main>
    </div>
  );
}

function ContactInfoContent({ info }: { info: (typeof CONTACT_INFO)[0] }) {
  return (
    <>
      <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-neutral-800 transition-all duration-300 group-hover:bg-white group-hover:text-neutral-950">
        <info.icon className="size-7" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">{info.title}</h3>
      <p className="mb-2 text-2xl font-medium text-white">{info.value}</p>
      <p className="text-lg text-neutral-500">{info.description}</p>
    </>
  );
}
