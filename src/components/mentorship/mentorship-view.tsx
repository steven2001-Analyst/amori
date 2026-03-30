'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Star, Clock, Calendar, DollarSign, MapPin, Briefcase,
  MessageSquare, Video, CheckCircle2, XCircle, ChevronRight, X,
  Send, Loader2, ArrowLeft, Building2, GraduationCap, Award,
  Filter, Search, CalendarDays, StarOff, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ─── Types ───
interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  rating: number;
  reviews: number;
  price: number;
  expertise: string[];
  bio: string;
  specializations: string[];
  experience: string;
  sessions: number;
  gradient: string;
  availableDays: string[];
  timeSlots: string[];
}

interface Booking {
  id: string;
  mentorId: string;
  mentorName: string;
  date: string;
  time: string;
  topic: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: number;
  rating?: number;
  bookedAt: string;
}

// ─── Mentor Data ───
const mentors: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Dr. Sarah Chen',
    title: 'Senior Data Scientist',
    company: 'Google',
    avatar: 'SC',
    rating: 4.9,
    reviews: 342,
    price: 99.99,
    expertise: ['Machine Learning', 'Python', 'Deep Learning', 'NLP'],
    bio: 'PhD in Computer Science from Stanford. 12+ years of experience leading data science teams at top tech companies. Passionate about mentoring the next generation of data professionals.',
    specializations: ['ML Model Development', 'Career Transition to Data Science', 'Interview Prep', 'Research Projects'],
    experience: '12 years',
    sessions: 1240,
    gradient: 'from-violet-600 to-purple-600',
    availableDays: ['Mon', 'Wed', 'Fri'],
    timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
  },
  {
    id: 'mentor-2',
    name: 'James Rodriguez',
    title: 'Principal Data Engineer',
    company: 'Netflix',
    avatar: 'JR',
    rating: 4.8,
    reviews: 256,
    price: 79.99,
    expertise: ['Data Engineering', 'Spark', 'Airflow', 'AWS', 'GCP'],
    bio: 'Built data platforms processing petabytes of data at Netflix and Amazon. Expert in building scalable data systems and mentoring engineers on best practices.',
    specializations: ['Data Pipeline Design', 'System Architecture', 'Cloud Infrastructure', 'Technical Interviews'],
    experience: '15 years',
    sessions: 980,
    gradient: 'from-emerald-600 to-teal-600',
    availableDays: ['Tue', 'Thu', 'Sat'],
    timeSlots: ['10:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'],
  },
  {
    id: 'mentor-3',
    name: 'Lisa Wang',
    title: 'Director of Analytics',
    company: 'Microsoft',
    avatar: 'LW',
    rating: 4.7,
    reviews: 189,
    price: 89.99,
    expertise: ['Power BI', 'Tableau', 'SQL', 'Business Intelligence', 'Excel'],
    bio: 'Leading analytics strategy at Microsoft for 8+ years. Certified in multiple BI tools. I help analysts level up from basic reporting to strategic analytics.',
    specializations: ['Dashboard Design', 'DAX & Calculations', 'Data Modeling', 'Career Growth in BI'],
    experience: '14 years',
    sessions: 756,
    gradient: 'from-blue-600 to-indigo-600',
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    timeSlots: ['9:00 AM', '10:00 AM', '2:00 PM', '4:00 PM'],
  },
  {
    id: 'mentor-4',
    name: 'Michael Torres',
    title: 'ML Research Scientist',
    company: 'DeepMind',
    avatar: 'MT',
    rating: 4.9,
    reviews: 178,
    price: 99.99,
    expertise: ['Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch'],
    bio: 'Published researcher with 20+ papers in top ML conferences. Previously at OpenAI. I specialize in helping ambitious learners break into AI research and advanced ML roles.',
    specializations: ['ML Research Projects', 'Paper Writing', 'AI Career Paths', 'Advanced Neural Networks'],
    experience: '10 years',
    sessions: 620,
    gradient: 'from-pink-600 to-rose-600',
    availableDays: ['Wed', 'Fri', 'Sat'],
    timeSlots: ['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '4:00 PM'],
  },
  {
    id: 'mentor-5',
    name: 'Emily Zhang',
    title: 'Head of Data Analytics',
    company: 'Airbnb',
    avatar: 'EZ',
    rating: 4.8,
    reviews: 215,
    price: 49.99,
    expertise: ['Statistics', 'A/B Testing', 'Python', 'R', 'Data Storytelling'],
    bio: 'I lead the analytics team at Airbnb, focusing on experimentation and product insights. I love helping analysts develop strong statistical thinking and communication skills.',
    specializations: ['A/B Test Design', 'Statistical Analysis', 'Product Analytics', 'Data Communication'],
    experience: '9 years',
    sessions: 890,
    gradient: 'from-cyan-600 to-sky-600',
    availableDays: ['Mon', 'Wed', 'Thu', 'Sat'],
    timeSlots: ['9:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '5:00 PM'],
  },
  {
    id: 'mentor-6',
    name: 'Kevin Park',
    title: 'Cloud Data Architect',
    company: 'Amazon Web Services',
    avatar: 'KP',
    rating: 4.7,
    reviews: 143,
    price: 79.99,
    expertise: ['AWS', 'GCP', 'Data Lakes', 'Snowflake', 'dbt'],
    bio: 'Architect of cloud data platforms at AWS. I help data professionals design modern, scalable data architectures and prepare for cloud certification exams.',
    specializations: ['Cloud Architecture', 'Data Lake Design', 'Cost Optimization', 'Certification Prep'],
    experience: '11 years',
    sessions: 540,
    gradient: 'from-amber-500 to-orange-600',
    availableDays: ['Tue', 'Wed', 'Fri'],
    timeSlots: ['10:00 AM', '1:00 PM', '3:00 PM', '4:00 PM'],
  },
];

const specializations = ['All', 'Machine Learning', 'Data Engineering', 'Business Intelligence', 'Cloud', 'Statistics', 'Career'];

function loadBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('dt-bookings');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveBookings(bookings: Booking[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dt-bookings', JSON.stringify(bookings));
  }
}

export default function MentorshipView() {
  const [bookings, setBookings] = useState<Booking[]>(loadBookings);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingStep, setBookingStep] = useState<'details' | 'confirm'>('details');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('All');
  const [filterPrice, setFilterPrice] = useState<'all' | 'under75' | 'under100' | '100plus'>('all');
  const [ratingDialog, setRatingDialog] = useState<Booking | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [activeTab, setActiveTab] = useState('browse');

  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.company.toLowerCase().includes(search.toLowerCase()) && !m.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filterSpec !== 'All' && !m.specializations.some((s) => s.toLowerCase().includes(filterSpec.toLowerCase())) && !m.expertise.some((e) => e.toLowerCase().includes(filterSpec.toLowerCase()))) return false;
      if (filterPrice === 'under75' && m.price >= 75) return false;
      if (filterPrice === 'under100' && m.price >= 100) return false;
      if (filterPrice === '100plus' && m.price < 100) return false;
      return true;
    });
  }, [search, filterSpec, filterPrice]);

  const upcomingSessions = bookings.filter((b) => b.status === 'upcoming');
  const completedSessions = bookings.filter((b) => b.status === 'completed');
  const cancelledSessions = bookings.filter((b) => b.status === 'cancelled');

  const handleBook = async () => {
    if (!selectedMentor || !selectedDate || !selectedTime || !topic.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setBookingLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const booking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mentorId: selectedMentor.id,
      mentorName: selectedMentor.name,
      date: selectedDate,
      time: selectedTime,
      topic: topic.trim(),
      status: 'upcoming',
      price: selectedMentor.price,
      bookedAt: new Date().toISOString(),
    };
    const newBookings = [...bookings, booking];
    setBookings(newBookings);
    saveBookings(newBookings);
    setBookingLoading(false);
    setBookingStep('confirm');
    toast.success('Session booked successfully!');
  };

  const cancelBooking = (id: string) => {
    const newBookings = bookings.map((b) => b.id === id ? { ...b, status: 'cancelled' as const } : b);
    setBookings(newBookings);
    saveBookings(newBookings);
    toast.success('Session cancelled.');
  };

  const completeSession = (id: string) => {
    const newBookings = bookings.map((b) => b.id === id ? { ...b, status: 'completed' as const } : b);
    setBookings(newBookings);
    saveBookings(newBookings);
    toast.success('Session marked as completed.');
  };

  const submitRating = () => {
    if (!ratingDialog) return;
    const newBookings = bookings.map((b) => b.id === ratingDialog.id ? { ...b, rating: ratingValue } : b);
    setBookings(newBookings);
    saveBookings(newBookings);
    setRatingDialog(null);
    toast.success('Thank you for your rating!');
  };

  const generateDates = (mentor: Mentor) => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (mentor.availableDays.includes(dayName)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
          />
        ))}
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
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Mentorship</h1>
            <p className="text-muted-foreground text-sm">Book 1-on-1 sessions with industry experts</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="browse">Browse Mentors</TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming {upcomingSessions.length > 0 && `(${upcomingSessions.length})`}
          </TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>

        {/* ─── Browse Mentors ─── */}
        <TabsContent value="browse" className="space-y-5 mt-5">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors, skills, companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterSpec}
                onChange={(e) => setFilterSpec(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm bg-muted hover:bg-muted/80 border-0 cursor-pointer"
              >
                {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value as typeof filterPrice)}
                className="px-3 py-2 rounded-lg text-sm bg-muted hover:bg-muted/80 border-0 cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="under75">Under $75</option>
                <option value="under100">Under $100</option>
                <option value="100plus">$100+</option>
              </select>
            </div>
          </div>

          {/* Mentor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 h-full flex flex-col cursor-pointer"
                  onClick={() => setSelectedMentor(mentor)}>
                  <div className={`h-2 bg-gradient-to-r ${mentor.gradient}`} />
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mentor.gradient} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg`}>
                        {mentor.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base">{mentor.name}</h3>
                        <p className="text-xs text-muted-foreground">{mentor.title}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {mentor.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      {renderStars(mentor.rating)}
                      <span className="text-xs text-muted-foreground">{mentor.rating} ({mentor.reviews})</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {mentor.expertise.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] py-0">{tag}</Badge>
                      ))}
                      {mentor.expertise.length > 4 && (
                        <Badge variant="secondary" className="text-[10px] py-0">+{mentor.expertise.length - 4}</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div>
                        <span className="text-xl font-bold">${mentor.price}</span>
                        <span className="text-xs text-muted-foreground">/session</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{mentor.sessions} sessions</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      onClick={(e) => { e.stopPropagation(); setSelectedMentor(mentor); setBookingDialog(true); setBookingStep('details'); }}>
                      <Calendar className="w-4 h-4 mr-2" /> Book Session
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No mentors found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        {/* ─── Upcoming Sessions ─── */}
        <TabsContent value="upcoming" className="space-y-4 mt-5">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No upcoming sessions</h3>
              <p className="text-sm text-muted-foreground mb-4">Book a session with a mentor to get started</p>
              <Button onClick={() => setActiveTab('browse')} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                Browse Mentors
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold shrink-0">
                          {booking.mentorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{booking.topic}</h4>
                          <p className="text-xs text-muted-foreground">{booking.mentorName}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(booking.date)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.time}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-[10px]">Upcoming</Badge>
                          <span className="text-sm font-bold">${booking.price}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button size="sm" className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => completeSession(booking.id)}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => cancelBooking(booking.id)}>
                          <XCircle className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Past Sessions ─── */}
        <TabsContent value="past" className="space-y-4 mt-5">
          {[...completedSessions, ...cancelledSessions].length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No past sessions</h3>
              <p className="text-sm text-muted-foreground">Your completed and cancelled sessions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...completedSessions, ...cancelledSessions].map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border/50 opacity-80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                          {booking.mentorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{booking.topic}</h4>
                          <p className="text-xs text-muted-foreground">{booking.mentorName}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(booking.date)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.time}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'} className={`text-[10px] ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'}`}>
                            {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </Badge>
                          {booking.rating && renderStars(booking.rating)}
                        </div>
                      </div>
                      {booking.status === 'completed' && !booking.rating && (
                        <div className="mt-3 pt-3 border-t">
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setRatingDialog(booking); setRatingValue(5); }}>
                            <Star className="w-3 h-3 mr-1 text-amber-500" /> Rate Session
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Mentor Detail Dialog ─── */}
      <Dialog open={!!selectedMentor && !bookingDialog} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedMentor && (
            <>
              <div className={`h-32 -mx-6 -mt-6 mb-4 bg-gradient-to-r ${selectedMentor.gradient} rounded-t-xl flex items-center justify-center relative`}>
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedMentor.avatar}
                </div>
              </div>
              <DialogHeader>
                <DialogTitle>{selectedMentor.name}</DialogTitle>
                <DialogDescription>{selectedMentor.title} at {selectedMentor.company} · {selectedMentor.experience} experience</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {renderStars(selectedMentor.rating)}
                  <span className="text-sm text-muted-foreground">{selectedMentor.rating} ({selectedMentor.reviews} reviews) · {selectedMentor.sessions} sessions</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedMentor.bio}</p>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMentor.specializations.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Available Days</h4>
                  <div className="flex gap-1.5">
                    {selectedMentor.availableDays.map((d) => (
                      <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-11"
                  onClick={() => { setBookingDialog(true); setBookingStep('details'); }}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Book Session - ${selectedMentor.price}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Booking Dialog ─── */}
      <Dialog open={bookingDialog} onOpenChange={(open) => { if (!open) { setBookingDialog(false); setBookingStep('details'); setSelectedDate(''); setSelectedTime(''); setTopic(''); setNotes(''); } }}>
        <DialogContent className="sm:max-w-md">
          {selectedMentor && (
            <>
              {bookingStep === 'details' ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" /> Book Session with {selectedMentor.name}
                    </DialogTitle>
                    <DialogDescription>Choose a date, time, and topic for your session</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Date</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {generateDates(selectedMentor).map((date) => (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              selectedDate === date
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            {formatDate(date)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="text-sm font-medium mb-2 block">Select Time</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedMentor.timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                selectedTime === time
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {selectedTime && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Topic / Area of Discussion *</label>
                          <Input
                            placeholder="e.g., Career advice, SQL optimization, ML project review..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Additional Notes (optional)</label>
                          <Textarea
                            placeholder="Any specific questions or context for the mentor..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => { setBookingDialog(false); setBookingStep('details'); }}>Cancel</Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      disabled={!selectedDate || !selectedTime || !topic.trim() || bookingLoading}
                      onClick={handleBook}
                    >
                      {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <><Sparkles className="w-4 h-4 mr-2" /> Confirm Booking</>}
                    </Button>
                  </div>
                </>
              ) : (
                /* Confirmation */
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Session Booked!</h3>
                    <p className="text-sm text-muted-foreground mt-1">Your mentorship session has been confirmed</p>
                  </div>
                  <Card className="border-0 bg-muted/50">
                    <CardContent className="p-5 text-left space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedMentor.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                          {selectedMentor.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{selectedMentor.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedMentor.title} at {selectedMentor.company}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-semibold">{formatDate(selectedDate)}</p>
                        </div>
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="font-semibold">{selectedTime}</p>
                        </div>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Topic</p>
                        <p className="font-semibold text-sm">{topic}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Session Fee</span>
                        <span className="text-lg font-bold">${selectedMentor.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-xs text-muted-foreground">You&apos;ll receive a reminder 30 minutes before the session. A video call link will be provided via email.</p>
                  <Button className="w-full" onClick={() => { setBookingDialog(false); setBookingStep('details'); setSelectedDate(''); setSelectedTime(''); setTopic(''); setNotes(''); }}>
                    Done
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Rating Dialog ─── */}
      <Dialog open={!!ratingDialog} onOpenChange={() => setRatingDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Rate Your Session</DialogTitle>
            <DialogDescription>How was your session with {ratingDialog?.mentorName}?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRatingValue(star)}>
                <Star
                  className={`w-10 h-10 transition-all ${star <= ratingValue ? 'text-amber-400 fill-amber-400 scale-110' : 'text-muted-foreground/30 hover:text-amber-300'}`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {ratingValue === 5 ? 'Excellent!' : ratingValue === 4 ? 'Great' : ratingValue === 3 ? 'Good' : ratingValue === 2 ? 'Fair' : 'Needs Improvement'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setRatingDialog(null)}>Cancel</Button>
            <Button className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white" onClick={submitRating}>
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
