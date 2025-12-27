# Payment Setup Guide

This guide explains how to set up the subscription payment system for deckedOut, which supports:
- **iOS**: Apple In-App Purchases (IAP) via RevenueCat
- **Android**: Paystack payments (since Play Store account is not available yet)

Both platforms sync subscriptions to RevenueCat for unified tracking.

## Prerequisites

1. **RevenueCat Account**: Sign up at [revenuecat.com](https://www.revenuecat.com)
2. **Paystack Account**: Sign up at [paystack.com](https://www.paystack.com)
3. **Supabase Project**: Your existing Supabase project

## Step 1: Set Up RevenueCat

### 1.1 Create RevenueCat Project
1. Log in to your RevenueCat dashboard
2. Create a new project
3. Add your iOS and Android apps

### 1.2 Get API Keys
1. In RevenueCat dashboard, go to **Project Settings** > **API Keys**
2. Copy your iOS API key (starts with `appl_`)
3. Copy your Android API key (starts with `goog_`)

### 1.3 Configure Products
1. In RevenueCat, go to **Products**
2. Create the following subscription products:
   - `deckedout_3hour` - 3 Hour Pass
   - `deckedout_6hour` - 6 Hour Pass
   - `deckedout_weekly` - Weekly Subscription
   - `deckedout_monthly` - Monthly Subscription
   - `deckedout_annual` - Annual Subscription

3. Create an entitlement called `premium` and attach all products to it

### 1.4 Update API Keys in Code
Edit `services/paymentService.ts` and replace:
```typescript
const REVENUECAT_API_KEY_IOS = "appl_YOUR_IOS_KEY_HERE";
const REVENUECAT_API_KEY_ANDROID = "goog_YOUR_ANDROID_KEY_HERE";
```

## Step 2: Set Up Paystack

### 2.1 Get Paystack API Keys
1. Log in to your Paystack dashboard
2. Go to **Settings** > **API Keys & Webhooks**
3. Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for production)
4. Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for production)

### 2.2 Update Paystack Keys in Code
Edit `services/paymentService.ts` and replace:
```typescript
const PAYSTACK_PUBLIC_KEY = "pk_test_YOUR_PAYSTACK_PUBLIC_KEY";
```

### 2.3 Set Up Backend API (Required for Production)

For production, you'll need a backend API endpoint to create Paystack payments securely. The current implementation includes a mock version, but for real payments, create an endpoint that:

1. Creates a Paystack payment using the Paystack API
2. Stores the payment reference in your database
3. Returns the payment authorization URL

Example backend endpoint (Node.js/Express):
```javascript
app.post('/api/create-paystack-payment', async (req, res) => {
  const { packageIdentifier, amount, userEmail, userId } = req.body;
  
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userEmail,
      amount: amount * 100, // Convert to kobo
      metadata: {
        package_identifier: packageIdentifier,
        user_id: userId,
      },
    }),
  });
  
  const data = await response.json();
  res.json({ paymentUrl: data.data.authorization_url });
});
```

Then update `createPaystackPayment` in `services/paymentService.ts` to call your backend API instead of the mock implementation.

## Step 3: Set Up Database

### 3.1 Run SQL Migration
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `migrations/create_paystack_payments_table.sql`

This creates the `paystack_payments` table to track Paystack transactions.

## Step 4: Configure iOS (When Ready)

### 4.1 Apple Developer Account
1. Sign up for an Apple Developer account ($99/year)
2. Create an App ID in App Store Connect
3. Configure In-App Purchases for your products

### 4.2 Connect to RevenueCat
1. In RevenueCat, go to **Integrations**
2. Add **App Store Connect** integration
3. Follow the setup wizard

### 4.3 Test Mode
Until you have an Apple Developer account, iOS will use mock data. The app will show a "Test Mode" banner.

## Step 5: Configure Android

### 5.1 Current Setup
Android users will use Paystack for payments since you don't have a Play Store Developer account yet.

### 5.2 Future: Google Play Integration
When you get a Play Store Developer account:
1. Create products in Google Play Console
2. Connect Google Play to RevenueCat
3. Update the code to use Google Play Billing for Android instead of Paystack

## Step 6: Testing

### 6.1 iOS Testing
- In test mode, purchases are simulated
- Test the purchase flow in the app
- Verify premium status updates in Supabase

### 6.2 Android Testing
- Use Paystack test mode (`pk_test_...`)
- Test with Paystack test cards:
  - Success: `4084084084084081`
  - Decline: `5060666666666666666`
- Verify payment verification works
- Check that subscriptions sync to RevenueCat

## Step 7: Production Deployment

### 7.1 Switch to Production Keys
1. Replace test API keys with production keys
2. Update Paystack to use `pk_live_...` and `sk_live_...`
3. Update RevenueCat API keys if needed

### 7.2 Set Up Webhooks
1. **Paystack Webhook**: Set up webhook URL in Paystack dashboard to verify payments
2. **RevenueCat Webhook**: Configure webhooks to sync subscription status

### 7.3 Security
- Never commit API keys to version control
- Use environment variables or secure storage
- Implement proper backend validation for Paystack payments

## Troubleshooting

### iOS Issues
- **Mock mode active**: This is normal if you don't have Apple Developer account yet
- **RevenueCat not initializing**: Check API keys are correct
- **Products not showing**: Verify products are configured in RevenueCat and App Store Connect

### Android Issues
- **Paystack payment not working**: Check that backend API is set up correctly
- **Payment verification failing**: Ensure Paystack webhook is configured
- **Subscription not syncing to RevenueCat**: Check RevenueCat API integration

## Support

For issues or questions:
- RevenueCat: [docs.revenuecat.com](https://docs.revenuecat.com)
- Paystack: [paystack.com/docs](https://paystack.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)

