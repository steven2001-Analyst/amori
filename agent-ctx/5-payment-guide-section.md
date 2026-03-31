---
## Task ID: 5 - payment-guide-section
### Work Task
Add "How to Start Receiving Payments" guide section to the Payment Settings page, after the Spending Chart card.

### Work Summary

**Modified file:** `src/components/payment/payment-settings-view.tsx`

**1. Added `Info` icon import**
- Added `Info` to the lucide-react import list (line 9) to support the Important Notes section of the guide.

**2. Added "How to Start Receiving Payments" guide section (after Spending Chart, before Saved Cards)**
- New Card with animated entrance (`motion.div` with fade-in and slide-up, delay 0.3s)
- **Stripe Integration Notice**: Emerald-highlighted info box confirming Stripe Checkout is already integrated, explaining checkout redirect flow and webhook confirmation
- **Step 1 - Create a Stripe Account**: Instructions to sign up at stripe.com with business details
- **Step 2 - Get Your API Keys**: Guide to obtain Secret key and Publishable key, with code block showing `.env.local` format (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`), plus note about test vs live keys
- **Step 3 - Configure Webhook**: Instructions to add `/api/stripe-webhook` endpoint with `checkout.session.completed` event
- **Step 4 - Update Vercel Environment**: Code block with 4 environment variables for Vercel deployment (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`)
- **Step 5 - Test Your Checkout**: Test card number `4242 4242 4242 4242` and go-live instructions
- **Important Notes**: Blue info box with 5 bullet points covering HTTPS, CORS, Stripe CLI local testing, payout monitoring, and existing webhook endpoint

**Build Result:** ✅ Compiled successfully with zero errors.
**Lint Result:** ✅ Zero new errors.
