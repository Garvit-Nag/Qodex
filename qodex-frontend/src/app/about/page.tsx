/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import LiquidEther from '@/components/LiquidEther';
import {
  MessageSquare,
  GitBranch,
  Sparkles,
  Code2,
  Search,
  Github,
} from 'lucide-react';

export default function AboutPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleViewDemo = () => {
    if (user) {
      router.push('/explore');
    } else {
      router.push('/auth/signin');
    }
  };

  const features = [
    {
      icon: <GitBranch className="w-5 h-5" />,
      title: "Repository Intelligence",
      description: "Upload any GitHub repository and our AI instantly understands your entire codebase structure, dependencies, and patterns."
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Multiple Conversations",
      description: "Create multiple conversation threads per repository to organize different topics, features, or debugging sessions."
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Semantic Code Search",
      description: "Ask questions in natural language and get precise answers with exact sources."
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Context-Aware Responses",
      description: "Get intelligent answers that understand your project's architecture, coding patterns, and dependencies."
    }
  ];

  const steps = [
    {
      title: "Upload Repository",
      description: "Connect your GitHub repository URL and let our AI analyze your codebase",
      icon: <Github className="w-6 h-6" />
    },
    {
      title: "AI Processing",
      description: "Advanced AI models understand your code structure and context",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "Start Conversations",
      description: "Create multiple chat threads for different topics or features",
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      title: "Get Instant Answers",
      description: "Ask questions and get precise answers with code references",
      icon: <Code2 className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <div className="fixed inset-0 z-0">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={15}
          cursorSize={80}
          resolution={0.4}
          autoDemo={true}
          autoSpeed={0.3}
          autoIntensity={1.8}
        />
      </div>

      <div className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              How Qodex Works
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Transform your development workflow with AI that understands your code.
              Upload any repository and start intelligent conversations about your codebase.
            </p>
          </div>

          <section className="mb-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  Four Simple Steps
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  From repository upload to intelligent conversations in minutes
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="group bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl p-6 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                          {step.icon}
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          Step {index + 1}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  Powerful Features
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  Everything you need for intelligent code conversations
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl p-6 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}