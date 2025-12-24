'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Brain,
  Sparkles,
  Target,
  Lightbulb,
  BarChart3,
  Users,
  GraduationCap,
  Briefcase,
  Route,
  Zap,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Cpu,
  Database,
  Network,
} from 'lucide-react';
import { useUserStore } from '@/stores';

import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { MagicBento } from '@/components/ui/magic-bento';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Take Assessment',
    description:
      'Complete our comprehensive assessment to help us understand your skills, interests, academic background, and career aspirations.',
    icon: GraduationCap,
  },
  {
    step: '02',
    title: 'AI Analysis',
    description:
      'Our advanced AI processes your responses using machine learning algorithms trained on thousands of successful career paths.',
    icon: Brain,
  },
  {
    step: '03',
    title: 'Generate Roadmap',
    description:
      'Receive a personalized learning roadmap with specific courses, skills, and milestones tailored to your unique profile.',
    icon: Route,
  },
  {
    step: '04',
    title: 'Track & Grow',
    description:
      'Follow your roadmap, track progress, get AI insights, and connect with mentors who can guide you along your journey.',
    icon: Target,
  },
];

const AI_CAPABILITIES = [
  {
    icon: BarChart3,
    title: 'Skills Gap Analysis',
    description:
      'Identifies the gap between your current skills and the requirements of your desired career path, providing targeted recommendations.',
  },
  {
    icon: GitBranch,
    title: 'Multiple Pathway Options',
    description:
      'Generates multiple career pathways based on your profile, allowing you to explore different options and make informed decisions.',
  },
  {
    icon: Lightbulb,
    title: 'Smart Recommendations',
    description:
      'Provides intelligent course and resource recommendations based on your learning style, pace, and preferences.',
  },
  {
    icon: Users,
    title: 'Mentor Matching',
    description:
      'Connects you with relevant mentors based on career alignment, expertise areas, and availability for personalized guidance.',
  },
  {
    icon: Zap,
    title: 'Real-time Insights',
    description:
      'Offers instant AI-powered insights and answers to your career-related questions through an intelligent chat interface.',
  },
  {
    icon: Briefcase,
    title: 'Industry Alignment',
    description:
      'Aligns recommendations with current industry trends, job market demands, and emerging opportunities in your field.',
  },
];

const BENEFITS = [
  'Personalized recommendations based on your unique profile',
  'Save time with AI-generated roadmaps instead of manual research',
  'Data-driven insights from thousands of successful career paths',
  'Continuous learning and adaptation to your progress',
  'Access to industry-aligned content and resources',
  'Connection with verified mentors in your field',
];

export default function AboutAIPage() {
  const initializeUser = useUserStore((state) => state.initializeUser);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <PublicHeader />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-linear-to-br from-white/5 via-neutral-500/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-linear-to-bl from-neutral-400/5 via-neutral-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-linear-to-tr from-white/5 via-neutral-400/5 to-transparent blur-3xl" />
      </div>

      <main className="relative z-10 pt-40">
        <section className="px-8 pb-32">
          <div className="mx-auto max-w-[1100px] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/50 px-6 py-3 text-lg text-neutral-300 backdrop-blur-sm"
            >
              <Brain className="size-5" />
              Artificial Intelligence
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 text-7xl font-bold tracking-tight md:text-8xl"
            >
              The Brain Behind{' '}
              <span className="bg-linear-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                Pathfinder
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-12 max-w-4xl text-2xl leading-relaxed text-neutral-400 md:text-3xl"
            >
              Discover how our AI analyzes your unique profile to create
              personalized learning roadmaps and career recommendations that
              guide you toward success.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-10 py-8 text-xl text-neutral-950 hover:bg-neutral-200"
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="size-6" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full border border-white/20 bg-white/5 px-10 py-8 text-xl backdrop-blur-xl hover:border-white/40 hover:bg-white/10"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="mx-auto max-w-[1100px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-20 text-center"
            >
              <h2 className="mb-6 text-5xl font-bold md:text-6xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-neutral-400">
                Our AI-powered system follows a simple yet powerful process to
                deliver personalized career guidance tailored to your unique
                journey.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="group relative"
                >
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="absolute top-[52px] left-full z-20 hidden h-[2px] w-6 bg-neutral-600 lg:block" />
                  )}

                  <div className="relative h-full rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-900/80">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex size-14 items-center justify-center rounded-xl bg-neutral-800 transition-all duration-300 group-hover:bg-white">
                        <item.icon className="size-7 text-neutral-300 transition-colors group-hover:text-neutral-950" />
                      </div>
                      <span className="text-5xl font-bold text-neutral-700 transition-colors group-hover:text-neutral-500">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mb-4 text-2xl font-bold">{item.title}</h3>
                    <p className="text-lg leading-relaxed text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="mx-auto max-w-[1100px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-20 text-center"
            >
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/50 px-6 py-3 text-lg text-neutral-300 backdrop-blur-sm">
                <Sparkles className="size-5" />
                AI Capabilities
              </div>
              <h2 className="mb-6 text-5xl font-bold md:text-6xl">
                What Our AI{' '}
                <span className="bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                  Can Do
                </span>
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-neutral-400">
                Our AI is designed to understand your unique profile and provide
                actionable insights that accelerate your career growth.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {AI_CAPABILITIES.map((capability, index) => (
                <motion.div
                  key={capability.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-900/80"
                >
                  <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-neutral-800 transition-all duration-300 group-hover:bg-white">
                    <capability.icon className="size-7 text-neutral-300 transition-colors group-hover:text-neutral-950" />
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold">
                    {capability.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-neutral-400">
                    {capability.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="mx-auto max-w-[1100px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-6 text-5xl font-bold md:text-6xl">
                Powered by{' '}
                <span className="bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                  Advanced Technology
                </span>
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-neutral-400">
                Our AI leverages cutting-edge technologies to deliver accurate
                and personalized recommendations.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <MagicBento
                  enableSpotlight={true}
                  enableTilt={false}
                  enableMagnetism={false}
                  enableStars={true}
                  enableBorderGlow={false}
                  clickEffect={false}
                  spotlightRadius={400}
                  glowColor="255, 255, 255"
                  particleCount={0}
                  className="h-full border border-neutral-800 bg-neutral-900/50"
                >
                  <div className="relative p-10">
                    <div className="flex flex-col gap-8 md:flex-row md:items-start">
                      <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white transition-transform duration-300 hover:scale-110">
                        <Cpu className="size-10 text-neutral-950" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          <h3 className="text-3xl font-bold">
                            Large Language Models
                          </h3>
                          <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wider text-neutral-300 uppercase">
                            Core Engine
                          </span>
                        </div>
                        <p className="mb-6 text-xl leading-relaxed text-neutral-400">
                          Powered by state-of-the-art LLMs including GPT-4 and
                          custom fine-tuned models for natural language
                          understanding, context analysis, and intelligent
                          career recommendations.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-base text-neutral-400">
                            Context Understanding
                          </span>
                          <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-base text-neutral-400">
                            Semantic Analysis
                          </span>
                          <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-base text-neutral-400">
                            Response Generation
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/50 p-5 font-mono">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="size-3 rounded-full bg-green-500" />
                        <span className="size-3 rounded-full bg-yellow-500" />
                        <span className="size-3 rounded-full bg-red-500" />
                        <span className="text-md ml-2 text-neutral-600">
                          pathfinder-ai.ts
                        </span>
                      </div>
                      <code className="block text-lg text-neutral-500">
                        <span className="text-neutral-400">const</span> insights
                        = <span className="text-neutral-400">await</span> ai.
                        <span className="text-white">generateCareerPath</span>
                        (profile);
                      </code>
                    </div>
                  </div>
                </MagicBento>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <MagicBento
                  enableSpotlight={true}
                  enableTilt={false}
                  enableMagnetism={false}
                  enableStars={true}
                  enableBorderGlow={false}
                  clickEffect={false}
                  spotlightRadius={400}
                  glowColor="255, 255, 255"
                  particleCount={0}
                  className="h-full border border-neutral-800 bg-neutral-900/50"
                >
                  <div className="relative p-10">
                    {/* <div className="absolute -bottom-12 -right-12 size-40 border border-white/10 rounded-full" /> */}
                    {/* <div className="absolute -bottom-6 -right-6 size-28 border border-white/10 rounded-full" /> */}

                    <div className="relative">
                      <div className="mb-6 flex size-16 items-center justify-center rounded-xl bg-white transition-transform duration-300 hover:scale-110">
                        <Network className="size-8 text-neutral-950" />
                      </div>
                      <h3 className="mb-4 text-2xl font-bold">
                        Neural Networks
                      </h3>
                      <p className="mb-6 text-lg leading-relaxed text-neutral-400">
                        Deep learning models trained on 100K+ successful career
                        trajectories for accurate pattern recognition and
                        prediction.
                      </p>

                      <div className="flex h-20 items-end gap-2">
                        {[35, 60, 45, 85, 50, 70].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-white/10 transition-colors duration-300 hover:bg-white"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <p className="text-md mt-4 text-center text-neutral-600">
                        Pattern Recognition Accuracy
                      </p>
                    </div>
                  </div>
                </MagicBento>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <MagicBento
                  enableSpotlight={true}
                  enableTilt={false}
                  enableMagnetism={false}
                  enableStars={true}
                  enableBorderGlow={false}
                  clickEffect={false}
                  spotlightRadius={400}
                  glowColor="255, 255, 255"
                  particleCount={0}
                  className="h-full border border-neutral-800 bg-neutral-900/50"
                >
                  <div className="p-10">
                    <div className="mb-6 flex size-16 items-center justify-center rounded-xl bg-white transition-transform duration-300 hover:scale-110">
                      <Database className="size-8 text-neutral-950" />
                    </div>
                    <h3 className="mb-4 text-2xl font-bold">Knowledge Base</h3>
                    <p className="mb-8 text-lg leading-relaxed text-neutral-400">
                      Comprehensive, continuously updated database of career
                      paths, skills, and industry requirements.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 text-center">
                        <div className="mb-1 text-3xl font-bold">10K+</div>
                        <div className="text-sm text-neutral-500">
                          Career Paths
                        </div>
                      </div>
                      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 text-center">
                        <div className="mb-1 text-3xl font-bold">500+</div>
                        <div className="text-sm text-neutral-500">
                          Industries
                        </div>
                      </div>
                    </div>
                  </div>
                </MagicBento>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-2"
              >
                <MagicBento
                  enableSpotlight={true}
                  enableTilt={false}
                  enableMagnetism={false}
                  enableStars={true}
                  enableBorderGlow={false}
                  clickEffect={false}
                  spotlightRadius={400}
                  glowColor="255, 255, 255"
                  particleCount={0}
                  className="h-full border border-white/10 bg-linear-to-br from-white/8 to-transparent"
                >
                  <div className="p-10">
                    <div className="flex flex-col items-center gap-10 md:flex-row">
                      <div className="relative size-48 shrink-0">
                        <div className="absolute inset-0 animate-pulse rounded-full border-2 border-white/20" />
                        <div className="absolute inset-3 rounded-full border border-white/15" />
                        <div className="absolute inset-6 rounded-full border border-white/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex size-24 items-center justify-center rounded-full bg-white shadow-2xl shadow-white/20 transition-transform duration-300 hover:scale-110">
                            <Brain className="size-12 text-neutral-950" />
                          </div>
                        </div>

                        <div
                          className="absolute top-4 right-6 size-3 animate-ping rounded-full bg-white/60"
                          style={{ animationDuration: '2s' }}
                        />
                        <div
                          className="absolute bottom-6 left-4 size-3 animate-ping rounded-full bg-white/60"
                          style={{
                            animationDuration: '2.5s',
                            animationDelay: '0.5s',
                          }}
                        />
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h3 className="mb-4 text-3xl font-bold">
                          Intelligent Processing Engine
                        </h3>
                        <p className="mb-8 text-xl leading-relaxed text-neutral-400">
                          All technologies work together seamlessly, processing
                          your unique profile to deliver personalized career
                          insights and recommendations in real-time.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                          <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-base text-neutral-300">
                            Real-time Analysis
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-base text-neutral-300">
                            24/7 Available
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-base text-neutral-300">
                            Continuous Learning
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </MagicBento>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="mx-auto max-w-[1100px]">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <div className="rounded-3xl border border-neutral-800 bg-linear-to-br from-neutral-900 to-neutral-950 p-10">
                  <div className="grid grid-cols-1 gap-5">
                    {BENEFITS.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center gap-4"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                          <CheckCircle2 className="size-5 text-white" />
                        </div>
                        <span className="text-lg text-neutral-300">
                          {benefit}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-1 lg:order-2"
              >
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900/50 px-6 py-3 text-lg text-neutral-300 backdrop-blur-sm">
                  <Zap className="size-5" />
                  Why Choose AI
                </div>
                <h2 className="mb-8 text-5xl font-bold md:text-6xl">
                  Benefits of{' '}
                  <span className="bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                    AI-Powered Guidance
                  </span>
                </h2>
                <p className="text-xl leading-relaxed text-neutral-400">
                  Traditional career counseling is limited by human bandwidth
                  and subjective opinions. Our AI provides consistent,
                  data-driven guidance available 24/7, analyzing patterns from
                  thousands of successful career trajectories to give you the
                  most relevant recommendations.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="mx-auto max-w-[1100px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 size-24 rounded-tl-3xl border-t-2 border-l-2 border-white/20" />
              <div className="absolute -top-4 -right-4 size-24 rounded-tr-3xl border-t-2 border-r-2 border-white/20" />
              <div className="absolute -bottom-4 -left-4 size-24 rounded-bl-3xl border-b-2 border-l-2 border-white/20" />
              <div className="absolute -right-4 -bottom-4 size-24 rounded-br-3xl border-r-2 border-b-2 border-white/20" />

              <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/30 p-12 backdrop-blur-sm md:p-20">
                <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-linear-to-bl from-white/5 to-transparent blur-3xl" />
                <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-linear-to-tr from-white/5 to-transparent blur-3xl" />

                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                                      linear-gradient(to bottom, white 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                  }}
                />

                <div className="relative">
                  <div className="mb-8 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm tracking-wider text-neutral-400 uppercase">
                      <span className="size-2 animate-pulse rounded-full bg-white" />
                      Start Today
                    </div>
                  </div>

                  <div className="mx-auto max-w-3xl text-center">
                    <h2 className="mb-6 text-4xl leading-tight font-bold md:text-6xl">
                      Your Future Awaits.
                      <br />
                      <span className="bg-linear-to-r from-neutral-400 via-white to-neutral-400 bg-clip-text text-transparent">
                        Let AI Guide You.
                      </span>
                    </h2>

                    <p className="mb-12 text-xl leading-relaxed text-neutral-400">
                      Join thousands of students and professionals who have
                      transformed their careers with personalized AI-powered
                      guidance.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                      <Button
                        asChild
                        size="lg"
                        className="w-full rounded-full bg-white px-12 py-8 text-xl font-semibold text-neutral-950 shadow-2xl shadow-white/10 transition-all duration-300 hover:bg-neutral-200 hover:shadow-white/20 sm:w-auto"
                      >
                        <Link href="/register">
                          Get Started Free
                          <ArrowRight className="size-6" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="ghost"
                        className="w-full rounded-full border border-white/20 px-12 py-8 text-xl transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:w-auto"
                      >
                        <Link href="/contact">Contact Us</Link>
                      </Button>
                    </div>

                    <div className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-neutral-800 pt-10">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <CheckCircle2 className="size-5.5" />
                        <span className="text-lg">Free to start</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <CheckCircle2 className="size-5.5" />
                        <span className="text-lg">No credit card required</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <CheckCircle2 className="size-5.5" />
                        <span className="text-lg">Cancel anytime</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </main>
    </div>
  );
}
