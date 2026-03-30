'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-rose-950 dark:via-background dark:to-orange-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Cancelled Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
              className="mx-auto"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900 dark:to-orange-900 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.5 }}
                >
                  <XCircle className="w-12 h-12 text-rose-500" strokeWidth={2.5} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold">Payment Cancelled</h2>
              <p className="text-muted-foreground">
                Your payment process was cancelled. No charges have been made to your account.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-muted/50 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  You can try again anytime from the Payment settings page.
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Your previous plan and data are unaffected.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex gap-2"
            >
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1 rounded-xl"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                Try Again
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xs text-muted-foreground"
            >
              Need help? Contact support or try a different payment method.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
