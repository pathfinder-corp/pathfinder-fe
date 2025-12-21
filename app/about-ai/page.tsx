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
  Network
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
    description: 'Complete our comprehensive assessment to help us understand your skills, interests, academic background, and career aspirations.',
    icon: GraduationCap
  },
  {
    step: '02',
    title: 'AI Analysis',
    description: 'Our advanced AI processes your responses using machine learning algorithms trained on thousands of successful career paths.',
    icon: Brain
  },
  {
    step: '03',
    title: 'Generate Roadmap',
    description: 'Receive a personalized learning roadmap with specific courses, skills, and milestones tailored to your unique profile.',
    icon: Route
  },
  {
    step: '04',
    title: 'Track & Grow',
    description: 'Follow your roadmap, track progress, get AI insights, and connect with mentors who can guide you along your journey.',
    icon: Target
  }
];

const AI_CAPABILITIES = [
  {
    icon: BarChart3,
    title: 'Skills Gap Analysis',
    description: 'Identifies the gap between your current skills and the requirements of your desired career path, providing targeted recommendations.'
  },
  {
    icon: GitBranch,
    title: 'Multiple Pathway Options',
    description: 'Generates multiple career pathways based on your profile, allowing you to explore different options and make informed decisions.'
  },
  {
    icon: Lightbulb,
    title: 'Smart Recommendations',
    description: 'Provides intelligent course and resource recommendations based on your learning style, pace, and preferences.'
  },
  {
    icon: Users,
    title: 'Mentor Matching',
    description: 'Connects you with relevant mentors based on career alignment, expertise areas, and availability for personalized guidance.'
  },
  {
    icon: Zap,
    title: 'Real-time Insights',
    description: 'Offers instant AI-powered insights and answers to your career-related questions through an intelligent chat interface.'
  },
  {
    icon: Briefcase,
    title: 'Industry Alignment',
    description: 'Aligns recommendations with current industry trends, job market demands, and emerging opportunities in your field.'
  }
];

const BENEFITS = [
  'Personalized recommendations based on your unique profile',
  'Save time with AI-generated roadmaps instead of manual research',
  'Data-driven insights from thousands of successful career paths',
  'Continuous learning and adaptation to your progress',
  'Access to industry-aligned content and resources',
  'Connection with verified mentors in your field'
];

export default function AboutAIPage() {
  const initializeUser = useUserStore((state) => state.initializeUser);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
      <PublicHeader />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-linear-to-br from-white/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-linear-to-bl from-neutral-400/5 via-neutral-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-linear-to-tr from-white/5 via-neutral-400/5 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 pt-40">
        <section className="px-8 pb-32">
          <div className="max-w-[1100px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-lg text-neutral-300 mb-8"
            >
              <Brain className="size-5" />
              Artificial Intelligence
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-7xl md:text-8xl font-bold tracking-tight mb-8"
            >
              The Brain Behind{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-neutral-200 to-neutral-400">
                Pathfinder
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl md:text-3xl text-neutral-400 max-w-4xl mx-auto leading-relaxed mb-12"
            >
              Discover how our AI analyzes your unique profile to create personalized 
              learning roadmaps and career recommendations that guide you toward success.
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
                className="rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-xl px-10 py-8"
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
                className="rounded-full border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 text-xl px-10 py-8"
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="max-w-[1100px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6">How It Works</h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                Our AI-powered system follows a simple yet powerful process to deliver 
                personalized career guidance tailored to your unique journey.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="relative group"
                >
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-[52px] left-full w-6 h-[2px] bg-neutral-600 z-20" />
                  )}
                  
                  <div className="relative h-full p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/80 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="size-14 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-white transition-all duration-300">
                        <item.icon className="size-7 text-neutral-300 group-hover:text-neutral-950 transition-colors" />
                      </div>
                      <span className="text-5xl font-bold text-neutral-700 group-hover:text-neutral-500 transition-colors">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-lg text-neutral-400 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="max-w-[1100px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-lg text-neutral-300 mb-8">
                <Sparkles className="size-5" />
                AI Capabilities
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                What Our AI{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-400">
                  Can Do
                </span>
              </h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                Our AI is designed to understand your unique profile and provide 
                actionable insights that accelerate your career growth.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {AI_CAPABILITIES.map((capability, index) => (
                <motion.div
                  key={capability.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/80 transition-all duration-300"
                >
                  <div className="size-14 rounded-xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:bg-white transition-all duration-300">
                    <capability.icon className="size-7 text-neutral-300 group-hover:text-neutral-950 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{capability.title}</h3>
                  <p className="text-lg text-neutral-400 leading-relaxed">{capability.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="max-w-[1100px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Powered by{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-400">
                  Advanced Technology
                </span>
              </h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                Our AI leverages cutting-edge technologies to deliver accurate and personalized recommendations.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className="h-full bg-neutral-900/50 border border-neutral-800"
                >
                  <div className="relative p-10">
                    <div className="flex flex-col md:flex-row md:items-start gap-8">
                      <div className="size-20 rounded-2xl bg-white flex items-center justify-center shrink-0 hover:scale-110 transition-transform duration-300">
                        <Cpu className="size-10 text-neutral-950" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <h3 className="text-3xl font-bold">Large Language Models</h3>
                          <span className="px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium text-neutral-300 uppercase tracking-wider">
                            Core Engine
                          </span>
                        </div>
                        <p className="text-xl text-neutral-400 leading-relaxed mb-6">
                          Powered by state-of-the-art LLMs including GPT-4 and custom fine-tuned models 
                          for natural language understanding, context analysis, and intelligent career recommendations.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-base text-neutral-400">Context Understanding</span>
                          <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-base text-neutral-400">Semantic Analysis</span>
                          <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-base text-neutral-400">Response Generation</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-5 rounded-xl bg-neutral-950/50 border border-neutral-800 font-mono">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="size-3 rounded-full bg-green-500" />
                        <span className="size-3 rounded-full bg-yellow-500" />
                        <span className="size-3 rounded-full bg-red-500" />
                        <span className="ml-2 text-md text-neutral-600">pathfinder-ai.ts</span>
                      </div>
                      <code className="text-lg text-neutral-500 block">
                        <span className="text-neutral-400">const</span> insights = <span className="text-neutral-400">await</span> ai.<span className="text-white">generateCareerPath</span>(profile);
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
                  className="h-full bg-neutral-900/50 border border-neutral-800"
                >
                  <div className="relative p-10">
                    {/* <div className="absolute -bottom-12 -right-12 size-40 border border-white/10 rounded-full" /> */}
                    {/* <div className="absolute -bottom-6 -right-6 size-28 border border-white/10 rounded-full" /> */}
                    
                    <div className="relative">
                      <div className="size-16 rounded-xl bg-white flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                        <Network className="size-8 text-neutral-950" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Neural Networks</h3>
                      <p className="text-lg text-neutral-400 leading-relaxed mb-6">
                        Deep learning models trained on 100K+ successful career trajectories for accurate pattern recognition and prediction.
                      </p>
                      
                      <div className="flex items-end gap-2 h-20">
                        {[35, 60, 45, 85, 50, 70].map((height, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-white/10 rounded-t hover:bg-white transition-colors duration-300"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <p className="text-md text-neutral-600 mt-4 text-center">Pattern Recognition Accuracy</p>
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
                  className="h-full bg-neutral-900/50 border border-neutral-800"
                >
                  <div className="p-10">
                    <div className="size-16 rounded-xl bg-white flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                      <Database className="size-8 text-neutral-950" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Knowledge Base</h3>
                    <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                      Comprehensive, continuously updated database of career paths, skills, and industry requirements.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 text-center">
                        <div className="text-3xl font-bold mb-1">10K+</div>
                        <div className="text-sm text-neutral-500">Career Paths</div>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 text-center">
                        <div className="text-3xl font-bold mb-1">500+</div>
                        <div className="text-sm text-neutral-500">Industries</div>
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
                  className="h-full bg-linear-to-br from-white/8 to-transparent border border-white/10"
                >
                  <div className="p-10">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="relative size-48 shrink-0">
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse" />
                        <div className="absolute inset-3 rounded-full border border-white/15" />
                        <div className="absolute inset-6 rounded-full border border-white/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="size-24 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-white/20 hover:scale-110 transition-transform duration-300">
                            <Brain className="size-12 text-neutral-950" />
                          </div>
                        </div>
                        
                        <div className="absolute top-4 right-6 size-3 rounded-full bg-white/60 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute bottom-6 left-4 size-3 rounded-full bg-white/60 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-bold mb-4">Intelligent Processing Engine</h3>
                        <p className="text-xl text-neutral-400 leading-relaxed mb-8">
                          All technologies work together seamlessly, processing your unique profile 
                          to deliver personalized career insights and recommendations in real-time.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-base text-neutral-300">Real-time Analysis</span>
                          <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-base text-neutral-300">24/7 Available</span>
                          <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-base text-neutral-300">Continuous Learning</span>
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
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <div className="p-10 rounded-3xl bg-linear-to-br from-neutral-900 to-neutral-950 border border-neutral-800">
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
                        <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="size-5 text-white" />
                        </div>
                        <span className="text-lg text-neutral-300">{benefit}</span>
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
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-lg text-neutral-300 mb-8">
                  <Zap className="size-5" />
                  Why Choose AI
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-8">
                  Benefits of{' '}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-400">
                    AI-Powered Guidance
                  </span>
                </h2>
                <p className="text-xl text-neutral-400 leading-relaxed">
                  Traditional career counseling is limited by human bandwidth and subjective opinions. 
                  Our AI provides consistent, data-driven guidance available 24/7, analyzing patterns 
                  from thousands of successful career trajectories to give you the most relevant recommendations.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="max-w-[1100px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 size-24 border-l-2 border-t-2 border-white/20 rounded-tl-3xl" />
              <div className="absolute -top-4 -right-4 size-24 border-r-2 border-t-2 border-white/20 rounded-tr-3xl" />
              <div className="absolute -bottom-4 -left-4 size-24 border-l-2 border-b-2 border-white/20 rounded-bl-3xl" />
              <div className="absolute -bottom-4 -right-4 size-24 border-r-2 border-b-2 border-white/20 rounded-br-3xl" />

              <div className="relative p-12 md:p-20 rounded-3xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-linear-to-bl from-white/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-linear-to-tr from-white/5 to-transparent rounded-full blur-3xl" />
                
                <div 
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                                      linear-gradient(to bottom, white 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                  }}
                />

                <div className="relative">
                  <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/5 text-sm text-neutral-400 uppercase tracking-wider">
                      <span className="size-2 rounded-full bg-white animate-pulse" />
                      Start Today
                    </div>
                  </div>

                  <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                      Your Future Awaits.
                      <br />
                      <span className="text-transparent bg-clip-text bg-linear-to-r from-neutral-400 via-white to-neutral-400">
                        Let AI Guide You.
                      </span>
                    </h2>
                    
                    <p className="text-xl text-neutral-400 mb-12 leading-relaxed">
                      Join thousands of students and professionals who have transformed 
                      their careers with personalized AI-powered guidance.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button
                        asChild
                        size="lg"
                        className="w-full sm:w-auto rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-xl px-12 py-8 font-semibold shadow-2xl shadow-white/10 transition-all duration-300 hover:shadow-white/20"
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
                        className="w-full sm:w-auto rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 text-xl px-12 py-8 transition-all duration-300"
                      >
                        <Link href="/contact">
                          Contact Us
                        </Link>
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-10 border-t border-neutral-800">
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