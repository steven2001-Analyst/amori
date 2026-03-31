'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  Save,
  User,
  SlidersHorizontal,
  Bell,
  Shield,
  AlertTriangle,
} from 'lucide-react'

export default function SettingsView() {
  const userId = useAuthStore((s) => s.userId)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    ageRangeMin: '18',
    ageRangeMax: '65',
    maxDistance: '50',
  })

  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    likes: false,
    newsletter: false,
  })

  const [privacy, setPrivacy] = useState({
    showOnline: true,
    profileVisible: true,
  })

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        setForm({
          name: data.name || '',
          email: data.email || '',
          ageRangeMin: data.ageRangeMin?.toString() || '18',
          ageRangeMax: data.ageRangeMax?.toString() || '65',
          maxDistance: data.maxDistance?.toString() || '50',
        })
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) fetchProfile()
  }, [userId, fetchProfile])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email
    const [user, domain] = email.split('@')
    if (user.length <= 2) return user + '@' + domain
    return user[0] + '***' + user[user.length - 1] + '@' + domain
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          maxDistance: form.maxDistance,
          ageRangeMin: form.ageRangeMin,
          ageRangeMax: form.ageRangeMax,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        updateProfile({ name: data.name })
        toast.success('Settings saved!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteAccount() {
    toast.info('Coming soon')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Settings</h1>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Account */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-rose-500" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="set-email">Email</Label>
            <Input
              id="set-email"
              value={maskEmail(form.email)}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="set-name">Name</Label>
            <Input
              id="set-name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Your name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Discovery Preferences */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="h-5 w-5 text-rose-500" />
            Discovery Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="set-agemin" className="text-xs">Age Min</Label>
              <Input
                id="set-agemin"
                type="number"
                min="18"
                max="100"
                value={form.ageRangeMin}
                onChange={(e) => updateField('ageRangeMin', e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-agemax" className="text-xs">Age Max</Label>
              <Input
                id="set-agemax"
                type="number"
                min="18"
                max="100"
                value={form.ageRangeMax}
                onChange={(e) => updateField('ageRangeMax', e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-dist" className="text-xs">Max Distance</Label>
              <Input
                id="set-dist"
                type="number"
                min="1"
                max="200"
                value={form.maxDistance}
                onChange={(e) => updateField('maxDistance', e.target.value)}
                className="text-sm"
              />
              <span className="text-xs text-muted-foreground">miles</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-rose-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">New Matches</div>
              <div className="text-xs text-muted-foreground">Get notified when you have a new match</div>
            </div>
            <Switch
              checked={notifications.newMatches}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, newMatches: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Messages</div>
              <div className="text-xs text-muted-foreground">Get notified when you receive a message</div>
            </div>
            <Switch
              checked={notifications.messages}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, messages: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Likes</div>
              <div className="text-xs text-muted-foreground">Get notified when someone likes you</div>
            </div>
            <Switch
              checked={notifications.likes}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, likes: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Newsletter</div>
              <div className="text-xs text-muted-foreground">Receive tips and updates from Amori</div>
            </div>
            <Switch
              checked={notifications.newsletter}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, newsletter: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-rose-500" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Show Online Status</div>
              <div className="text-xs text-muted-foreground">Let others see when you&apos;re active</div>
            </div>
            <Switch
              checked={privacy.showOnline}
              onCheckedChange={(checked) =>
                setPrivacy((prev) => ({ ...prev, showOnline: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Profile Visibility</div>
              <div className="text-xs text-muted-foreground">Show your profile in discover results</div>
            </div>
            <Switch
              checked={privacy.profileVisible}
              onCheckedChange={(checked) =>
                setPrivacy((prev) => ({ ...prev, profileVisible: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Delete Account</div>
              <div className="text-xs text-muted-foreground">
                Permanently delete your account and all data. This cannot be undone.
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
