'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Gamepad2,
  Wrench,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Rocket,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  bgGradient: string;
  highlightColor: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to DataTrack!',
    description: 'Your all-in-one platform to master data analytics. Track your progress across 8 subjects, play learning games, and join a supportive community of fellow learners.',
    icon: Rocket,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    highlightColor: 'emerald',
  },
  {
    title: 'Track Your Progress',
    description: 'Follow a structured learning path covering 57+ topics across 8 key data analytics subjects. Mark topics as complete, build streaks, and watch your progress grow!',
    icon: BookOpen,
    gradient: 'from-teal-500 to-cyan-600',
    bgGradient: 'from-teal-600 via-cyan-600 to-blue-600',
    highlightColor: 'teal',
  },
  {
    title: 'Test Your Knowledge',
    description: 'Challenge yourself with quizzes, memory games, typing speed tests, and daily challenges. Earn achievements and track your high scores!',
    icon: Gamepad2,
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-600 via-orange-600 to-red-500',
    highlightColor: 'amber',
  },
  {
    title: 'Study Tools & Resources',
    description: 'Access a curated library of books, video tutorials, and courses. Use study tools like the Pomodoro timer, study planner, and keyboard shortcuts to boost your productivity.',
    icon: Wrench,
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-600 via-purple-600 to-pink-600',
    highlightColor: 'violet',
  },
  {
    title: 'Join the Community',
    description: 'Connect with fellow learners, share your progress, and get help. Showcase your projects in your portfolio and celebrate achievements together!',
    icon: Users,
    gradient: 'from-rose-500 to-pink-600',
    bgGradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    highlightColor: 'rose',
  },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  }),
};

export default function OnboardingTour() {
  const { onboardingComplete, setOnboardingComplete } = useProgressStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [show, setShow] = useState(!onboardingComplete);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    setOnboardingComplete();
    setShow(false);
  };

  const handleSkip = () => {
    handleFinish();
  };

  // Deterministic particle positions to avoid hydration mismatch (must be before any conditional returns)
  const particles = useMemo(() =>
    [...Array(20)].map((_, i) => ({
      id: i,
      left: ((i * 37 + 13) % 97),
      top: ((i * 53 + 7) % 97),
      duration: 3 + (i * 17 % 4),
      delay: (i * 11 % 20) * 0.1,
    })),
  []);

  if (!show) return null;

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === tourSteps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Background */}
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-95',
            step.bgGradient
          )}
        >
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-2 h-2 bg-white/10 rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.1, 0.5, 0.1],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                }}
              />
            ))}
          </div>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />
          </div>
        </motion.div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 z-10 text-white/60 hover:text-white hover:bg-white/10"
          onClick={handleSkip}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Tour Card */}
        <div className="relative z-10 w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              {/* Card Content */}
              <div className="p-8 md:p-10 text-white text-center space-y-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="mx-auto"
                >
                  <div className={cn(
                    'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl',
                    step.gradient
                  )}>
                    <StepIcon className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Step indicator */}
                <Badge className="bg-white/15 text-white/80 border-white/20 text-xs">
                  Step {currentStep + 1} of {tourSteps.length}
                </Badge>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-md mx-auto">
                  {step.description}
                </p>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  {!isFirst && (
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
                      onClick={handlePrev}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  )}

                  {isLast ? (
                    <Button
                      size="lg"
                      onClick={handleFinish}
                      className="bg-white text-gray-900 hover:bg-white/90 shadow-lg gap-2 px-8 font-semibold"
                    >
                      <Rocket className="w-4 h-4" />
                      Get Started
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleNext}
                      className="bg-white text-gray-900 hover:bg-white/90 shadow-lg gap-2 px-8 font-semibold"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {tourSteps.map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        i === currentStep
                          ? 'w-8 bg-white'
                          : i < currentStep
                            ? 'w-2 bg-white/60'
                            : 'w-2 bg-white/25'
                      )}
                      animate={i === currentStep ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Skip text */}
          {!isLast && (
            <p className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-white/40 hover:text-white/60 text-xs transition-colors"
              >
                Skip tour
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
