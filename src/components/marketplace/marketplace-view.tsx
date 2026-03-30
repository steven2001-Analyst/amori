'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Clock, BookOpen, CheckCircle2, Filter, Search, Users, Download, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/lib/store';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  lessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  gradient: string;
  icon: string;
}

const COURSES: Course[] = [
  { id: 'sql-mastery', title: 'SQL Mastery: From Zero to Expert', description: 'Complete SQL course covering queries, joins, subqueries, window functions, optimization, and real-world database design patterns.', instructor: 'Sarah Chen', duration: '24 hours', price: 29.99, rating: 4.9, reviews: 2847, lessons: 156, level: 'Beginner', category: 'SQL', gradient: 'from-cyan-500 to-blue-600', icon: '🗃️' },
  { id: 'python-ds', title: 'Python for Data Science', description: 'Master Python, Pandas, NumPy, Matplotlib, and Scikit-learn. Build real projects and prepare for data science interviews.', instructor: 'Dr. Alex Kumar', duration: '32 hours', price: 39.99, rating: 4.8, reviews: 3421, lessons: 198, level: 'Beginner', category: 'Python', gradient: 'from-amber-500 to-orange-600', icon: '🐍' },
  { id: 'excel-advanced', title: 'Excel Advanced: Power User Course', description: 'Advanced formulas, VBA macros, Power Query, Pivot Tables mastery, and automation techniques for business analytics.', instructor: 'Mike Johnson', duration: '18 hours', price: 19.99, rating: 4.7, reviews: 1563, lessons: 112, level: 'Intermediate', category: 'Excel', gradient: 'from-green-500 to-emerald-600', icon: '📊' },
  { id: 'powerbi-pro', title: 'Power BI Pro: Dashboard Mastery', description: 'Design stunning dashboards, master DAX, build data models, and create compelling data stories for business stakeholders.', instructor: 'Priya Patel', duration: '20 hours', price: 24.99, rating: 4.8, reviews: 1892, lessons: 134, level: 'Intermediate', category: 'Power BI', gradient: 'from-yellow-500 to-amber-600', icon: '📈' },
  { id: 'data-eng', title: 'Data Engineering Fundamentals', description: 'ETL pipelines, data warehousing, cloud platforms (AWS/GCP), Apache Spark, Airflow, and modern data stack architecture.', instructor: 'James Wilson', duration: '40 hours', price: 49.99, rating: 4.9, reviews: 967, lessons: 245, level: 'Advanced', category: 'Data Engineering', gradient: 'from-violet-500 to-purple-600', icon: '🏗️' },
  { id: 'stats-mastery', title: 'Statistics & Probability for Analytics', description: 'Comprehensive statistics course: descriptive stats, probability, hypothesis testing, regression analysis, and Bayesian thinking.', instructor: 'Dr. Emily Zhang', duration: '22 hours', price: 29.99, rating: 4.7, reviews: 1234, lessons: 145, level: 'Intermediate', category: 'Statistics', gradient: 'from-pink-500 to-rose-600', icon: '📐' },
  { id: 'bi-career', title: 'Business Intelligence Career Path', description: 'End-to-end BI workflow: requirements gathering, data modeling, visualization design, and presentation skills.', instructor: 'Tom Garcia', duration: '16 hours', price: 14.99, rating: 4.6, reviews: 876, lessons: 98, level: 'Beginner', category: 'Career', gradient: 'from-teal-500 to-cyan-600', icon: '🎯' },
  { id: 'db-design', title: 'Database Design & Architecture', description: 'Relational design, normalization, indexing strategies, query optimization, and distributed database concepts.', instructor: 'Lisa Park', duration: '28 hours', price: 34.99, rating: 4.8, reviews: 1102, lessons: 167, level: 'Advanced', category: 'Database', gradient: 'from-red-500 to-pink-600', icon: '🗄️' },
  { id: 'data-viz', title: 'Data Visualization with Tableau', description: 'Master Tableau Desktop, create interactive dashboards, understand visual best practices, and tell stories with data.', instructor: 'Chris Lee', duration: '15 hours', price: 19.99, rating: 4.7, reviews: 1543, lessons: 102, level: 'Beginner', category: 'Visualization', gradient: 'from-indigo-500 to-blue-600', icon: '🎨' },
  { id: 'ml-basics', title: 'Machine Learning for Beginners', description: 'Introduction to ML: supervised/unsupervised learning, model evaluation, feature engineering, and hands-on projects with scikit-learn.', instructor: 'Dr. Rachel Kim', duration: '35 hours', price: 44.99, rating: 4.9, reviews: 2156, lessons: 210, level: 'Intermediate', category: 'Machine Learning', gradient: 'from-fuchsia-500 to-purple-600', icon: '🤖' },
];

const CATEGORIES = ['All', ...Array.from(new Set(COURSES.map(c => c.category)))];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function MarketplaceView() {
  const store = useProgressStore();
  const purchasedCourses: string[] = store.purchasedCourses || [];
  const purchaseCourse = store.purchaseCourse;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedId, setPurchasedId] = useState('');

  const filtered = COURSES.filter(c => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || c.category === category;
    const matchesLevel = level === 'All' || c.level === level;
    return matchesSearch && matchesCat && matchesLevel;
  });

  const myCourses = COURSES.filter(c => purchasedCourses.includes(c.id));

  const handlePurchase = (course: Course) => {
    if (!purchasedCourses.includes(course.id)) {
      purchaseCourse(course.id);
      setPurchasedId(course.id);
      setShowSuccess(true);
    }
    setSelectedCourse(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Course Marketplace</h1>
          <p className="text-sm text-muted-foreground">Premium courses from expert instructors</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          <TabsTrigger value="my-courses" className="gap-1">
            My Courses {myCourses.length > 0 && <Badge className="ml-1 h-5 w-5 p-0 text-[10px]">{myCourses.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="pl-10" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="h-10 rounded-lg border bg-background px-3 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="h-10 rounded-lg border bg-background px-3 text-sm"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course, i) => {
              const isPurchased = purchasedCourses.includes(course.id);
              return (
                <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                    {/* Gradient Header */}
                    <div className={cn('h-32 bg-gradient-to-br flex items-center justify-center relative', course.gradient)}>
                      <span className="text-5xl">{course.icon}</span>
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                          {course.level}
                        </Badge>
                      </div>
                      {isPurchased && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-emerald-500 text-white border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />Owned
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{course.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.instructor}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons} lessons</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{course.rating}</span>
                          <span className="text-xs text-muted-foreground">({course.reviews.toLocaleString()})</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">${course.price}</span>
                      </div>
                      <Button
                        onClick={() => isPurchased ? null : setSelectedCourse(course)}
                        className={cn(
                          'w-full',
                          isPurchased
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                        )}
                        disabled={isPurchased}
                      >
                        {isPurchased ? (
                          <><Download className="w-4 h-4 mr-2" />Access Course</>
                        ) : (
                          <><Sparkles className="w-4 h-4 mr-2" />Enroll Now</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No courses found matching your filters.</p>
            </div>
          )}

          {/* Refund Policy */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Lock className="w-4 h-4" />Refund Policy</h4>
              <p className="text-xs text-muted-foreground mt-1">30-day money-back guarantee on all courses. If you&apos;re not satisfied, contact support for a full refund. All courses include lifetime access and free updates.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-courses" className="space-y-4 mt-4">
          {myCourses.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No Courses Yet</h3>
              <p className="text-muted-foreground">Browse the marketplace and enroll in courses to start learning!</p>
              <Button onClick={() => setActiveTab('browse')} className="bg-gradient-to-r from-emerald-500 to-teal-600">
                Browse Courses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCourses.map(course => (
                <Card key={course.id} className="overflow-hidden">
                  <div className={cn('h-24 bg-gradient-to-br flex items-center justify-center', course.gradient)}>
                    <span className="text-4xl">{course.icon}</span>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{course.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{course.duration}</span>
                      <span>{course.lessons} lessons</span>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300">Enrolled</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                        <BookOpen className="w-4 h-4 mr-1" />Continue Learning
                      </Button>
                      <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" />Resources</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>Review course details before purchasing</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className={cn('h-32 rounded-xl bg-gradient-to-br flex items-center justify-center', selectedCourse.gradient)}>
                <span className="text-5xl">{selectedCourse.icon}</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{selectedCourse.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{selectedCourse.level}</Badge>
                  <Badge variant="outline">{selectedCourse.category}</Badge>
                  <Badge variant="outline">{selectedCourse.lessons} lessons</Badge>
                  <Badge variant="outline">{selectedCourse.duration}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm">{selectedCourse.rating} ({selectedCourse.reviews.toLocaleString()} reviews)</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Instructor: {selectedCourse.instructor}</span>
                <span className="text-2xl font-bold text-emerald-600">${selectedCourse.price}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✅ Lifetime access</p>
                <p>✅ Downloadable resources & project files</p>
                <p>✅ Certificate of completion</p>
                <p>✅ 30-day money-back guarantee</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedCourse(null)} className="flex-1">Cancel</Button>
                <Button onClick={() => handlePurchase(selectedCourse)} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  Purchase Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={() => setShowSuccess(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>🎉 Course Enrolled!</DialogTitle>
            <DialogDescription>You now have full access to this course.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            </motion.div>
            <div className="text-center space-y-1">
              <p className="font-medium">You&apos;re all set!</p>
              <p className="text-sm text-muted-foreground">Check &quot;My Courses&quot; to start learning.</p>
            </div>
            <Button onClick={() => setShowSuccess(false)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              Start Learning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
