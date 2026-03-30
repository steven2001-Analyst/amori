'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Star, Clock, BookOpen, Filter, SlidersHorizontal,
  CheckCircle2, Play, Trophy, TrendingUp, ChevronDown, X, GraduationCap,
  Sparkles, BadgeCheck, Loader2
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useProgressStore } from '@/lib/store';

// ─── Course Data ───
interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorRole: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  duration: string;
  lessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  description: string;
  gradient: string;
  iconBg: string;
  bestseller?: boolean;
  modules: { title: string; lessons: number; duration: string }[];
}

const courses: Course[] = [
  {
    id: 'sql-mastery',
    title: 'SQL Mastery: From Zero to Hero',
    instructor: 'Sarah Chen',
    instructorRole: 'Senior Data Engineer, Meta',
    rating: 4.9,
    reviews: 12453,
    price: 49.99,
    originalPrice: 89.99,
    duration: '42 hours',
    lessons: 186,
    level: 'Beginner',
    category: 'SQL',
    description: 'Master SQL from the ground up. Learn to write complex queries, optimize performance, and work with real-world databases used by top tech companies.',
    gradient: 'from-violet-600 to-purple-600',
    iconBg: 'bg-violet-500/20',
    bestseller: true,
    modules: [
      { title: 'SQL Fundamentals & Database Design', lessons: 35, duration: '8h 30m' },
      { title: 'Advanced SELECT Queries & Filtering', lessons: 28, duration: '6h 45m' },
      { title: 'Joins, Subqueries & CTEs', lessons: 40, duration: '9h 15m' },
      { title: 'Window Functions & Analytics', lessons: 32, duration: '7h 30m' },
      { title: 'Query Optimization & Indexing', lessons: 25, duration: '5h 30m' },
      { title: 'Stored Procedures & Real Projects', lessons: 26, duration: '5h 00m' },
    ],
  },
  {
    id: 'python-ds',
    title: 'Python for Data Science Complete Guide',
    instructor: 'Dr. Michael Torres',
    instructorRole: 'Lead Data Scientist, Google',
    rating: 4.8,
    reviews: 9821,
    price: 59.99,
    originalPrice: 109.99,
    duration: '56 hours',
    lessons: 248,
    level: 'Intermediate',
    category: 'Python',
    description: 'Comprehensive Python course covering pandas, NumPy, matplotlib, and real-world data science workflows used by industry professionals.',
    gradient: 'from-blue-600 to-cyan-600',
    iconBg: 'bg-blue-500/20',
    bestseller: true,
    modules: [
      { title: 'Python Essentials for Data Analysis', lessons: 40, duration: '9h 00m' },
      { title: 'NumPy & Numerical Computing', lessons: 35, duration: '8h 15m' },
      { title: 'Pandas & Data Manipulation', lessons: 50, duration: '12h 00m' },
      { title: 'Data Visualization with Matplotlib & Seaborn', lessons: 42, duration: '10h 00m' },
      { title: 'Statistical Analysis & Hypothesis Testing', lessons: 38, duration: '9h 00m' },
      { title: 'Capstone: Real-World Data Science Projects', lessons: 43, duration: '8h 15m' },
    ],
  },
  {
    id: 'powerbi-pro',
    title: 'Power BI Pro: Business Intelligence Mastery',
    instructor: 'Lisa Wang',
    instructorRole: 'BI Manager, Microsoft',
    rating: 4.7,
    reviews: 7634,
    price: 44.99,
    duration: '38 hours',
    lessons: 162,
    level: 'Beginner',
    category: 'Power BI',
    description: 'Build stunning dashboards and reports. Learn DAX, Power Query, and data modeling to transform raw data into actionable business insights.',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/20',
    modules: [
      { title: 'Power BI Desktop Fundamentals', lessons: 30, duration: '7h 00m' },
      { title: 'Data Modeling & Relationships', lessons: 28, duration: '6h 30m' },
      { title: 'DAX Formulas & Calculated Columns', lessons: 35, duration: '8h 00m' },
      { title: 'Advanced Visualizations & Custom Themes', lessons: 32, duration: '7h 30m' },
      { title: 'Power Query & Data Transformation', lessons: 22, duration: '5h 30m' },
      { title: 'Enterprise Dashboards & Publishing', lessons: 15, duration: '4h 00m' },
    ],
  },
  {
    id: 'data-engineering',
    title: 'Data Engineering with Python & Spark',
    instructor: 'James Rodriguez',
    instructorRole: 'Staff Data Engineer, Netflix',
    rating: 4.8,
    reviews: 5421,
    price: 79.99,
    originalPrice: 149.99,
    duration: '64 hours',
    lessons: 280,
    level: 'Advanced',
    category: 'Data Engineering',
    description: 'Design and build robust data pipelines. Master Apache Spark, Airflow, and modern data engineering practices used at FAANG companies.',
    gradient: 'from-emerald-600 to-teal-600',
    iconBg: 'bg-emerald-500/20',
    bestseller: true,
    modules: [
      { title: 'Data Engineering Fundamentals', lessons: 42, duration: '10h 00m' },
      { title: 'Python for Data Pipelines', lessons: 38, duration: '9h 00m' },
      { title: 'Apache Spark & Big Data Processing', lessons: 55, duration: '13h 00m' },
      { title: 'Data Warehousing & ETL', lessons: 48, duration: '11h 00m' },
      { title: 'Apache Airflow & Orchestration', lessons: 45, duration: '10h 30m' },
      { title: 'Production Data Systems & Monitoring', lessons: 52, duration: '11h 00m' },
    ],
  },
  {
    id: 'advanced-excel',
    title: 'Advanced Excel & VBA for Analytics',
    instructor: 'Patricia Anderson',
    instructorRole: 'Excel MVP & Consultant',
    rating: 4.6,
    reviews: 15234,
    price: 29.99,
    originalPrice: 59.99,
    duration: '28 hours',
    lessons: 125,
    level: 'Beginner',
    category: 'Excel',
    description: 'Go beyond basic spreadsheets. Master pivot tables, advanced formulas, macros, VBA programming, and Power Query for data analysis.',
    gradient: 'from-green-600 to-emerald-600',
    iconBg: 'bg-green-500/20',
    modules: [
      { title: 'Advanced Formulas & Functions', lessons: 30, duration: '7h 00m' },
      { title: 'Pivot Tables & Data Analysis', lessons: 25, duration: '5h 30m' },
      { title: 'Power Query & Data Transformation', lessons: 22, duration: '5h 00m' },
      { title: 'Charts, Dashboards & Visualization', lessons: 20, duration: '4h 30m' },
      { title: 'VBA Programming Fundamentals', lessons: 18, duration: '4h 00m' },
      { title: 'Automation & Real-World Projects', lessons: 10, duration: '2h 30m' },
    ],
  },
  {
    id: 'ml-fundamentals',
    title: 'Machine Learning Fundamentals',
    instructor: 'Dr. Alex Kumar',
    instructorRole: 'ML Research Scientist, DeepMind',
    rating: 4.9,
    reviews: 8765,
    price: 69.99,
    originalPrice: 129.99,
    duration: '52 hours',
    lessons: 230,
    level: 'Intermediate',
    category: 'Machine Learning',
    description: 'Understand the math and intuition behind ML algorithms. Build predictive models using scikit-learn and transition to deep learning with TensorFlow.',
    gradient: 'from-pink-600 to-rose-600',
    iconBg: 'bg-pink-500/20',
    bestseller: true,
    modules: [
      { title: 'Math Foundations for ML', lessons: 35, duration: '8h 00m' },
      { title: 'Supervised Learning Algorithms', lessons: 45, duration: '10h 30m' },
      { title: 'Unsupervised Learning & Clustering', lessons: 30, duration: '7h 00m' },
      { title: 'Model Evaluation & Feature Engineering', lessons: 38, duration: '9h 00m' },
      { title: 'Deep Learning with TensorFlow', lessons: 48, duration: '11h 00m' },
      { title: 'ML Deployment & MLOps', lessons: 34, duration: '7h 00m' },
    ],
  },
  {
    id: 'tableau-master',
    title: 'Tableau Masterclass: Data Visualization',
    instructor: 'Emily Zhang',
    instructorRole: 'Senior Analyst, Airbnb',
    rating: 4.7,
    reviews: 6432,
    price: 39.99,
    duration: '32 hours',
    lessons: 145,
    level: 'Beginner',
    category: 'Tableau',
    description: 'Create compelling visualizations that tell stories with data. From basic charts to complex interactive dashboards used by Fortune 500 companies.',
    gradient: 'from-sky-600 to-blue-600',
    iconBg: 'bg-sky-500/20',
    modules: [
      { title: 'Tableau Fundamentals & Interface', lessons: 28, duration: '6h 30m' },
      { title: 'Chart Types & Visual Best Practices', lessons: 32, duration: '7h 00m' },
      { title: 'Calculated Fields & Advanced Analytics', lessons: 30, duration: '7h 00m' },
      { title: 'Interactive Dashboards & Stories', lessons: 25, duration: '5h 30m' },
      { title: 'LOD Expressions & Advanced Techniques', lessons: 18, duration: '4h 00m' },
      { title: 'Portfolio Projects & Tips', lessons: 12, duration: '2h 30m' },
    ],
  },
  {
    id: 'stats-probability',
    title: 'Statistics & Probability for Data Analysts',
    instructor: 'Dr. Rachel Green',
    instructorRole: 'Statistics Professor, MIT',
    rating: 4.8,
    reviews: 4521,
    price: 34.99,
    duration: '36 hours',
    lessons: 156,
    level: 'Intermediate',
    category: 'Statistics',
    description: 'Build a rock-solid foundation in statistics and probability. Learn hypothesis testing, regression analysis, and Bayesian thinking for data science.',
    gradient: 'from-indigo-600 to-violet-600',
    iconBg: 'bg-indigo-500/20',
    modules: [
      { title: 'Descriptive Statistics & Data Types', lessons: 25, duration: '6h 00m' },
      { title: 'Probability Theory & Distributions', lessons: 32, duration: '7h 30m' },
      { title: 'Hypothesis Testing & Confidence Intervals', lessons: 30, duration: '7h 00m' },
      { title: 'Regression Analysis & Correlation', lessons: 28, duration: '6h 30m' },
      { title: 'Bayesian Statistics', lessons: 22, duration: '5h 00m' },
      { title: 'Applied Statistics Projects', lessons: 19, duration: '4h 30m' },
    ],
  },
  {
    id: 'cloud-data',
    title: 'Cloud Data Platforms: AWS & GCP',
    instructor: 'Kevin Park',
    instructorRole: 'Cloud Architect, Amazon',
    rating: 4.6,
    reviews: 3890,
    price: 89.99,
    originalPrice: 159.99,
    duration: '48 hours',
    lessons: 210,
    level: 'Advanced',
    category: 'Cloud',
    description: 'Master cloud data services on AWS and GCP. Learn S3, Redshift, BigQuery, and build scalable data solutions on the cloud.',
    gradient: 'from-slate-600 to-gray-700',
    iconBg: 'bg-slate-500/20',
    modules: [
      { title: 'Cloud Fundamentals & Data Architecture', lessons: 35, duration: '8h 00m' },
      { title: 'AWS Data Services (S3, Glue, Redshift)', lessons: 42, duration: '10h 00m' },
      { title: 'GCP Data Services (BigQuery, Dataflow)', lessons: 40, duration: '9h 30m' },
      { title: 'Data Lake Design & Implementation', lessons: 35, duration: '8h 00m' },
      { title: 'Security, Cost & Governance', lessons: 30, duration: '7h 00m' },
      { title: 'Real-World Cloud Migration Projects', lessons: 28, duration: '6h 00m' },
    ],
  },
  {
    id: 'data-storytelling',
    title: 'Data Storytelling & Presentation',
    instructor: 'Maria Lopez',
    instructorRole: 'Head of Analytics, Spotify',
    rating: 4.5,
    reviews: 2876,
    price: 24.99,
    duration: '18 hours',
    lessons: 82,
    level: 'Beginner',
    category: 'Soft Skills',
    description: 'Learn to communicate data insights effectively. Master presentation skills, narrative techniques, and executive-level reporting.',
    gradient: 'from-fuchsia-600 to-pink-600',
    iconBg: 'bg-fuchsia-500/20',
    modules: [
      { title: 'Principles of Data Storytelling', lessons: 15, duration: '3h 30m' },
      { title: 'Choosing the Right Visualizations', lessons: 14, duration: '3h 00m' },
      { title: 'Narrative Building with Data', lessons: 16, duration: '3h 30m' },
      { title: 'Executive Presentations', lessons: 12, duration: '2h 30m' },
      { title: 'Dashboard Design Principles', lessons: 13, duration: '3h 00m' },
      { title: 'Portfolio & Case Studies', lessons: 12, duration: '3h 00m' },
    ],
  },
  {
    id: 'r-programming',
    title: 'R Programming for Statistical Analysis',
    instructor: 'Dr. Thomas Wright',
    instructorRole: 'Biostatistician, Mayo Clinic',
    rating: 4.7,
    reviews: 4120,
    price: 44.99,
    originalPrice: 79.99,
    duration: '40 hours',
    lessons: 175,
    level: 'Intermediate',
    category: 'R',
    description: 'Master R programming for statistical computing and data analysis. Covers ggplot2, dplyr, tidyr, and advanced statistical modeling.',
    gradient: 'from-teal-600 to-cyan-600',
    iconBg: 'bg-teal-500/20',
    modules: [
      { title: 'R Programming Fundamentals', lessons: 30, duration: '7h 00m' },
      { title: 'Data Wrangling with tidyverse', lessons: 35, duration: '8h 00m' },
      { title: 'Data Visualization with ggplot2', lessons: 32, duration: '7h 30m' },
      { title: 'Statistical Modeling in R', lessons: 38, duration: '9h 00m' },
      { title: 'Report Generation with R Markdown', lessons: 22, duration: '5h 00m' },
      { title: 'Real-World Analytical Projects', lessons: 18, duration: '4h 00m' },
    ],
  },
  {
    id: 'data-ethics',
    title: 'Data Ethics, Privacy & Governance',
    instructor: 'Sandra Johnson',
    instructorRole: 'Chief Privacy Officer, IBM',
    rating: 4.4,
    reviews: 1567,
    price: 19.99,
    duration: '14 hours',
    lessons: 65,
    level: 'Beginner',
    category: 'Ethics',
    description: 'Understand the ethical implications of data work. Learn GDPR compliance, data privacy best practices, and responsible AI principles.',
    gradient: 'from-rose-500 to-red-600',
    iconBg: 'bg-rose-500/20',
    modules: [
      { title: 'Introduction to Data Ethics', lessons: 12, duration: '2h 30m' },
      { title: 'GDPR & Global Privacy Regulations', lessons: 14, duration: '3h 00m' },
      { title: 'Bias & Fairness in Algorithms', lessons: 13, duration: '2h 30m' },
      { title: 'Data Governance Frameworks', lessons: 10, duration: '2h 00m' },
      { title: 'Responsible AI Principles', lessons: 10, duration: '2h 00m' },
      { title: 'Case Studies & Best Practices', lessons: 6, duration: '2h 00m' },
    ],
  },
];

const categories = ['All', 'SQL', 'Python', 'Power BI', 'Data Engineering', 'Excel', 'Machine Learning', 'Tableau', 'Statistics', 'Cloud', 'Soft Skills', 'R', 'Ethics'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CourseStoreView() {
  const store = useProgressStore();
  const purchasedCourses = store.purchasedCourses || [];

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [priceRange, setPriceRange] = useState<'all' | 'under50' | 'under75' | '75plus'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter((c) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.instructor.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (selectedLevel !== 'All' && c.level !== selectedLevel) return false;
      if (priceRange === 'under50' && c.price >= 50) return false;
      if (priceRange === 'under75' && c.price >= 75) return false;
      if (priceRange === '75plus' && c.price < 75) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      default: filtered.sort((a, b) => b.reviews - a.reviews);
    }
    return filtered;
  }, [search, selectedCategory, selectedLevel, priceRange, sortBy]);

  const isPurchased = (id: string) => purchasedCourses.includes(id);
  const isInCart = (id: string) => cart.includes(id);

  const handlePurchase = async (courseId: string) => {
    if (isPurchased(courseId)) return;
    setPurchasing(courseId);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', email: store.profile?.email || 'user@datatrack.com' }),
      });
      const data = await res.json();
      if (data.demo || data.fallback) {
        await new Promise((r) => setTimeout(r, 1200));
        store.purchaseCourse(courseId);
        setCart((prev) => prev.filter((id) => id !== courseId));
        toast.success('Course purchased successfully! You now have full access.');
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1200));
      store.purchaseCourse(courseId);
      setCart((prev) => prev.filter((id) => id !== courseId));
      toast.success('Course purchased successfully! (Demo mode)');
    } finally {
      setPurchasing(null);
    }
  };

  const toggleCart = (courseId: string) => {
    if (isPurchased(courseId)) return;
    setCart((prev) => prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]);
  };

  const cartTotal = cart.reduce((sum, id) => {
    const course = courses.find((c) => c.id === id);
    return sum + (course?.price || 0);
  }, 0);

  const handleBuyAll = async () => {
    for (const courseId of cart) {
      setPurchasing(courseId);
      await new Promise((r) => setTimeout(r, 800));
      store.purchaseCourse(courseId);
    }
    setCart([]);
    toast.success(`${cart.length} course(s) purchased successfully!`);
    setPurchasing(null);
    setShowCart(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
          />
        ))}
        <span className="text-xs font-semibold ml-1.5">{rating}</span>
        <span className="text-xs text-muted-foreground ml-1">({(rating * 1000).toLocaleString()})</span>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Course Store</h1>
              <p className="text-muted-foreground text-sm">{courses.length} premium courses · Expert-led content</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64 h-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="relative h-10 w-10"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="w-4 h-4" />
            {cart.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {cart.length}
              </motion.span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { icon: BookOpen, label: 'Total Courses', value: courses.length.toString(), color: 'text-violet-500' },
          { icon: TrendingUp, label: 'Bestsellers', value: courses.filter((c) => c.bestseller).length.toString(), color: 'text-amber-500' },
          { icon: Trophy, label: 'Purchased', value: purchasedCourses.length.toString(), color: 'text-emerald-500' },
          { icon: ShoppingCart, label: 'In Cart', value: cart.length.toString(), color: 'text-blue-500' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 bg-muted/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs">
            <Filter className="w-3 h-3" /> Category
          </Badge>
          <div className="flex flex-wrap gap-1.5">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs">
            <SlidersHorizontal className="w-3 h-3" /> Level
          </Badge>
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedLevel === level
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
          className="px-3 py-1.5 rounded-lg text-xs bg-muted hover:bg-muted/80 border-0 text-muted-foreground cursor-pointer"
        >
          <option value="all">All Prices</option>
          <option value="under50">Under $50</option>
          <option value="under75">Under $75</option>
          <option value="75plus">$75+</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-1.5 rounded-lg text-xs bg-muted hover:bg-muted/80 border-0 text-muted-foreground cursor-pointer"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCourses.length}</span> courses
        </p>
        {(selectedCategory !== 'All' || selectedLevel !== 'All' || priceRange !== 'all' || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedCategory('All'); setSelectedLevel('All'); setPriceRange('all'); setSearch(''); }}
            className="text-xs h-7"
          >
            <X className="w-3 h-3 mr-1" /> Clear Filters
          </Button>
        )}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/50 h-full flex flex-col" onClick={() => setSelectedCourse(course)}>
                {/* Course Thumbnail */}
                <div className={`relative h-40 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
                  {course.bestseller && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> BESTSELLER
                    </div>
                  )}
                  {isPurchased(course.id) && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> PURCHASED
                    </div>
                  )}
                  <div className="text-white/90 text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold">{course.category}</p>
                    <p className="text-xs text-white/70">{course.level}</p>
                  </div>
                </div>

                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-violet-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5">{course.instructor} · {course.instructorRole.split(',')[0]}</p>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-3 flex-1">
                  {renderStars(course.rating)}
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" />{course.lessons} lessons</span>
                  </div>
                </CardContent>

                <CardFooter className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">${course.price}</span>
                      {course.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">${course.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {isPurchased(course.id) ? (
                        <Button size="sm" className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                          <Play className="w-3 h-3 mr-1" /> Watch Now
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => toggleCart(course.id)}>
                            <ShoppingCart className={`w-3.5 h-3.5 ${isInCart(course.id) ? 'text-violet-600' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                            onClick={() => handlePurchase(course.id)}
                            disabled={purchasing === course.id}
                          >
                            {purchasing === course.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Sparkles className="w-3 h-3 mr-1" /> Buy Now</>}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No courses found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </motion.div>
      )}

      {/* Course Detail Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <div className={`h-48 -mx-6 -mt-6 mb-4 bg-gradient-to-br ${selectedCourse.gradient} rounded-t-xl flex items-center justify-center relative`}>
                {selectedCourse.bestseller && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> BESTSELLER
                  </div>
                )}
                <div className="text-white text-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-lg font-bold">{selectedCourse.category}</p>
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-0 text-xs">{selectedCourse.level}</Badge>
                </div>
              </div>

              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCourse.title}</DialogTitle>
                <DialogDescription className="text-sm">{selectedCourse.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-4 text-sm">
                  {renderStars(selectedCourse.rating)}
                  <span className="text-muted-foreground">· {selectedCourse.instructor}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-semibold">{selectedCourse.duration}</p>
                    <p className="text-[10px] text-muted-foreground">Duration</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <Play className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-semibold">{selectedCourse.lessons}</p>
                    <p className="text-[10px] text-muted-foreground">Lessons</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <BookOpen className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-semibold">{selectedCourse.modules.length}</p>
                    <p className="text-[10px] text-muted-foreground">Modules</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">Course Curriculum</h4>
                  <div className="space-y-2">
                    {selectedCourse.modules.map((mod, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{mod.title}</p>
                          <p className="text-xs text-muted-foreground">{mod.lessons} lessons · {mod.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${selectedCourse.price}</span>
                    {selectedCourse.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">${selectedCourse.originalPrice}</span>
                    )}
                  </div>
                  {isPurchased(selectedCourse.id) ? (
                    <Button className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Access Course
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                      onClick={() => { handlePurchase(selectedCourse.id); }}
                      disabled={purchasing === selectedCourse.id}
                    >
                      {purchasing === selectedCourse.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <><Sparkles className="w-4 h-4 mr-2" /> Buy Now - ${selectedCourse.price}</>}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-violet-600" /> Shopping Cart ({cart.length})
            </DialogTitle>
            <DialogDescription>Review your courses before checkout</DialogDescription>
          </DialogHeader>
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((id) => {
                const course = courses.find((c) => c.id === id);
                if (!course) return null;
                return (
                  <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${course.gradient} flex items-center justify-center shrink-0`}>
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.instructor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">${course.price}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCart((prev) => prev.filter((c) => c !== id))}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {cart.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">${cartTotal.toFixed(2)}</p>
              </div>
              <Button
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                onClick={handleBuyAll}
                disabled={!!purchasing}
              >
                {purchasing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Buy All ({cart.length})
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
