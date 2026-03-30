'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, Sparkles, Zap, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SubscriptionWallProps {
  feature: string;
  description?: string;
  onUpgrade?: () => void;
  onClose?: () => void;
  compact?: boolean;
}

export default function SubscriptionWall({
  feature,
  description = `Access ${feature} requires a Pro subscription. Upgrade to unlock unlimited access to all premium features.`,
  onUpgrade,
  onClose,
  compact = false,
}: SubscriptionWallProps) {
  const perks = [
    { icon: Zap, label: 'Unlimited AI messages' },
    { icon: Sparkles, label: 'Full book access' },
    { icon: Crown, label: 'Advanced tools' },
  ];

  if (compact) {
    return (
      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 overflow-hidden">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{feature} — Pro Feature</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 truncate">{description}</p>
          </div>
          <Button
            size="sm"
            className={cn(
              'rounded-xl shrink-0',
              'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md'
            )}
            onClick={onUpgrade}
          >
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            Upgrade
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <Crown className="w-12 h-12 text-white mx-auto mb-2" />
              <h3 className="text-white font-bold text-xl">Upgrade to Pro</h3>
              <p className="text-white/80 text-sm">Unlock {feature}</p>
            </motion.div>
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>

          <div className="space-y-3">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm">{perk.label}</span>
                </div>
              );
            })}
          </div>

          <Button
            className={cn(
              'w-full rounded-xl h-11 text-base font-semibold',
              'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20'
            )}
            onClick={onUpgrade}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro — $9.99/mo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. 7-day free trial available.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
