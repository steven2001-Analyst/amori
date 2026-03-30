'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Play, RotateCcw, Clock, Rows3, AlertCircle,
  ChevronRight, Table2, Hash, Type, Calendar, DollarSign,
  MapPin, Building2, Users, TrendingUp, FileText, Zap,
  Copy, Check, BookOpen, Search, CreditCard, ShoppingBag, Briefcase, Globe, Landmark, Star, Mail, GraduationCap, ShieldCheck, Heart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/* ─── Data Generators ─── */
function generateTransactions(): Record<string, unknown>[] {
  const types = ['credit','debit','transfer'];
  const categories = ['Shopping','Food & Dining','Transportation','Entertainment','Bills & Utilities','Healthcare','Income','Transfer','Subscription','ATM Withdrawal','Insurance','Investment'];
  const merchants = ['Amazon','Walmart','Target','Costco','Starbucks','Uber','Netflix','Apple','Whole Foods','Shell','CVS','Home Depot','Best Buy','Sprint','Comcast','Delta Airlines','Airbnb','Spotify','DoorDash','Chase Bank'];
  const statuses = ['completed','completed','completed','completed','completed','pending','failed'];
  const cardTypes = ['Visa','Mastercard','Amex','Debit'];
  const currencies = ['USD','USD','USD','EUR','GBP'];
  const descriptions = [
    'Online purchase','Grocery shopping','Gas station fill-up','Monthly subscription','Restaurant dinner','Electric bill payment','Doctor visit copay','Salary direct deposit','Wire transfer to savings','ATM cash withdrawal',
    'Insurance premium','Stock investment purchase','Morning coffee','Gym membership fee','Phone bill payment','Internet service bill','Car loan payment','Rent payment','Freelance payment received','Quarterly bonus',
    'Movie tickets','Bookstore purchase','Clothing store','Pharmacy prescription','Veterinary visit','Car repair service','Home improvement','Travel booking','Hotel accommodation','Flight ticket',
  ];
  const startMs = new Date('2025-01-01').getTime();
  const endMs = new Date('2026-03-15').getTime();
  const range = endMs - startMs;
  return Array.from({ length: 100 }, (_, i) => {
    const d = new Date(startMs + (i / 99) * range);
    const cat = categories[i % 12];
    const isIncome = cat === 'Income';
    return {
      id: i + 1,
      transaction_date: d.toISOString().split('T')[0],
      transaction_type: isIncome ? 'credit' : types[i % 3],
      amount: isIncome ? Math.round(2000 + (i * 37) % 8000) : Math.round((5 + (i * 13) % 495) * 100) / 100,
      currency: currencies[i % 5],
      category: cat,
      description: descriptions[i % 30],
      status: statuses[i % 7],
      account_id: 1000 + (i % 25),
      merchant: merchants[i % 20],
      card_type: cardTypes[i % 4],
    };
  });
}

function generateBankAccounts(): Record<string, unknown>[] {
  const types = ['checking','savings','business','credit'];
  const levels = ['Standard','Standard','Standard','Premium','Premium','Platinum'];
  const cities = [
    {city:'New York',state:'NY',country:'US'},{city:'Los Angeles',state:'CA',country:'US'},{city:'Chicago',state:'IL',country:'US'},
    {city:'Houston',state:'TX',country:'US'},{city:'Phoenix',state:'AZ',country:'US'},{city:'San Francisco',state:'CA',country:'US'},
    {city:'Seattle',state:'WA',country:'US'},{city:'Denver',state:'CO',country:'US'},{city:'Boston',state:'MA',country:'US'},
    {city:'Atlanta',state:'GA',country:'US'},{city:'Miami',state:'FL',country:'US'},{city:'Dallas',state:'TX',country:'US'},
    {city:'Austin',state:'TX',country:'US'},{city:'London',state:'England',country:'UK'},{city:'Manchester',state:'England',country:'UK'},
    {city:'Edinburgh',state:'Scotland',country:'UK'},{city:'Toronto',state:'ON',country:'Canada'},{city:'Vancouver',state:'BC',country:'Canada'},
    {city:'Sydney',state:'NSW',country:'Australia'},{city:'Berlin',state:'Berlin',country:'Germany'},
  ];
  const branches = ['Downtown','Westside','Eastside','Central','Harbor','Uptown','Midtown','Riverside','Lakeside','Parkview'];
  const currencies = ['USD','USD','USD','GBP','GBP','EUR','CAD','AUD','EUR','USD'];
  const holders = [
    'James Mitchell','Sarah Connor','Michael Chen','Emily Watson','Robert Kim','Jennifer Lopez','David Park','Amanda Foster',
    'Christopher Lee','Jessica Taylor','Daniel Martinez','Rachel Green','Andrew Thompson','Nicole Brown','Kevin Wilson',
    'Stephanie Anderson','Brian Jackson','Megan White','Jason Harris','Lauren Clark','Ryan Lewis','Ashley Robinson',
    'Brandon Walker','Samantha Hall','Justin Young','Katherine Allen','Nathan King','Brittany Wright','Tyler Scott',
    'Christina Adams','Gregory Baker','Michelle Nelson','Patrick Hill','Rebecca Campbell','Douglas Mitchell',
    'Alexandra Roberts','Timothy Carter','Deborah Phillips','Sean Evans','Hannah Turner','Ian Collins',
    'Olivia Edwards','Derek Stewart','Maria Flores','Lance Morgan','Katie Morris','Travis Murphy',
    'Valerie Rivera','Craig Peterson','Diana Sanchez','Brent Rogers','Angela Gray','Warren Ramirez',
    'Janet James','Leonard Jenkins','Chloe Burns','Wesley Gordon','Monica Shaw','Keith Dunn',
    'Cynthia Hoffman','Jerome Quinn','Paige Butler','Ralph Santos','Tracey Munoz','Stanley Woods',
    'Miriam Bowen','Homer Powell','Lena Mack','Omar Cole','Lucia Barrett','Derek Wagner',
    'Natasha Dixon','Randy Grant','Ebony Luna','Calvin Lane','Darlene Dean','Reginald Silva',
    'Mabel Garrett','Felix Brady','Cora Fields','Marion Owens','Tanya Gomez','Claude Newton',
    'Esther Boyd','Irving Mason','Cecilia Walton','Elijah Freeman','Violet Schmidt','Brent Reese',
    'Rosa Estrada','Lyndon Huff','Alma Vargas','Sammy Estrada','Aileen Krueger','Garth Delgado',
    'Helga Stokes','Rolando Perkins','Claudette Valdez','Dario Hampton','Kari Rich','Bobbie Rowland',
    'Linda May','Marco Mclean','Isabelle Chase','Duane Hooper','Marta Giles','Clyde Zamora',
  ];
  return Array.from({ length: 100 }, (_, i) => {
    const loc = cities[i % 20];
    const lvl = levels[i % 6];
    const balMult = lvl === 'Platinum' ? 50000 : lvl === 'Premium' ? 5000 : 500;
    const isActive = i < 92;
    const openYear = 2018 + (i % 7);
    const openMonth = 1 + (i % 12);
    const openDay = 1 + (i % 28);
    return {
      id: i + 1,
      account_number: `****${String(1000 + i * 137 % 9000).padStart(4,'0')}`,
      account_holder: holders[i % 96],
      account_type: types[i % 4],
      balance: Math.round(50 + (i * 31 + 7) % (balMult - 50)),
      branch: branches[i % 10],
      city: loc.city,
      state: loc.state,
      country: loc.country,
      currency: currencies[i % 10],
      is_active: isActive,
      opened_date: `${openYear}-${String(openMonth).padStart(2,'0')}-${String(openDay).padStart(2,'0')}`,
      last_transaction_date: isActive ? `2026-0${1 + (i % 3)}-${String(1 + (i % 28)).padStart(2,'0')}` : `2025-${String(6 + (i % 6)).padStart(2,'0')}-${String(1 + (i % 28)).padStart(2,'0')}`,
      credit_score: 550 + (i * 3) % 301,
      account_level: lvl,
    };
  });
}

function generateProducts(): Record<string, unknown>[] {
  const cats = ['Produce','Dairy','Meat','Bakery','Beverages','Snacks','Frozen','Health & Wellness','Household','Personal Care'];
  const dietaryOptions = ['vegan','vegetarian','gluten-free','none'];
  const data: Record<string, unknown>[] = [
    // Produce (10)
    {id:1,product_name:'Organic Bananas',category:'Produce',brand:'Dole',price:1.29,quantity_in_stock:450,unit:'lb',supplier:'Fresh Farms Co',aisle:'A1',on_sale:true,discount_percent:15,rating:4,dietary:'vegan'},
    {id:2,product_name:'Baby Spinach',category:'Produce',brand:'Earthbound Farm',price:3.49,quantity_in_stock:280,unit:'pack',supplier:'Green Valley',aisle:'A1',on_sale:false,discount_percent:0,rating:5,dietary:'vegan'},
    {id:3,product_name:'Avocados (Hass)',category:'Produce',brand:'Mission',price:1.99,quantity_in_stock:320,unit:'each',supplier:'Tropical Direct',aisle:'A1',on_sale:true,discount_percent:10,rating:4,dietary:'vegan'},
    {id:4,product_name:'Red Bell Peppers',category:'Produce',brand:'Local Farms',price:2.49,quantity_in_stock:200,unit:'each',supplier:'Green Valley',aisle:'A1',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:5,product_name:'Organic Blueberries',category:'Produce',brand:'Driscoll',price:4.99,quantity_in_stock:150,unit:'pack',supplier:'Berry Best',aisle:'A2',on_sale:true,discount_percent:20,rating:5,dietary:'vegan'},
    {id:6,product_name:'Sweet Potatoes',category:'Produce',brand:'Bruce',price:1.49,quantity_in_stock:380,unit:'lb',supplier:'Fresh Farms Co',aisle:'A2',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:7,product_name:'Roma Tomatoes',category:'Produce',brand:'NatureSweet',price:2.99,quantity_in_stock:260,unit:'pack',supplier:'Green Valley',aisle:'A2',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:8,product_name:'Organic Kale',category:'Produce',brand:'Earthbound Farm',price:2.79,quantity_in_stock:190,unit:'bunch',supplier:'Fresh Farms Co',aisle:'A2',on_sale:true,discount_percent:10,rating:4,dietary:'vegan'},
    {id:9,product_name:'Yellow Onions',category:'Produce',brand:'Local Farms',price:0.99,quantity_in_stock:500,unit:'lb',supplier:'Green Valley',aisle:'A3',on_sale:false,discount_percent:0,rating:3,dietary:'vegan'},
    {id:10,product_name:'Strawberries',category:'Produce',brand:'Driscoll',price:3.99,quantity_in_stock:175,unit:'pack',supplier:'Berry Best',aisle:'A3',on_sale:true,discount_percent:25,rating:5,dietary:'vegan'},
    // Dairy (10)
    {id:11,product_name:'Whole Milk',category:'Dairy',brand:'Organic Valley',price:4.49,quantity_in_stock:300,unit:'liter',supplier:'Dairy Direct',aisle:'B1',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:12,product_name:'Greek Yogurt Plain',category:'Dairy',brand:'Chobani',price:5.49,quantity_in_stock:220,unit:'pack',supplier:'Dairy Direct',aisle:'B1',on_sale:true,discount_percent:15,rating:5,dietary:'vegetarian'},
    {id:13,product_name:'Cheddar Cheese Block',category:'Dairy',brand:'Tillamook',price:6.99,quantity_in_stock:180,unit:'pack',supplier:'Cheese Masters',aisle:'B1',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:14,product_name:'Large Brown Eggs',category:'Dairy',brand:'Organic Valley',price:5.99,quantity_in_stock:250,unit:'pack',supplier:'Dairy Direct',aisle:'B2',on_sale:false,discount_percent:0,rating:5,dietary:'vegetarian'},
    {id:15,product_name:'Butter Unsalted',category:'Dairy',brand:'Kerrygold',price:4.99,quantity_in_stock:200,unit:'pack',supplier:'Dairy Direct',aisle:'B2',on_sale:true,discount_percent:10,rating:5,dietary:'vegetarian'},
    {id:16,product_name:'Oikos Triple Zero Yogurt',category:'Dairy',brand:'Oikos',price:4.29,quantity_in_stock:260,unit:'pack',supplier:'Dairy Direct',aisle:'B2',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:17,product_name:'Sour Cream',category:'Dairy',brand:'Daisy',price:2.49,quantity_in_stock:190,unit:'pack',supplier:'Dairy Direct',aisle:'B2',on_sale:false,discount_percent:0,rating:3,dietary:'vegetarian'},
    {id:18,product_name:'Mozzarella Shredded',category:'Dairy',brand:'Sargento',price:3.99,quantity_in_stock:210,unit:'pack',supplier:'Cheese Masters',aisle:'B3',on_sale:true,discount_percent:20,rating:4,dietary:'vegetarian'},
    {id:19,product_name:'Heavy Cream',category:'Dairy',brand:'Organic Valley',price:5.29,quantity_in_stock:140,unit:'liter',supplier:'Dairy Direct',aisle:'B3',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:20,product_name:'Cream Cheese',category:'Dairy',brand:'Philadelphia',price:3.49,quantity_in_stock:230,unit:'pack',supplier:'Dairy Direct',aisle:'B3',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    // Meat (10)
    {id:21,product_name:'Chicken Breast',category:'Meat',brand:'Tyson',price:7.99,quantity_in_stock:160,unit:'lb',supplier:'Meat Producers Inc',aisle:'C1',on_sale:true,discount_percent:10,rating:4,dietary:'none'},
    {id:22,product_name:'Ground Beef 80/20',category:'Meat',brand:'Certified Angus',price:6.49,quantity_in_stock:140,unit:'lb',supplier:'Meat Producers Inc',aisle:'C1',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:23,product_name:'Atlantic Salmon Fillet',category:'Meat',brand:'Fresh Catch',price:12.99,quantity_in_stock:90,unit:'lb',supplier:'Ocean Harvest',aisle:'C1',on_sale:false,discount_percent:0,rating:5,dietary:'none'},
    {id:24,product_name:'Pork Chops Bone-In',category:'Meat',brand:'Smithfield',price:5.99,quantity_in_stock:120,unit:'lb',supplier:'Meat Producers Inc',aisle:'C2',on_sale:true,discount_percent:15,rating:4,dietary:'none'},
    {id:25,product_name:'Turkey Breast Sliced',category:'Meat',brand:'Butterball',price:6.49,quantity_in_stock:110,unit:'pack',supplier:'Meat Producers Inc',aisle:'C2',on_sale:false,discount_percent:0,rating:3,dietary:'none'},
    {id:26,product_name:'Shrimp Large Frozen',category:'Meat',brand:'SeaPak',price:9.99,quantity_in_stock:85,unit:'pack',supplier:'Ocean Harvest',aisle:'C2',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:27,product_name:'Bacon Thick Cut',category:'Meat',brand:'Hormel',price:7.49,quantity_in_stock:130,unit:'pack',supplier:'Meat Producers Inc',aisle:'C3',on_sale:true,discount_percent:20,rating:5,dietary:'none'},
    {id:28,product_name:'Lamb Chops',category:'Meat',brand:'Australian Lamb',price:14.99,quantity_in_stock:60,unit:'lb',supplier:'Premium Meats',aisle:'C3',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:29,product_name:'Pasta',category:'Food',brand:'FoodCo',price:4.99,quantity_in_stock:200,unit:'pack',supplier:'Food Distributors',aisle:'C3',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:30,product_name:'Tilapia Fillets',category:'Meat',brand:'Gorton',price:6.99,quantity_in_stock:95,unit:'pack',supplier:'Ocean Harvest',aisle:'C3',on_sale:true,discount_percent:10,rating:3,dietary:'none'},
    // Bakery (10)
    {id:31,product_name:'Sourdough Bread',category:'Bakery',brand:'La Brea',price:4.99,quantity_in_stock:80,unit:'each',supplier:'Artisan Bakers',aisle:'D1',on_sale:false,discount_percent:0,rating:5,dietary:'vegan'},
    {id:32,product_name:'Whole Wheat Tortillas',category:'Bakery',brand:'Mission',price:3.49,quantity_in_stock:200,unit:'pack',supplier:'Artisan Bakers',aisle:'D1',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:33,product_name:'Chocolate Chip Cookies',category:'Bakery',brand:'Pepperidge Farm',price:4.29,quantity_in_stock:170,unit:'pack',supplier:'Sweet Treats Co',aisle:'D1',on_sale:true,discount_percent:15,rating:5,dietary:'vegetarian'},
    {id:34,product_name:'Bagels Everything',category:'Bakery',brand:'Thomas',price:4.49,quantity_in_stock:130,unit:'pack',supplier:'Artisan Bakers',aisle:'D2',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:35,product_name:'Croissants Butter',category:'Bakery',brand:'Private Selection',price:5.99,quantity_in_stock:90,unit:'pack',supplier:'Artisan Bakers',aisle:'D2',on_sale:false,discount_percent:0,rating:5,dietary:'vegetarian'},
    {id:36,product_name:'Banana Nut Muffins',category:'Bakery',brand:'Entenmann',price:4.79,quantity_in_stock:110,unit:'pack',supplier:'Sweet Treats Co',aisle:'D2',on_sale:true,discount_percent:20,rating:4,dietary:'vegetarian'},
    {id:37,product_name:'Ciabatta Rolls',category:'Bakery',brand:'Pepperidge Farm',price:3.99,quantity_in_stock:100,unit:'pack',supplier:'Artisan Bakers',aisle:'D2',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:38,product_name:'White Sandwich Bread',category:'Bakery',brand:'Wonder',price:2.99,quantity_in_stock:250,unit:'each',supplier:'Artisan Bakers',aisle:'D3',on_sale:false,discount_percent:0,rating:3,dietary:'vegan'},
    {id:39,product_name:'Cinnamon Raisin Bread',category:'Bakery',brand:'Sara Lee',price:3.79,quantity_in_stock:120,unit:'each',supplier:'Sweet Treats Co',aisle:'D3',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:40,product_name:'Pita Bread',category:'Bakery',brand:'Joseph',price:3.29,quantity_in_stock:140,unit:'pack',supplier:'Artisan Bakers',aisle:'D3',on_sale:true,discount_percent:10,rating:4,dietary:'vegan'},
    // Beverages (10)
    {id:41,product_name:'Coca-Cola Classic',category:'Beverages',brand:'Coca-Cola',price:1.99,quantity_in_stock:400,unit:'pack',supplier:'BevCo Distributors',aisle:'E1',on_sale:true,discount_percent:10,rating:4,dietary:'vegan'},
    {id:42,product_name:'Orange Juice',category:'Beverages',brand:'Tropicana',price:4.49,quantity_in_stock:220,unit:'liter',supplier:'BevCo Distributors',aisle:'E1',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:43,product_name:'Sparkling Water',category:'Beverages',brand:'LaCroix',price:5.49,quantity_in_stock:280,unit:'pack',supplier:'BevCo Distributors',aisle:'E1',on_sale:true,discount_percent:15,rating:4,dietary:'vegan'},
    {id:44,product_name:'Green Tea',category:'Beverages',brand:'Arizona',price:1.49,quantity_in_stock:350,unit:'pack',supplier:'Tea Time Ltd',aisle:'E2',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:45,product_name:'Cold Brew Coffee',category:'Beverages',brand:'Starbucks',price:5.99,quantity_in_stock:160,unit:'pack',supplier:'BevCo Distributors',aisle:'E2',on_sale:false,discount_percent:0,rating:5,dietary:'vegan'},
    {id:46,product_name:'Almond Milk',category:'Beverages',brand:'Califia Farms',price:4.29,quantity_in_stock:200,unit:'liter',supplier:'BevCo Distributors',aisle:'E2',on_sale:true,discount_percent:10,rating:4,dietary:'vegan'},
    {id:47,product_name:'Coconut Water',category:'Beverages',brand:'Vita Coco',price:3.49,quantity_in_stock:180,unit:'pack',supplier:'BevCo Distributors',aisle:'E3',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:48,product_name:'Lemonade',category:'Beverages',brand:'Simply',price:3.99,quantity_in_stock:170,unit:'liter',supplier:'BevCo Distributors',aisle:'E3',on_sale:false,discount_percent:0,rating:5,dietary:'vegan'},
    {id:49,product_name:'Energy Drink',category:'Beverages',brand:'Red Bull',price:2.99,quantity_in_stock:300,unit:'pack',supplier:'BevCo Distributors',aisle:'E3',on_sale:true,discount_percent:20,rating:3,dietary:'vegan'},
    {id:50,product_name:'Kombucha',category:'Beverages',brand:'GT',price:4.49,quantity_in_stock:130,unit:'pack',supplier:'BevCo Distributors',aisle:'E3',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    // Snacks (10)
    {id:51,product_name:'Tortilla Chips',category:'Snacks',brand:'Tostitos',price:3.99,quantity_in_stock:280,unit:'pack',supplier:'Snack World',aisle:'F1',on_sale:true,discount_percent:15,rating:4,dietary:'vegan'},
    {id:52,product_name:'Mixed Nuts',category:'Snacks',brand:'Planters',price:7.49,quantity_in_stock:150,unit:'pack',supplier:'Snack World',aisle:'F1',on_sale:false,discount_percent:0,rating:5,dietary:'vegan'},
    {id:53,product_name:'Granola Bars',category:'Snacks',brand:'Nature Valley',price:3.79,quantity_in_stock:220,unit:'pack',supplier:'Snack World',aisle:'F1',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:54,product_name:'Potato Chips BBQ',category:'Snacks',brand:'Lay',price:2.99,quantity_in_stock:310,unit:'pack',supplier:'Snack World',aisle:'F2',on_sale:true,discount_percent:10,rating:4,dietary:'vegan'},
    {id:55,product_name:'Dark Chocolate Bar',category:'Snacks',brand:'Lindt',price:3.49,quantity_in_stock:140,unit:'each',supplier:'Sweet Treats Co',aisle:'F2',on_sale:false,discount_percent:0,rating:5,dietary:'vegetarian'},
    {id:56,product_name:'Trail Mix',category:'Snacks',brand:'Kirkland',price:9.99,quantity_in_stock:100,unit:'pack',supplier:'Snack World',aisle:'F2',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:57,product_name:'Popcorn Microwave',category:'Snacks',brand:'Orville Redenbacher',price:2.49,quantity_in_stock:260,unit:'pack',supplier:'Snack World',aisle:'F2',on_sale:true,discount_percent:25,rating:3,dietary:'vegan'},
    {id:58,product_name:'Pretzels Salted',category:'Snacks',brand:'Snyder',price:3.29,quantity_in_stock:190,unit:'pack',supplier:'Snack World',aisle:'F3',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:59,product_name:'Beef Jerky',category:'Snacks',brand:'Jack Link',price:6.99,quantity_in_stock:130,unit:'pack',supplier:'Snack World',aisle:'F3',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:60,product_name:'Rice Cakes',category:'Snacks',brand:'Quaker',price:2.99,quantity_in_stock:200,unit:'pack',supplier:'Snack World',aisle:'F3',on_sale:true,discount_percent:10,rating:3,dietary:'vegan'},
    // Frozen (10)
    {id:61,product_name:'Frozen Pizza Margherita',category:'Frozen',brand:'DiGiorno',price:6.49,quantity_in_stock:150,unit:'each',supplier:'Frozen Foods Inc',aisle:'G1',on_sale:true,discount_percent:15,rating:4,dietary:'vegetarian'},
    {id:62,product_name:'Ice Cream Vanilla',category:'Frozen',brand:'Ben & Jerry',price:5.49,quantity_in_stock:130,unit:'pack',supplier:'Frozen Foods Inc',aisle:'G1',on_sale:false,discount_percent:0,rating:5,dietary:'vegetarian'},
    {id:63,product_name:'Frozen Vegetables Mix',category:'Frozen',brand:'Green Giant',price:2.49,quantity_in_stock:240,unit:'pack',supplier:'Frozen Foods Inc',aisle:'G1',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:64,product_name:'Frozen Burritos',category:'Frozen',brand:'El Monterey',price:4.99,quantity_in_stock:170,unit:'pack',supplier:'Frozen Foods Inc',aisle:'G2',on_sale:true,discount_percent:20,rating:3,dietary:'none'},
    {id:65,product_name:'Frozen Waffles',category:'Frozen',brand:'Eggo',price:3.79,quantity_in_stock:190,unit:'pack',supplier:'Frozen Foods Inc',aisle:'G2',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:66,product_name:'Fish Sticks',category:'Frozen',brand:'Gorton',price:5.99,quantity_in_stock:110,unit:'pack',supplier:'Ocean Harvest',aisle:'G2',on_sale:false,discount_percent:0,rating:3,dietary:'none'},
    {id:67,product_name:'Frozen French Fries',category:'Frozen',brand:'Ore-Ida',price:3.99,quantity_in_stock:200,unit:'pack',supplier:'Frozen Foods Inc',aisle:'G3',on_sale:true,discount_percent:10,rating:4,dietary:'vegan'},
    {id:68,product_name:'Frozen Meal Bowl',category:'Frozen',brand:'Healthy Choice',price:4.29,quantity_in_stock:160,unit:'each',supplier:'Frozen Foods Inc',aisle:'G3',on_sale:false,discount_percent:0,rating:3,dietary:'none'},
    {id:69,product_name:'Frozen Mango Chunks',category:'Frozen',brand:'Dole',price:3.99,quantity_in_stock:100,unit:'pack',supplier:'Tropical Direct',aisle:'G3',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:70,product_name:'Ice Cream Bars',category:'Frozen',brand:'Klondike',price:5.29,quantity_in_stock:120,unit:'pack',supplier:'Frozen Foods Inc',aisle:'G3',on_sale:true,discount_percent:15,rating:4,dietary:'vegetarian'},
    // Health & Wellness (10)
    {id:71,product_name:'Multivitamin Daily',category:'Health & Wellness',brand:'One A Day',price:12.99,quantity_in_stock:90,unit:'pack',supplier:'HealthFirst',aisle:'H1',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:72,product_name:'Protein Powder Vanilla',category:'Health & Wellness',brand:'Optimum Nutrition',price:29.99,quantity_in_stock:70,unit:'pack',supplier:'HealthFirst',aisle:'H1',on_sale:true,discount_percent:10,rating:5,dietary:'none'},
    {id:73,product_name:'Fish Oil Capsules',category:'Health & Wellness',brand:'Nature Made',price:14.49,quantity_in_stock:110,unit:'pack',supplier:'HealthFirst',aisle:'H1',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:74,product_name:'Green Tea Extract',category:'Health & Wellness',brand:'NOW Foods',price:9.99,quantity_in_stock:80,unit:'pack',supplier:'HealthFirst',aisle:'H2',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:75,product_name:'Vitamin D3',category:'Health & Wellness',brand:'Nature Bounty',price:8.49,quantity_in_stock:130,unit:'pack',supplier:'HealthFirst',aisle:'H2',on_sale:true,discount_percent:20,rating:4,dietary:'none'},
    {id:76,product_name:'Protein Bars',category:'Health & Wellness',brand:'Quest',price:24.99,quantity_in_stock:95,unit:'pack',supplier:'HealthFirst',aisle:'H2',on_sale:false,discount_percent:0,rating:5,dietary:'none'},
    {id:77,product_name:'Turmeric Curcumin',category:'Health & Wellness',brand:'Gaia Herbs',price:18.99,quantity_in_stock:65,unit:'pack',supplier:'HealthFirst',aisle:'H2',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:78,product_name:'Electrolyte Mix',category:'Health & Wellness',brand:'Nuun',price:7.99,quantity_in_stock:140,unit:'pack',supplier:'HealthFirst',aisle:'H3',on_sale:true,discount_percent:15,rating:4,dietary:'vegan'},
    {id:79,product_name:'Collagen Peptides',category:'Health & Wellness',brand:'Vital Proteins',price:22.99,quantity_in_stock:75,unit:'pack',supplier:'HealthFirst',aisle:'H3',on_sale:false,discount_percent:0,rating:5,dietary:'none'},
    {id:80,product_name:'Melatonin Gummies',category:'Health & Wellness',brand:'Olly',price:11.99,quantity_in_stock:100,unit:'pack',supplier:'HealthFirst',aisle:'H3',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    // Household (10)
    {id:81,product_name:'Paper Towels',category:'Household',brand:'Bounty',price:12.99,quantity_in_stock:180,unit:'pack',supplier:'Home Essentials',aisle:'I1',on_sale:true,discount_percent:10,rating:5,dietary:'none'},
    {id:82,product_name:'All-Purpose Cleaner',category:'Household',brand:'Lysol',price:3.99,quantity_in_stock:220,unit:'each',supplier:'Home Essentials',aisle:'I1',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:83,product_name:'Laundry Detergent',category:'Household',brand:'Tide',price:11.99,quantity_in_stock:160,unit:'liter',supplier:'Home Essentials',aisle:'I1',on_sale:false,discount_percent:0,rating:5,dietary:'none'},
    {id:84,product_name:'Dish Soap',category:'Household',brand:'Dawn',price:2.99,quantity_in_stock:280,unit:'each',supplier:'Home Essentials',aisle:'I2',on_sale:true,discount_percent:15,rating:4,dietary:'none'},
    {id:85,product_name:'Trash Bags',category:'Household',brand:'Glad',price:8.99,quantity_in_stock:200,unit:'pack',supplier:'Home Essentials',aisle:'I2',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:86,product_name:'Bleach',category:'Household',brand:'Clorox',price:3.49,quantity_in_stock:170,unit:'liter',supplier:'Home Essentials',aisle:'I2',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:87,product_name:'Dryer Sheets',category:'Household',brand:'Bounce',price:6.49,quantity_in_stock:150,unit:'pack',supplier:'Home Essentials',aisle:'I3',on_sale:false,discount_percent:0,rating:4,dietary:'none'},
    {id:88,product_name:'Glass Cleaner',category:'Household',brand:'Windex',price:3.29,quantity_in_stock:190,unit:'each',supplier:'Home Essentials',aisle:'I3',on_sale:true,discount_percent:20,rating:4,dietary:'none'},
    {id:89,product_name:'Sponges',category:'Household',brand:'Scotch-Brite',price:4.99,quantity_in_stock:240,unit:'pack',supplier:'Home Essentials',aisle:'I3',on_sale:false,discount_percent:0,rating:3,dietary:'none'},
    {id:90,product_name:'Air Freshener',category:'Household',brand:'Febreze',price:4.49,quantity_in_stock:170,unit:'each',supplier:'Home Essentials',aisle:'I3',on_sale:true,discount_percent:10,rating:4,dietary:'none'},
    // Personal Care (10)
    {id:91,product_name:'Shampoo',category:'Personal Care',brand:'Pantene',price:5.99,quantity_in_stock:200,unit:'each',supplier:'Beauty Corp',aisle:'J1',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:92,product_name:'Body Lotion',category:'Personal Care',brand:'Nivea',price:6.49,quantity_in_stock:170,unit:'each',supplier:'Beauty Corp',aisle:'J1',on_sale:true,discount_percent:15,rating:5,dietary:'vegetarian'},
    {id:93,product_name:'Toothpaste',category:'Personal Care',brand:'Colgate',price:3.99,quantity_in_stock:250,unit:'each',supplier:'Beauty Corp',aisle:'J1',on_sale:false,discount_percent:0,rating:4,dietary:'vegan'},
    {id:94,product_name:'Sunscreen SPF50',category:'Personal Care',brand:'Neutrogena',price:10.99,quantity_in_stock:120,unit:'each',supplier:'Beauty Corp',aisle:'J2',on_sale:false,discount_percent:0,rating:5,dietary:'vegan'},
    {id:95,product_name:'Hand Soap',category:'Personal Care',brand:'Softsoap',price:2.99,quantity_in_stock:230,unit:'each',supplier:'Beauty Corp',aisle:'J2',on_sale:true,discount_percent:10,rating:4,dietary:'vegetarian'},
    {id:96,product_name:'Deodorant',category:'Personal Care',brand:'Dove',price:4.99,quantity_in_stock:180,unit:'each',supplier:'Beauty Corp',aisle:'J2',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:97,product_name:'Face Moisturizer',category:'Personal Care',brand:'CeraVe',price:14.99,quantity_in_stock:90,unit:'each',supplier:'Beauty Corp',aisle:'J3',on_sale:false,discount_percent:0,rating:5,dietary:'vegetarian'},
    {id:98,product_name:'Razor Blades',category:'Personal Care',brand:'Gillette',price:12.49,quantity_in_stock:100,unit:'pack',supplier:'Beauty Corp',aisle:'J3',on_sale:true,discount_percent:20,rating:4,dietary:'none'},
    {id:99,product_name:'Lip Balm',category:'Personal Care',brand:'Burt',price:3.49,quantity_in_stock:280,unit:'each',supplier:'Beauty Corp',aisle:'J3',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
    {id:100,product_name:'Body Wash',category:'Personal Care',brand:'Old Spice',price:5.49,quantity_in_stock:160,unit:'each',supplier:'Beauty Corp',aisle:'J3',on_sale:false,discount_percent:0,rating:4,dietary:'vegetarian'},
  ];
  return data;
}

function generateEmployeesHR(): Record<string, unknown>[] {
  const firstNames = ['Alexander','Benjamin','Charlotte','Diana','Edward','Francesca','George','Helena','Isaac','Julia','Kenneth','Laura','Marcus','Natalie','Oliver','Patricia','Quentin','Rebecca','Samuel','Victoria','William','Xavier','Yvonne','Zachary','Abigail','Brandon','Catherine','Dominic','Eleanor','Felix','Gabriella','Henry','Irene','James','Katherine','Leonard','Margaret','Nathan','Ophelia','Peter','Quinn','Rachel','Sebastian','Tiffany','Ulysses','Vanessa','Winston','Ximena','Yusuf','Zoe'];
  const lastNames = ['Anderson','Baker','Carter','Dixon','Edwards','Foster','Garcia','Hamilton','Ibrahim','Jackson','Kim','Lambert','Mitchell','Nakamura','OConnor','Patel','Quinn','Rodriguez','Singh','Thompson','Upton','Vasquez','Williams','Xu','Young','Zimmerman','Brooks','Campbell','Donovan','Erikson','Fernandez','Grant','Hayes','Irving','Jensen','Kowalski','Larsen','Moreno','Nielsen','Olsen','Park','Reeves','Sullivan','Torres','Underwood','Vega','Wallace','Yamamoto','Zhang','Abbott'];
  const departments = ['Engineering','Engineering','Engineering','Marketing','Marketing','Sales','Sales','HR','Finance','Operations','Product','Legal','Support','Engineering','Marketing','Sales','HR','Finance','Operations','Product','Engineering','Support','Legal','Engineering','Product','Sales','Operations','HR','Finance','Marketing','Support','Engineering','Product','Engineering','Sales','Marketing','Operations','HR','Finance','Legal','Support','Engineering','Product','Sales','HR','Finance','Operations','Marketing','Support','Engineering','Product'];
  const levels = ['Junior','Mid','Mid','Senior','Senior','Lead','Manager','Manager','Director','VP','Junior','Mid','Senior','Lead','Senior','Mid','Junior','Senior','Manager','Lead','Director','Mid','Junior','Senior','VP','Manager','Mid','Senior','Lead','Junior','Mid','Senior','Lead','Manager','Junior','Mid','Senior','Lead','Manager','Director','VP','Junior','Mid','Senior','Lead','Manager','Mid','Senior','Junior','Mid','Lead','Senior','Manager','VP','Mid'];
  const positions = ['Software Engineer','Senior Developer','Tech Lead','Engineering Manager','Marketing Analyst','Sales Representative','HR Specialist','Financial Analyst','Operations Coordinator','Product Manager','DevOps Engineer','UX Designer','Data Analyst','Account Executive','Recruiter','Project Manager','Legal Counsel','Customer Support Lead','Backend Developer','Frontend Developer','QA Engineer','Marketing Manager','Sales Director','Content Strategist','Business Analyst','Systems Administrator','Network Engineer','Mobile Developer','Data Engineer','Security Analyst','Product Designer','Growth Marketing Manager','Revenue Operations','People Partner','Compliance Officer','Support Engineer','Solutions Architect','Technical Writer','Scrum Master','BI Developer','Automation Engineer','Brand Manager','Enterprise Sales','Talent Acquisition','Risk Analyst','Client Success Manager','Platform Engineer','Staff Engineer','Principal Engineer','VP of Engineering','Head of Product','Chief of Staff','Office Manager'];
  const educations = ['BS Computer Science','BA Marketing','MBA Finance','BS Engineering','MS Data Science','BA Business','BS Mathematics','MS Computer Engineering','BA Economics','BS Information Technology','MBA Harvard','BS Physics','MS Artificial Intelligence','BA Communications','JD Law','BS Biology','MS Statistics','BA Psychology','BS Electrical Engineering','MBA Stanford','BS Chemistry','MS Cybersecurity','BA Graphic Design','BS Mechanical Engineering','MS Management','BA Political Science','BS Industrial Engineering','MS Operations Research','BA Sociology','BS Healthcare Administration','MBA Wharton','MS Software Engineering','BA International Relations','BS Environmental Science','MS Business Analytics','BA Journalism','BS Architecture','MS Human Resources','BA Public Administration','BS Civil Engineering','MS Supply Chain','BA English Literature','BS Aerospace Engineering','MS Finance','BA Philosophy','BS Materials Science','MS Organizational Leadership','BA History','BS Biochemistry','MS Information Systems','BA Linguistics','BS Geology','MS Entrepreneurship','BA Music','BS Nursing','MBA Columbia'];
  const skills = ['Python, SQL, TensorFlow','JavaScript, React, TypeScript','Excel, Tableau, Power BI','AWS, Docker, Kubernetes','Java, Spring Boot, Microservices','Photoshop, Illustrator, Figma','Salesforce, HubSpot, Outreach','SAP, Oracle, QuickBooks','Agile, Scrum, Jira','Communication, Leadership','C++, Go, Rust','Node.js, Express, MongoDB','R, Python, Statistics','SEO, SEM, Google Analytics','Negotiation, CRM, B2B','Recruiting, ATS, ONET','Contract Law, Compliance','Zendesk, Intercom, Freshdesk','CI/CD, GitHub Actions, Jenkins','Swift, Kotlin, Flutter','GraphQL, REST, gRPC','CSS, HTML, Tailwind','Figma, Sketch, InVision','Power BI, DAX, SSRS','Linux, Bash, Networking','SQL Server, MySQL, PostgreSQL','Redis, Elasticsearch, Kafka','Tableau, Looker, Metabase','Flutter, React Native, Dart','Snowflake, dbt, BigQuery','Jira, Confluence, Asana','Databricks, Spark, Airflow','SharePoint, Teams, Outlook','AutoCAD, Revit, BIM','SPSS, SAS, Stata','Canva, Premiere, After Effects','Pandas, NumPy, Matplotlib','AB Testing, Mixpanel, Amplitude','Apex, Visualforce, Lightning','HRIS, Workday, BambooHR','Ansible, Terraform, Pulumi','OWASP, SANS, CompTIA','Lean, Six Sigma, Kaizen','Data modeling, ETL, warehousing'];
  const offices = ['New York HQ','San Francisco','Austin TX','Chicago IL','Seattle WA','London UK','Remote US','Denver CO','Boston MA','Miami FL','Toronto CA','Los Angeles CA','Atlanta GA','Dallas TX','Portland OR','Minneapolis MN','Phoenix AZ','Nashville TN','Austin TX','Remote EU','San Diego CA','Philadelphia PA','Pittsburgh PA','Columbus OH','Charlotte NC','Raleigh NC','Orlando FL','Tampa FL','Detroit MI','Indianapolis IN'];
  const statuses = ['active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','active','on_leave','on_leave','on_leave','terminated','terminated'];
  return Array.from({ length: 100 }, (_, i) => {
    const fn = firstNames[i % 50];
    const ln = lastNames[i % 50];
    const lvl = levels[i % levels.length];
    const baseSalary = lvl === 'Junior' ? 45000 : lvl === 'Mid' ? 75000 : lvl === 'Senior' ? 110000 : lvl === 'Lead' ? 135000 : lvl === 'Manager' ? 150000 : lvl === 'Director' ? 190000 : 250000;
    const salary = baseSalary + (i * 47) % 20000;
    const hireYear = 2018 + (i % 7);
    const hireMonth = 1 + (i % 12);
    const hireDay = 1 + (i % 28);
    const status = statuses[i % statuses.length];
    let termDate = null as string | null;
    if (status === 'terminated') {
      termDate = `2025-${String(1 + (i % 6)).padStart(2,'0')}-${String(1 + (i % 28)).padStart(2,'0')}`;
    }
    return {
      id: i + 1,
      first_name: fn,
      last_name: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@company.com`,
      department: departments[i % departments.length],
      position: positions[i % 50],
      level: lvl,
      salary,
      hire_date: `${hireYear}-${String(hireMonth).padStart(2,'0')}-${String(hireDay).padStart(2,'0')}`,
      termination_date: termDate,
      status,
      manager_id: i < 10 ? null : 1 + (i % 15),
      performance_rating: 1 + (i * 7) % 5,
      skills: skills[i % 50],
      education: educations[i % 50],
      years_of_experience: 1 + (i % 18),
      office_location: offices[i % 30],
    };
  });
}

/* ─── Sample Database ─── */
const SAMPLE_DB: Record<string, Record<string, unknown>[]> = {
  employees: [
    {id:1, name:'Student A', department:'Engineering', salary:75000, hire_date:'2024-06-15', city:'Boston'},
    { id: 2, name: 'Bob Smith', department: 'Sales', salary: 72000, hire_date: '2020-07-01', city: 'Chicago' },
    { id: 3, name: 'Carol Williams', department: 'Engineering', salary: 88000, hire_date: '2022-01-10', city: 'San Francisco' },
    { id: 4, name: 'David Brown', department: 'Marketing', salary: 68000, hire_date: '2019-11-20', city: 'New York' },
    { id: 5, name: 'Eva Martinez', department: 'Engineering', salary: 102000, hire_date: '2021-08-05', city: 'Austin' },
    { id: 6, name: 'Frank Lee', department: 'Sales', salary: 78000, hire_date: '2023-02-14', city: 'Chicago' },
    { id: 7, name: 'Grace Kim', department: 'Marketing', salary: 75000, hire_date: '2022-06-30', city: 'Los Angeles' },
    { id: 8, name: 'Henry Chen', department: 'Engineering', salary: 115000, hire_date: '2020-04-18', city: 'Seattle' },
    { id: 9, name: 'Iris Patel', department: 'Sales', salary: 82000, hire_date: '2021-09-12', city: 'New York' },
    { id: 10, name: 'Jack Wilson', department: 'Marketing', salary: 71000, hire_date: '2023-05-01', city: 'Austin' },
    { id: 11, name: 'Karen Davis', department: 'HR', salary: 85000, hire_date: '2019-06-15', city: 'Chicago' },
    { id: 12, name: 'Leo Thompson', department: 'HR', salary: 78000, hire_date: '2022-03-20', city: 'San Francisco' },
    { id: 13, name: 'Mia Garcia', department: 'Engineering', salary: 98000, hire_date: '2021-12-01', city: 'Austin' },
    { id: 14, name: 'Nathan Ross', department: 'Sales', salary: 69000, hire_date: '2023-08-10', city: 'Los Angeles' },
    { id: 15, name: 'Olivia Taylor', department: 'Engineering', salary: 125000, hire_date: '2019-01-22', city: 'Seattle' },
  ],
  departments: [
    { id: 1, name: 'Engineering', budget: 500000, manager: 'Henry Chen', location: 'Building A' },
    { id: 2, name: 'Sales', budget: 300000, manager: 'Iris Patel', location: 'Building B' },
    { id: 3, name: 'Marketing', budget: 200000, manager: 'David Brown', location: 'Building C' },
    { id: 4, name: 'HR', budget: 150000, manager: 'Karen Davis', location: 'Building A' },
  ],
  sales: [
    { id: 1, product: 'DataTrack Pro', amount: 15000, quarter: 'Q1 2024', rep_id: 2, region: 'North' },
    { id: 2, product: 'DataTrack Pro', amount: 22000, quarter: 'Q2 2024', rep_id: 6, region: 'South' },
    { id: 3, product: 'Analytics Suite', amount: 35000, quarter: 'Q1 2024', rep_id: 9, region: 'East' },
    { id: 4, product: 'DataTrack Pro', amount: 18000, quarter: 'Q3 2024', rep_id: 2, region: 'North' },
    { id: 5, product: 'Analytics Suite', amount: 42000, quarter: 'Q2 2024', rep_id: 9, region: 'West' },
    { id: 6, product: 'BI Dashboard', amount: 28000, quarter: 'Q1 2024', rep_id: 14, region: 'South' },
    { id: 7, product: 'DataTrack Pro', amount: 12000, quarter: 'Q4 2024', rep_id: 6, region: 'East' },
    { id: 8, product: 'BI Dashboard', amount: 33000, quarter: 'Q3 2024', rep_id: 14, region: 'West' },
    { id: 9, product: 'Analytics Suite', amount: 25000, quarter: 'Q4 2024', rep_id: 2, region: 'North' },
    { id: 10, product: 'DataTrack Pro', amount: 19500, quarter: 'Q2 2024', rep_id: 9, region: 'East' },
  ],
  transactions: generateTransactions(),
  bank_accounts: generateBankAccounts(),
  products: generateProducts(),
  employees_hr: generateEmployeesHR(),
};

/* ─── Schema Info ─── */
const TABLE_SCHEMA: Record<string, { column: string; type: string; icon: React.ReactNode }[]> = {
  employees: [
    { column: 'id', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'name', type: 'VARCHAR', icon: <Type className="w-3.5 h-3.5 text-emerald-500" /> },
    { column: 'department', type: 'VARCHAR', icon: <Building2 className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'salary', type: 'INTEGER', icon: <DollarSign className="w-3.5 h-3.5 text-green-500" /> },
    { column: 'hire_date', type: 'DATE', icon: <Calendar className="w-3.5 h-3.5 text-purple-500" /> },
    { column: 'city', type: 'VARCHAR', icon: <MapPin className="w-3.5 h-3.5 text-rose-500" /> },
  ],
  departments: [
    { column: 'id', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'name', type: 'VARCHAR', icon: <Type className="w-3.5 h-3.5 text-emerald-500" /> },
    { column: 'budget', type: 'INTEGER', icon: <DollarSign className="w-3.5 h-3.5 text-green-500" /> },
    { column: 'manager', type: 'VARCHAR', icon: <Users className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'location', type: 'VARCHAR', icon: <MapPin className="w-3.5 h-3.5 text-rose-500" /> },
  ],
  sales: [
    { column: 'id', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'product', type: 'VARCHAR', icon: <FileText className="w-3.5 h-3.5 text-emerald-500" /> },
    { column: 'amount', type: 'INTEGER', icon: <DollarSign className="w-3.5 h-3.5 text-green-500" /> },
    { column: 'quarter', type: 'VARCHAR', icon: <Calendar className="w-3.5 h-3.5 text-purple-500" /> },
    { column: 'rep_id', type: 'INTEGER', icon: <Users className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'region', type: 'VARCHAR', icon: <MapPin className="w-3.5 h-3.5 text-rose-500" /> },
  ],
  transactions: [
    { column: 'id', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'transaction_date', type: 'DATE', icon: <Calendar className="w-3.5 h-3.5 text-purple-500" /> },
    { column: 'transaction_type', type: 'VARCHAR', icon: <CreditCard className="w-3.5 h-3.5 text-cyan-500" /> },
    { column: 'amount', type: 'DECIMAL', icon: <DollarSign className="w-3.5 h-3.5 text-green-500" /> },
    { column: 'currency', type: 'VARCHAR', icon: <Globe className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'category', type: 'VARCHAR', icon: <ShoppingBag className="w-3.5 h-3.5 text-rose-500" /> },
    { column: 'description', type: 'VARCHAR', icon: <FileText className="w-3.5 h-3.5 text-emerald-500" /> },
    { column: 'status', type: 'VARCHAR', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'account_id', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'merchant', type: 'VARCHAR', icon: <Building2 className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'card_type', type: 'VARCHAR', icon: <CreditCard className="w-3.5 h-3.5 text-violet-500" /> },
  ],
  bank_accounts: [
    { column: 'id', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'account_number', type: 'VARCHAR', icon: <Landmark className="w-3.5 h-3.5 text-emerald-500" /> },
    { column: 'account_holder', type: 'VARCHAR', icon: <Users className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'account_type', type: 'VARCHAR', icon: <CreditCard className="w-3.5 h-3.5 text-cyan-500" /> },
    { column: 'balance', type: 'DECIMAL', icon: <DollarSign className="w-3.5 h-3.5 text-green-500" /> },
    { column: 'branch', type: 'VARCHAR', icon: <Building2 className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'city', type: 'VARCHAR', icon: <MapPin className="w-3.5 h-3.5 text-rose-500" /> },
    { column: 'state', type: 'VARCHAR', icon: <MapPin className="w-3.5 h-3.5 text-orange-500" /> },
    { column: 'country', type: 'VARCHAR', icon: <Globe className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'currency', type: 'VARCHAR', icon: <DollarSign className="w-3.5 h-3.5 text-yellow-500" /> },
    { column: 'is_active', type: 'BOOLEAN', icon: <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> },
    { column: 'opened_date', type: 'DATE', icon: <Calendar className="w-3.5 h-3.5 text-purple-500" /> },
    { column: 'last_transaction_date', type: 'DATE', icon: <Calendar className="w-3.5 h-3.5 text-pink-500" /> },
    { column: 'credit_score', type: 'INTEGER', icon: <Star className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'account_level', type: 'VARCHAR', icon: <Briefcase className="w-3.5 h-3.5 text-violet-500" /> },
  ],
  products: [
    { column: 'id', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'product_name', type: 'VARCHAR', icon: <Type className="w-3.5 h-3.5 text-emerald-500" /> },
    { column: 'category', type: 'VARCHAR', icon: <ShoppingBag className="w-3.5 h-3.5 text-rose-500" /> },
    { column: 'brand', type: 'VARCHAR', icon: <FileText className="w-3.5 h-3.5 text-cyan-500" /> },
    { column: 'price', type: 'DECIMAL', icon: <DollarSign className="w-3.5 h-3.5 text-green-500" /> },
    { column: 'quantity_in_stock', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-orange-500" /> },
    { column: 'unit', type: 'VARCHAR', icon: <Type className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'supplier', type: 'VARCHAR', icon: <Building2 className="w-3.5 h-3.5 text-slate-500" /> },
    { column: 'aisle', type: 'VARCHAR', icon: <MapPin className="w-3.5 h-3.5 text-rose-500" /> },
    { column: 'on_sale', type: 'BOOLEAN', icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
    { column: 'discount_percent', type: 'INTEGER', icon: <TrendingUp className="w-3.5 h-3.5 text-red-500" /> },
    { column: 'rating', type: 'INTEGER', icon: <Star className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'dietary', type: 'VARCHAR', icon: <Heart className="w-3.5 h-3.5 text-rose-400" /> },
  ],
  employees_hr: [
    { column: 'id', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'first_name', type: 'VARCHAR', icon: <Type className="w-3.5 h-3.5 text-emerald-500" /> },
    { column: 'last_name', type: 'VARCHAR', icon: <Type className="w-3.5 h-3.5 text-teal-500" /> },
    { column: 'email', type: 'VARCHAR', icon: <Mail className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'department', type: 'VARCHAR', icon: <Building2 className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'position', type: 'VARCHAR', icon: <Briefcase className="w-3.5 h-3.5 text-violet-500" /> },
    { column: 'level', type: 'VARCHAR', icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-500" /> },
    { column: 'salary', type: 'INTEGER', icon: <DollarSign className="w-3.5 h-3.5 text-green-500" /> },
    { column: 'hire_date', type: 'DATE', icon: <Calendar className="w-3.5 h-3.5 text-purple-500" /> },
    { column: 'termination_date', type: 'DATE', icon: <Calendar className="w-3.5 h-3.5 text-gray-500" /> },
    { column: 'status', type: 'VARCHAR', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> },
    { column: 'manager_id', type: 'INTEGER', icon: <Users className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'performance_rating', type: 'INTEGER', icon: <Star className="w-3.5 h-3.5 text-amber-500" /> },
    { column: 'skills', type: 'VARCHAR', icon: <Zap className="w-3.5 h-3.5 text-yellow-500" /> },
    { column: 'education', type: 'VARCHAR', icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> },
    { column: 'years_of_experience', type: 'INTEGER', icon: <Hash className="w-3.5 h-3.5 text-orange-500" /> },
    { column: 'office_location', type: 'VARCHAR', icon: <MapPin className="w-3.5 h-3.5 text-rose-500" /> },
  ],
};

/* ─── Quick Queries ─── */
const QUICK_QUERIES = [
  { label: 'All Employees', query: 'SELECT * FROM employees;', icon: <Users className="w-3.5 h-3.5" /> },
  { label: 'High Earners', query: "SELECT * FROM employees WHERE salary > 90000 ORDER BY salary DESC;", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { label: 'By Department', query: "SELECT department, COUNT(*) as count, AVG(salary) as avg_salary FROM employees GROUP BY department;", icon: <Building2 className="w-3.5 h-3.5" /> },
  { label: 'Top Sales', query: "SELECT * FROM sales ORDER BY amount DESC LIMIT 5;", icon: <DollarSign className="w-3.5 h-3.5" /> },
  { label: 'Join Query', query: "SELECT e.name, e.department, s.product, s.amount FROM employees e, sales s WHERE e.id = s.rep_id ORDER BY s.amount DESC LIMIT 10;", icon: <Database className="w-3.5 h-3.5" /> },
  { label: 'Distinct Cities', query: "SELECT DISTINCT city FROM employees ORDER BY city;", icon: <MapPin className="w-3.5 h-3.5" /> },
  // Transactions
  { label: 'All Transactions', query: 'SELECT * FROM transactions LIMIT 10;', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { label: 'Transaction Categories', query: "SELECT category, COUNT(*) as count, AVG(amount) as avg_amount FROM transactions GROUP BY category;", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { label: 'Large Transactions', query: "SELECT * FROM transactions WHERE amount > 100 ORDER BY amount DESC LIMIT 10;", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  // Bank Accounts
  { label: 'All Bank Accounts', query: 'SELECT * FROM bank_accounts LIMIT 10;', icon: <Landmark className="w-3.5 h-3.5" /> },
  { label: 'Account Balances', query: "SELECT account_type, AVG(balance) as avg_balance, COUNT(*) as count FROM bank_accounts GROUP BY account_type;", icon: <DollarSign className="w-3.5 h-3.5" /> },
  { label: 'High Credit Scores', query: "SELECT * FROM bank_accounts WHERE credit_score > 750 ORDER BY credit_score DESC LIMIT 10;", icon: <Star className="w-3.5 h-3.5" /> },
  // Products
  { label: 'All Products', query: 'SELECT * FROM products LIMIT 10;', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { label: 'On Sale Items', query: "SELECT product_name, price, discount_percent FROM products WHERE on_sale = true ORDER BY discount_percent DESC LIMIT 10;", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { label: 'Top Rated', query: "SELECT product_name, brand, rating, price FROM products WHERE rating = 5;", icon: <Star className="w-3.5 h-3.5" /> },
  // HR
  { label: 'All HR Records', query: 'SELECT * FROM employees_hr LIMIT 10;', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { label: 'Salary by Level', query: "SELECT level, AVG(salary) as avg_salary, COUNT(*) as count FROM employees_hr GROUP BY level;", icon: <DollarSign className="w-3.5 h-3.5" /> },
  { label: 'Active Employees', query: "SELECT first_name, last_name, department, position, salary FROM employees_hr WHERE status = 'active' ORDER BY salary DESC LIMIT 10;", icon: <Users className="w-3.5 h-3.5" /> },
];

/* ─── Query History ─── */
interface HistoryEntry {
  query: string;
  rowCount: number;
  executionTime: number;
  timestamp: Date;
}

/* ─── SQL Parser Types ─── */
interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

/* ─── SQL Execution Engine ─── */
function executeSQL(query: string): QueryResult {
  const q = query.trim().replace(/;$/, '').trim();

  // SELECT DISTINCT
  const distinctMatch = q.match(/^SELECT\s+DISTINCT\s+(.+?)\s+FROM\s+(\w+)(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i);
  if (distinctMatch) {
    const cols = distinctMatch[1].trim();
    const table = distinctMatch[2].toLowerCase();
    const orderCol = distinctMatch[3];
    const orderDir = distinctMatch[4]?.toUpperCase() || 'ASC';
    const limit = distinctMatch[5] ? parseInt(distinctMatch[5]) : null;
    const data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };

    const colList = cols === '*' ? Object.keys(data[0]) : cols.split(',').map(c => c.trim());
    const seen = new Set<string>();
    const uniqueRows: Record<string, unknown>[] = [];

    for (const row of data) {
      const key = colList.map(c => String(row[c] ?? '')).join('|||');
      if (!seen.has(key)) {
        seen.add(key);
        const filtered: Record<string, unknown> = {};
        for (const c of colList) filtered[c] = row[c] ?? null;
        uniqueRows.push(filtered);
      }
    }

    if (orderCol) {
      uniqueRows.sort((a, b) => {
        const va = a[orderCol], vb = b[orderCol];
        if (typeof va === 'number' && typeof vb === 'number') return orderDir === 'DESC' ? vb - va : va - vb;
        return orderDir === 'DESC' ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
      });
    }

    const final = limit ? uniqueRows.slice(0, limit) : uniqueRows;
    return { columns: colList, rows: final, rowCount: final.length };
  }

  // COUNT(*) with GROUP BY
  const countGroupMatch = q.match(/^SELECT\s+(.+?),\s+COUNT\s*\(\s*\*\s*\)\s+as\s+(\w+)\s+FROM\s+(\w+)\s+GROUP\s+BY\s+(.+?)$/i);
  if (countGroupMatch) {
    const colExpr = countGroupMatch[1].trim();
    const countAlias = countGroupMatch[2].trim();
    const table = countGroupMatch[3].toLowerCase();
    const groupCol = countGroupMatch[4].trim();
    const data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };

    const groups: Record<string, { key: unknown; rows: Record<string, unknown>[] }> = {};
    for (const row of data) {
      const key = String(row[groupCol] ?? '');
      if (!groups[key]) groups[key] = { key: row[groupCol], rows: [] };
      groups[key].rows.push(row);
    }

    const columns = [colExpr, countAlias];
    const rows = Object.values(groups).map(g => ({
      [colExpr]: g.key,
      [countAlias]: g.rows.length,
    }));

    return { columns, rows, rowCount: rows.length };
  }

  // AVG with GROUP BY
  const avgGroupMatch = q.match(/^SELECT\s+(.+?),\s+AVG\s*\(\s*(\w+)\s*\)\s+as\s+(\w+)\s+FROM\s+(\w+)\s+GROUP\s+BY\s+(.+?)$/i);
  if (avgGroupMatch) {
    const colExpr = avgGroupMatch[1].trim();
    const avgCol = avgGroupMatch[2].trim();
    const avgAlias = avgGroupMatch[3].trim();
    const table = avgGroupMatch[4].toLowerCase();
    const groupCol = avgGroupMatch[5].trim();
    const data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };

    const groups: Record<string, { key: unknown; vals: number[] }> = {};
    for (const row of data) {
      const key = String(row[groupCol] ?? '');
      if (!groups[key]) groups[key] = { key: row[groupCol], vals: [] };
      groups[key].vals.push(Number(row[avgCol]) || 0);
    }

    const columns = [colExpr, avgAlias];
    const rows = Object.values(groups).map(g => ({
      [colExpr]: g.key,
      [avgAlias]: Math.round(g.vals.reduce((a, b) => a + b, 0) / g.vals.length),
    }));

    return { columns, rows, rowCount: rows.length };
  }

  // COUNT(*) + AVG combined with GROUP BY: SELECT col, COUNT(*) as c, AVG(col) as a FROM table GROUP BY col
  const countAvgGroupMatch = q.match(/^SELECT\s+(.+?),\s+COUNT\s*\(\s*\*\s*\)\s+as\s+(\w+),\s+AVG\s*\(\s*(\w+)\s*\)\s+as\s+(\w+)\s+FROM\s+(\w+)\s+GROUP\s+BY\s+(.+?)$/i);
  if (countAvgGroupMatch) {
    const colExpr = countAvgGroupMatch[1].trim();
    const countAlias = countAvgGroupMatch[2].trim();
    const avgCol = countAvgGroupMatch[3].trim();
    const avgAlias = countAvgGroupMatch[4].trim();
    const table = countAvgGroupMatch[5].toLowerCase();
    const groupCol = countAvgGroupMatch[6].trim();
    const data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };

    const groups: Record<string, { key: unknown; rows: Record<string, unknown>[]; vals: number[] }> = {};
    for (const row of data) {
      const key = String(row[groupCol] ?? '');
      if (!groups[key]) groups[key] = { key: row[groupCol], rows: [], vals: [] };
      groups[key].rows.push(row);
      groups[key].vals.push(Number(row[avgCol]) || 0);
    }

    const columns = [colExpr, countAlias, avgAlias];
    const rows = Object.values(groups).map(g => ({
      [colExpr]: g.key,
      [countAlias]: g.rows.length,
      [avgAlias]: Math.round(g.vals.reduce((a, b) => a + b, 0) / g.vals.length),
    }));

    return { columns, rows, rowCount: rows.length };
  }

  // SELECT COUNT(*) simple
  const simpleCountMatch = q.match(/^SELECT\s+COUNT\s*\(\s*\*\s*\)\s+as\s+(\w+)?\s+FROM\s+(\w+)$/i);
  if (simpleCountMatch) {
    const alias = simpleCountMatch[1] || 'count';
    const table = simpleCountMatch[2].toLowerCase();
    const data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };
    return { columns: [alias], rows: [{ [alias]: data.length }], rowCount: 1 };
  }

  // Cross join: SELECT ... FROM table1 alias1, table2 alias2 WHERE alias1.col = alias2.col ORDER BY ... LIMIT ...
  const joinMatch = q.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)\s+(\w+),\s*(\w+)\s+(\w+)\s+WHERE\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)(?:\s+ORDER\s+BY\s+(\w+)\.(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i);
  if (joinMatch) {
    const colExprs = joinMatch[1].trim();
    const table1 = joinMatch[2].toLowerCase();
    const alias1 = joinMatch[3].toLowerCase();
    const table2 = joinMatch[4].toLowerCase();
    const alias2 = joinMatch[5].toLowerCase();
    const whereAlias1 = joinMatch[6].toLowerCase();
    const whereCol1 = joinMatch[7].toLowerCase();
    const whereAlias2 = joinMatch[8].toLowerCase();
    const whereCol2 = joinMatch[9].toLowerCase();
    const orderAlias = joinMatch[10]?.toLowerCase();
    const orderCol = joinMatch[11]?.toLowerCase();
    const orderDir = joinMatch[12]?.toUpperCase() || 'ASC';
    const limit = joinMatch[13] ? parseInt(joinMatch[13]) : null;

    const data1 = SAMPLE_DB[table1];
    const data2 = SAMPLE_DB[table2];
    if (!data1 || !data2) return { columns: [], rows: [], rowCount: 0 };

    // Resolve aliases
    const t1Alias = whereAlias1 === alias1 ? table1 : table2;
    const t2Alias = whereAlias2 === alias2 ? table2 : table1;

    const joined: Record<string, unknown>[] = [];
    for (const r1 of data1) {
      for (const r2 of data2) {
        if (r1[whereCol1] === r2[whereCol2]) {
          const row: Record<string, unknown> = {};
          // Parse column expressions like "e.name, e.department, s.product, s.amount"
          const colParts = colExprs.split(',').map(c => c.trim());
          const columns: string[] = [];
          for (const part of colParts) {
            const colRef = part.match(/^(\w+)\.(\w+)$/);
            if (colRef) {
              const a = colRef[1].toLowerCase();
              const c = colRef[2].toLowerCase();
              const source = a === alias1 ? r1 : r2;
              row[c] = source[c] ?? null;
              columns.push(c);
            } else {
              const c = part.toLowerCase();
              row[c] = r1[c] ?? r2[c] ?? null;
              columns.push(c);
            }
          }
          joined.push(row);
        }
      }
    }

    if (orderAlias && orderCol) {
      joined.sort((a, b) => {
        const va = a[orderCol], vb = b[orderCol];
        if (typeof va === 'number' && typeof vb === 'number') return orderDir === 'DESC' ? vb - va : va - vb;
        return orderDir === 'DESC' ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
      });
    }

    const final = limit ? joined.slice(0, limit) : joined;
    const columns = colExprs.split(',').map(c => {
      const colRef = c.trim().match(/^(\w+)\.(\w+)$/);
      return colRef ? colRef[2] : c.trim();
    });
    return { columns, rows: final, rowCount: final.length };
  }

  // Standard SELECT with WHERE IN, ORDER BY, LIMIT
  // Pattern: SELECT cols FROM table WHERE col IN (...) ORDER BY col DIR LIMIT n
  const complexWithInMatch = q.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s+IN\s*\((.+?)\)\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?(?:\s+LIMIT\s+(\d+))?$/i);
  if (complexWithInMatch) {
    const colStr = complexWithInMatch[1].trim();
    const table = complexWithInMatch[2].toLowerCase();
    const whereCol = complexWithInMatch[3].toLowerCase();
    const inValues = complexWithInMatch[4].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    const orderCol = complexWithInMatch[5].toLowerCase();
    const orderDir = complexWithInMatch[6]?.toUpperCase() || 'ASC';
    const limit = complexWithInMatch[7] ? parseInt(complexWithInMatch[7]) : null;

    let data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };

    data = data.filter(r => inValues.includes(String(r[whereCol])));

    const colList = colStr === '*' ? Object.keys(data[0] || {}) : colStr.split(',').map(c => c.trim());

    if (orderCol) {
      data = [...data].sort((a, b) => {
        const va = a[orderCol], vb = b[orderCol];
        if (typeof va === 'number' && typeof vb === 'number') return orderDir === 'DESC' ? vb - va : va - vb;
        return orderDir === 'DESC' ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
      });
    }

    if (limit) data = data.slice(0, limit);

    const rows = data.map(r => {
      const filtered: Record<string, unknown> = {};
      for (const c of colList) filtered[c] = r[c] ?? null;
      return filtered;
    });

    return { columns: colList, rows, rowCount: rows.length };
  }

  // Standard SELECT with WHERE LIKE, ORDER BY, LIMIT
  const complexWithLikeMatch = q.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s+LIKE\s+'([^']+)'\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?(?:\s+LIMIT\s+(\d+))?$/i);
  if (complexWithLikeMatch) {
    const colStr = complexWithLikeMatch[1].trim();
    const table = complexWithLikeMatch[2].toLowerCase();
    const whereCol = complexWithLikeMatch[3].toLowerCase();
    const likePattern = complexWithLikeMatch[4];
    const orderCol = complexWithLikeMatch[5].toLowerCase();
    const orderDir = complexWithLikeMatch[6]?.toUpperCase() || 'ASC';
    const limit = complexWithLikeMatch[7] ? parseInt(complexWithLikeMatch[7]) : null;

    let data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };

    const regex = new RegExp('^' + likePattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
    data = data.filter(r => regex.test(String(r[whereCol])));

    const colList = colStr === '*' ? Object.keys(data[0] || {}) : colStr.split(',').map(c => c.trim());

    if (orderCol) {
      data = [...data].sort((a, b) => {
        const va = a[orderCol], vb = b[orderCol];
        if (typeof va === 'number' && typeof vb === 'number') return orderDir === 'DESC' ? vb - va : va - vb;
        return orderDir === 'DESC' ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
      });
    }

    if (limit) data = data.slice(0, limit);

    const rows = data.map(r => {
      const filtered: Record<string, unknown> = {};
      for (const c of colList) filtered[c] = r[c] ?? null;
      return filtered;
    });

    return { columns: colList, rows, rowCount: rows.length };
  }

  // Standard SELECT with WHERE comparison (=, >, <, >=, <=, !=), ORDER BY, LIMIT
  const complexMatch = q.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*(>=|<=|!=|=|>|<)\s*'?([^']*)'?)?(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i);
  if (complexMatch) {
    const colStr = complexMatch[1].trim();
    const table = complexMatch[2].toLowerCase();
    const whereCol = complexMatch[3]?.toLowerCase();
    const whereOp = complexMatch[4];
    const whereVal = complexMatch[5];
    const orderCol = complexMatch[6]?.toLowerCase();
    const orderDir = complexMatch[7]?.toUpperCase() || 'ASC';
    const limit = complexMatch[8] ? parseInt(complexMatch[8]) : null;

    let data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };

    if (whereCol && whereOp && whereVal !== undefined) {
      const numVal = Number(whereVal);
      const isNum = !isNaN(numVal);
      data = data.filter(r => {
        const cell = r[whereCol];
        if (isNum) {
          const cellNum = Number(cell);
          switch (whereOp) {
            case '=': return cellNum === numVal;
            case '>': return cellNum > numVal;
            case '<': return cellNum < numVal;
            case '>=': return cellNum >= numVal;
            case '<=': return cellNum <= numVal;
            case '!=': return cellNum !== numVal;
            default: return true;
          }
        } else {
          switch (whereOp) {
            case '=': return String(cell) === whereVal;
            case '!=': return String(cell) !== whereVal;
            default: return true;
          }
        }
      });
    }

    const colList = colStr === '*' ? Object.keys(data[0] || {}) : colStr.split(',').map(c => c.trim());

    if (orderCol) {
      data = [...data].sort((a, b) => {
        const va = a[orderCol], vb = b[orderCol];
        if (typeof va === 'number' && typeof vb === 'number') return orderDir === 'DESC' ? vb - va : va - vb;
        return orderDir === 'DESC' ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
      });
    }

    if (limit) data = data.slice(0, limit);

    const rows = data.map(r => {
      const filtered: Record<string, unknown> = {};
      for (const c of colList) filtered[c] = r[c] ?? null;
      return filtered;
    });

    return { columns: colList, rows, rowCount: rows.length };
  }

  // Simple SELECT ... FROM table
  const simpleSelectMatch = q.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)$/i);
  if (simpleSelectMatch) {
    const colStr = simpleSelectMatch[1].trim();
    const table = simpleSelectMatch[2].toLowerCase();
    const data = SAMPLE_DB[table];
    if (!data) return { columns: [], rows: [], rowCount: 0 };

    const colList = colStr === '*' ? Object.keys(data[0]) : colStr.split(',').map(c => c.trim());
    const rows = data.map(r => {
      const filtered: Record<string, unknown> = {};
      for (const c of colList) filtered[c] = r[c] ?? null;
      return filtered;
    });

    return { columns: colList, rows, rowCount: rows.length };
  }

  throw new Error('Unsupported query. Try: SELECT * FROM table, or use WHERE, ORDER BY, LIMIT, GROUP BY clauses.');
}

/* ─── Schema Browser Component ─── */
function SchemaBrowser() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    employees: true,
    departments: false,
    sales: false,
    transactions: false,
    bank_accounts: false,
    products: false,
    employees_hr: false,
  });

  const toggle = (table: string) => {
    setExpanded(prev => ({ ...prev, [table]: !prev[table] }));
  };

  const tableIcons: Record<string, React.ReactNode> = {
    employees: <Users className="w-4 h-4 text-emerald-500" />,
    departments: <Building2 className="w-4 h-4 text-amber-500" />,
    sales: <TrendingUp className="w-4 h-4 text-blue-500" />,
    transactions: <CreditCard className="w-4 h-4 text-cyan-500" />,
    bank_accounts: <Landmark className="w-4 h-4 text-emerald-500" />,
    products: <ShoppingBag className="w-4 h-4 text-rose-500" />,
    employees_hr: <Briefcase className="w-4 h-4 text-violet-500" />,
  };

  const tableColors: Record<string, string> = {
    employees: 'from-emerald-500 to-teal-500',
    departments: 'from-amber-500 to-orange-500',
    sales: 'from-blue-500 to-indigo-500',
    transactions: 'from-cyan-500 to-blue-500',
    bank_accounts: 'from-emerald-500 to-green-500',
    products: 'from-rose-500 to-pink-500',
    employees_hr: 'from-violet-500 to-purple-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Schema Browser</h3>
      </div>

      {Object.entries(TABLE_SCHEMA).map(([table, columns]) => (
        <motion.div
          key={table}
          initial={false}
          animate={{ height: 'auto' }}
          className="rounded-lg border border-border/50 overflow-hidden"
        >
          <button
            onClick={() => toggle(table)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={cn('w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center text-white', tableColors[table])}>
                {tableIcons[table]}
              </div>
              <span className="text-sm font-semibold">{table}</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {SAMPLE_DB[table]?.length || 0} rows
              </Badge>
            </div>
            <motion.div
              animate={{ rotate: expanded[table] ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expanded[table] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 py-2 space-y-1 bg-background">
                  {columns.map((col) => (
                    <div key={col.column} className="flex items-center justify-between py-1 px-1 rounded hover:bg-muted/30 text-xs">
                      <div className="flex items-center gap-2">
                        {col.icon}
                        <span className="font-mono font-medium">{col.column}</span>
                      </div>
                      <span className="text-muted-foreground font-mono text-[10px] uppercase">{col.type}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Query History Component ─── */
function QueryHistory({ history, onSelect }: { history: HistoryEntry[]; onSelect: (q: string) => void }) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Queries</h3>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {history.slice(0, 8).map((entry, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(entry.query)}
            className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors group"
          >
            <p className="text-xs font-mono text-foreground/80 truncate group-hover:text-foreground">
              {entry.query}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground">{entry.rowCount} rows</span>
              <span className="text-[10px] text-muted-foreground">{entry.executionTime}ms</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function SQLPlaygroundView() {
  const [query, setQuery] = useState('SELECT * FROM employees LIMIT 5;');
  const [results, setResults] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState('results');
  const [copied, setCopied] = useState(false);
  const [schemaExpanded, setSchemaExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runQuery = useCallback(async (sql?: string) => {
    const q = sql || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setExecutionTime(null);

    // Simulated execution delay
    const delay = 200 + Math.random() * 600;
    const start = performance.now();

    try {
      await new Promise(resolve => setTimeout(resolve, delay));
      const result = executeSQL(q);
      const elapsed = Math.round(performance.now() - start);

      setResults(result);
      setExecutionTime(elapsed);
      setActiveTab('results');

      setHistory(prev => [{
        query: q,
        rowCount: result.rowCount,
        executionTime: elapsed,
        timestamp: new Date(),
      }, ...prev].slice(0, 20));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query execution failed');
      setActiveTab('results');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
    }
  }, [runQuery]);

  const handleCopyResult = useCallback(() => {
    if (!results) return;
    const header = results.columns.join('\t');
    const rows = results.rows.map(r => results.columns.map(c => String(r[c] ?? '')).join('\t')).join('\n');
    navigator.clipboard.writeText(header + '\n' + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results]);

  const handleQuickQuery = useCallback((q: string) => {
    setQuery(q);
    runQuery(q);
  }, [runQuery]);

  const handleHistorySelect = useCallback((q: string) => {
    setQuery(q);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const clearEditor = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setExecutionTime(null);
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newQuery = query.substring(0, start) + text + query.substring(end);
      setQuery(newQuery);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
      }, 0);
    }
  }, [query]);

  const formatCurrency = (val: unknown): string => {
    if (typeof val === 'number' && val > 1000) {
      return '$' + val.toLocaleString();
    }
    return String(val ?? '');
  };

  const getColumnTypeClass = (col: string, val: unknown): string => {
    if (col.includes('salary') || col.includes('amount') || col.includes('budget') || col.includes('balance') || col.includes('price')) {
      return 'font-mono text-emerald-600 dark:text-emerald-400 font-medium';
    }
    if (col.includes('credit_score') || col.includes('rating') || col.includes('performance_rating') || col.includes('discount_percent')) {
      return 'font-mono text-amber-600 dark:text-amber-400 font-medium';
    }
    if (col.includes('id')) {
      return 'font-mono text-muted-foreground';
    }
    if (col.includes('date') || col.includes('quarter')) {
      return 'text-amber-600 dark:text-amber-400';
    }
    return '';
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SQL Playground</h1>
            <p className="text-xs text-muted-foreground">Write and execute SQL queries against the sample database</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Database className="w-3 h-3 mr-1" />
            7 Tables
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Rows3 className="w-3 h-3 mr-1" />
            {Object.values(SAMPLE_DB).reduce((sum, rows) => sum + rows.length, 0)} Total Rows
          </Badge>
        </div>
      </motion.div>

      {/* Quick Query Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {QUICK_QUERIES.map((qq, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleQuickQuery(qq.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/60 bg-background hover:bg-muted/50 hover:border-emerald-300 transition-all text-foreground"
          >
            {qq.icon}
            {qq.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
        {/* Left: Editor + Results */}
        <div className="space-y-4">
          {/* Query Editor */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <CardTitle className="text-sm font-mono ml-2">Query Editor</CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearEditor}
                      className="h-7 px-2 text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => runQuery()}
                      disabled={isLoading || !query.trim()}
                      className="h-7 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                        </motion.div>
                      ) : (
                        <Play className="w-3 h-3 mr-1" />
                      )}
                      {isLoading ? 'Running...' : 'Run'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write your SQL query here...&#10;&#10;Examples:&#10;  SELECT * FROM employees;&#10;  SELECT * FROM employees WHERE salary > 90000;&#10;  SELECT DISTINCT city FROM employees;&#10;&#10;Press Ctrl+Enter to run"
                    className="w-full min-h-[180px] bg-slate-900 text-slate-100 font-mono text-sm p-4 resize-y focus:outline-none leading-relaxed placeholder:text-slate-500 selection:bg-emerald-500/30"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                  <div className="absolute bottom-2 right-3 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {query.length} chars
                    </span>
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-slate-500 bg-slate-800 rounded border border-slate-700">
                      Ctrl+Enter
                    </kbd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Bar */}
          <AnimatePresence>
            {(executionTime !== null || error) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 flex-wrap"
              >
                {results && (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                      <Rows3 className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">{results.rowCount}</span> rows returned
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">{executionTime}ms</span> execution time
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                      <Table2 className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">{results.columns.length}</span> columns
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyResult}
                      className="h-7 px-2 text-xs ml-auto"
                    >
                      {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copied ? 'Copied!' : 'Copy Results'}
                    </Button>
                  </>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 w-full">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono">{error}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results / Schema Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-0 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <TabsList className="h-8">
                      <TabsTrigger value="results" className="text-xs px-3 h-6">
                        <Table2 className="w-3 h-3 mr-1.5" />
                        Results
                      </TabsTrigger>
                      <TabsTrigger value="schema" className="text-xs px-3 h-6">
                        <Search className="w-3 h-3 mr-1.5" />
                        Schema
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <TabsContent value="results" className="mt-0">
                    {results ? (
                      results.rows.length > 0 ? (
                        <div className="max-h-[400px] overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50 hover:bg-muted/50">
                                {results.columns.map((col) => (
                                  <TableHead key={col} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                                    {col}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {results.rows.map((row, rowIdx) => (
                                <TableRow
                                  key={rowIdx}
                                  className={cn(
                                    rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                                    'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors'
                                  )}
                                >
                                  {results.columns.map((col) => {
                                    const val = row[col];
                                    const displayVal = (col.includes('salary') || col.includes('amount') || col.includes('budget'))
                                      ? formatCurrency(val)
                                      : String(val ?? '');
                                    return (
                                      <TableCell
                                        key={col}
                                        className={cn(
                                          'text-xs px-3 py-2 whitespace-nowrap',
                                          getColumnTypeClass(col, val)
                                        )}
                                      >
                                        {displayVal}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <Rows3 className="w-10 h-10 mb-3 opacity-30" />
                          <p className="text-sm">No results found</p>
                          <p className="text-xs mt-1">Try a different query</p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Play className="w-10 h-10 mb-3 opacity-30" />
                        </motion.div>
                        <p className="text-sm font-medium">Ready to query</p>
                        <p className="text-xs mt-1">Write a SQL query and press Run (Ctrl+Enter)</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="schema" className="mt-0">
                    <div className="p-4">
                      <SchemaBrowser />
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>

        {/* Right: Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          {/* Schema Browser (sidebar) */}
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  Database Schema
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSchemaExpanded(!schemaExpanded)}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className={cn('w-3 h-3 transition-transform', schemaExpanded && 'rotate-90')} />
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {schemaExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 px-4 pb-4">
                    <SchemaBrowser />
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Query History */}
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Query History
                </CardTitle>
                {history.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {history.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <QueryHistory history={history} onSelect={handleHistorySelect} />
              {history.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No queries executed yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SQL Reference */}
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                SQL Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="space-y-2">
                {[
                  { cmd: 'SELECT * FROM table', desc: 'Get all columns' },
                  { cmd: 'WHERE col = value', desc: 'Filter rows' },
                  { cmd: 'WHERE col > number', desc: 'Comparison filter' },
                  { cmd: 'ORDER BY col ASC', desc: 'Sort results' },
                  { cmd: 'LIMIT n', desc: 'Limit rows' },
                  { cmd: 'DISTINCT col', desc: 'Unique values' },
                  { cmd: 'COUNT(*)', desc: 'Count rows' },
                  { cmd: 'AVG(col)', desc: 'Average value' },
                  { cmd: 'GROUP BY col', desc: 'Group results' },
                  { cmd: "WHERE col IN (...)", desc: 'Match any value' },
                  { cmd: "WHERE col LIKE '%x%'", desc: 'Pattern match' },
                ].map((ref, i) => (
                  <button
                    key={i}
                    onClick={() => insertAtCursor(ref.cmd)}
                    className="w-full text-left flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors group"
                    title={`Insert: ${ref.cmd}`}
                  >
                    <span className="text-xs font-mono text-foreground/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {ref.cmd}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                      {ref.desc}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
