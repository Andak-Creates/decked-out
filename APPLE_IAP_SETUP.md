# Apple IAP Setup Guide - Complete Instructions

## ✅ Current Status

- ✅ Apple Developer Account: **APPROVED**
- ✅ RevenueCat SDK: **Installed & Configured**
- ✅ RevenueCat API Key: **Configured** (`test_ofFtWFrnOInZNOTDzlkvxWhjnkG`)
- ✅ App Code: **Ready for Apple IAP**

## What You Need to Do

### Step 1: Configure App Store Connect

#### 1.1 Create Your App

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: deckedOut
   - Primary Language: English
   - Bundle ID: `com.vwindi.deckedout` (from your app.json)
   - SKU: `deckedout-001` (or any unique identifier)

#### 1.2 Create In-App Purchase Products

1. In your app, go to **Features** → **In-App Purchases**
2. Click **+** to create products
3. Create these **Auto-Renewable Subscriptions**:

   **Product 1: Weekly Subscription**

   - Product ID: `deckedout_weekly` (or match your RevenueCat product ID)
   - Reference Name: "DeckedOut Weekly"
   - Subscription Group: Create new group "DeckedOut Subscriptions"
   - Subscription Duration: 1 Week
   - Price: Set your price (e.g., $4.99)
   - Localizations: Add descriptions

   **Product 2: Monthly Subscription**

   - Product ID: `deckedout_monthly`
   - Reference Name: "DeckedOut Monthly"
   - Subscription Group: Same group as above
   - Subscription Duration: 1 Month
   - Price: Set your price (e.g., $9.99)

   **Product 3: Yearly Subscription**

   - Product ID: `deckedout_annual` (or `deckedout_yearly`)
   - Reference Name: "DeckedOut Yearly"
   - Subscription Group: Same group as above
   - Subscription Duration: 1 Year
   - Price: Set your price (e.g., $59.99)

#### 1.3 Submit Products for Review

- Each product needs to be submitted for review
- Add screenshots and descriptions
- This can take 24-48 hours

### Step 2: Configure RevenueCat

#### 2.1 Add iOS App to RevenueCat

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project
3. Go to **Apps** → **Add App**
4. Select **iOS**
5. Enter your Bundle ID: `com.vwindi.deckedout`
6. Connect to App Store Connect:
   - Click **Connect** next to App Store Connect
   - Follow the authentication flow
   - Grant RevenueCat access to your App Store Connect account

#### 2.2 Create Products in RevenueCat

1. Go to **Products** in RevenueCat
2. Click **+ New Product**
3. For each subscription:
   - **Product ID**: Must match App Store Connect Product ID exactly
     - `deckedout_weekly`
     - `deckedout_monthly`
     - `deckedout_annual`
   - **Store**: App Store
   - **Type**: Subscription
   - Click **Create**

#### 2.3 Create Entitlement

1. Go to **Entitlements** in RevenueCat
2. Click **+ New Entitlement**
3. Name: `DeckedOut Pro` (must match `ENTITLEMENT_IDENTIFIER` in code)
4. Attach all three subscription products to this entitlement
5. Save

#### 2.4 Create Offering

1. Go to **Offerings** in RevenueCat
2. Click **+ New Offering**
3. Name: `default` (or any name)
4. Add all three packages:
   - Weekly Package → `deckedout_weekly`
   - Monthly Package → `deckedout_monthly`
   - Annual Package → `deckedout_annual`
5. Set as **Current Offering**
6. Save

### Step 3: Update Your Code

#### 3.1 Update API Key (If Needed)

If RevenueCat gave you a different API key for production, update:

```typescript
// services/revenueCatService.ts
const REVENUECAT_API_KEY = "your-production-key-here";
```

#### 3.2 Verify Product IDs Match

Make sure your product identifiers match between:

- App Store Connect Product IDs
- RevenueCat Product IDs
- Code identifiers (in `getMockPackages()`)

### Step 4: Test with Sandbox Account

#### 4.1 Create Sandbox Tester

1. In App Store Connect, go to **Users and Access** → **Sandbox Testers**
2. Click **+** to add a sandbox tester
3. Use a real email (not your Apple ID)
4. Create password

#### 4.2 Test in App

1. Build and run your app on a **real iOS device** (simulator won't work for IAP)
2. Sign out of App Store in Settings
3. When prompted during purchase, sign in with sandbox tester
4. Test purchases (they're free in sandbox)

### Step 5: Build and Test

#### 5.1 Build for Device

```bash
# Build iOS app
npx expo run:ios --device

# Or use EAS Build
eas build --platform ios --profile production
```

#### 5.2 Test Flow

1. Open app on device
2. Navigate to PaywallScreen
3. Tap subscription option
4. Should see Apple's purchase dialog
5. Sign in with sandbox account
6. Purchase should complete
7. Check RevenueCat dashboard for purchase
8. Check Supabase for premium status update

## Common Issues & Solutions

### Issue: "No subscription packages available"

**Solution**:

- Check RevenueCat offering is set as "current"
- Verify products are attached to offering
- Ensure App Store Connect products are approved

### Issue: "Product not available"

**Solution**:

- Products must be approved in App Store Connect
- Check product IDs match exactly
- Wait 24-48 hours after creating products

### Issue: Purchase doesn't complete

**Solution**:

- Must test on real device (not simulator)
- Use sandbox tester account
- Check internet connection
- Verify RevenueCat is properly configured

### Issue: RevenueCat not syncing

**Solution**:

- Check API key is correct
- Verify App Store Connect is connected in RevenueCat
- Check RevenueCat dashboard for errors

## Product ID Mapping

Make sure these match across all platforms:

| Your Code           | App Store Connect   | RevenueCat          |
| ------------------- | ------------------- | ------------------- |
| `deckedout_weekly`  | `deckedout_weekly`  | `deckedout_weekly`  |
| `deckedout_monthly` | `deckedout_monthly` | `deckedout_monthly` |
| `deckedout_annual`  | `deckedout_annual`  | `deckedout_annual`  |

## Testing Checklist

- [ ] App Store Connect products created
- [ ] Products submitted for review
- [ ] RevenueCat iOS app added
- [ ] App Store Connect connected in RevenueCat
- [ ] Products created in RevenueCat
- [ ] Entitlement "DeckedOut Pro" created
- [ ] Products attached to entitlement
- [ ] Offering created with all packages
- [ ] Offering set as "current"
- [ ] Sandbox tester created
- [ ] App built and installed on device
- [ ] Purchase flow tested
- [ ] RevenueCat dashboard shows purchase
- [ ] Supabase premium_status updated

## Next Steps After Testing

1. **Submit App for Review**: Once IAP is working, submit your app
2. **Monitor RevenueCat**: Check dashboard for purchases
3. **Set Up Webhooks**: Configure RevenueCat webhooks for server-side updates
4. **Analytics**: Use RevenueCat analytics to track subscriptions

## Support Resources

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [RevenueCat iOS Setup](https://docs.revenuecat.com/docs/ios)
- [Apple IAP Documentation](https://developer.apple.com/in-app-purchase/)

## Quick Reference

**Bundle ID**: `com.vwindi.deckedout`
**Entitlement**: `DeckedOut Pro`
**RevenueCat API Key**: `test_ofFtWFrnOInZNOTDzlkvxWhjnkG`
**Products**: `deckedout_weekly`, `deckedout_monthly`, `deckedout_annual`

---

Once you complete these steps, your Apple IAP will be fully functional! 🎉
