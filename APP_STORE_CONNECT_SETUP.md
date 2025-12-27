# App Store Connect Setup - Step by Step Guide

## 🎯 What You Need to Do in App Store Connect

This guide walks you through **exactly** what to do in App Store Connect to make iOS subscriptions work.

---

## Step 1: Create Your App

### 1.1 Go to App Store Connect

1. Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Click **My Apps** in the top navigation

### 1.2 Create New App

1. Click the **+** button (top left) → **New App**
2. Fill in the form:
   - **Platform**: Select **iOS**
   - **Name**: `deckedOut` (or your app name)
   - **Primary Language**: English
   - **Bundle ID**: Select `com.vwindi.deckedout` (must match your app.json)
   - **SKU**: `deckedout-001` (any unique identifier, can't be changed later)
   - **User Access**: Full Access (if you're the only developer)
3. Click **Create**

**Note**: You'll see a warning about needing to add app information later - that's fine, we're just creating the app shell.

---

## Step 2: Create Subscription Products

### 2.1 Navigate to In-App Purchases

1. In your app page, click **Features** tab (top navigation)
2. Click **In-App Purchases** in the left sidebar
3. Click the **+** button to create a new product

### 2.2 Create Subscription Group (First Time Only)

When you create your first subscription:

1. **Type**: Select **Auto-Renewable Subscription**
2. **Subscription Group**: Click **Create New Subscription Group**
3. **Group Name**: `DeckedOut Subscriptions`
4. Click **Create**

### 2.3 Create Weekly Subscription

**Product 1: Weekly**

1. **Type**: Auto-Renewable Subscription
2. **Subscription Group**: Select "DeckedOut Subscriptions"
3. **Reference Name**: `DeckedOut Weekly` (internal name, you'll see this)
4. **Product ID**: `deckedout_weekly` ⚠️ **MUST MATCH EXACTLY**
5. **Subscription Duration**: 1 Week
6. **Price**: Set your price (e.g., $4.99)
7. Click **Create**

**Add Localization**:

1. Click **Add Localization**
2. **Language**: English (U.S.)
3. **Display Name**: `Weekly Subscription`
4. **Description**: `Get access to all premium decks for one week`
5. Click **Save**

### 2.4 Create Monthly Subscription

**Product 2: Monthly**

1. Click **+** again → **Auto-Renewable Subscription**
2. **Subscription Group**: "DeckedOut Subscriptions" (same group)
3. **Reference Name**: `DeckedOut Monthly`
4. **Product ID**: `deckedout_monthly` ⚠️ **MUST MATCH EXACTLY**
5. **Subscription Duration**: 1 Month
6. **Price**: Set your price (e.g., $9.99)
7. Click **Create**

**Add Localization**:

- **Display Name**: `Monthly Subscription`
- **Description**: `Get access to all premium decks for one month`

### 2.5 Create Yearly Subscription

**Product 3: Yearly**

1. Click **+** again → **Auto-Renewable Subscription**
2. **Subscription Group**: "DeckedOut Subscriptions" (same group)
3. **Reference Name**: `DeckedOut Yearly`
4. **Product ID**: `deckedout_annual` ⚠️ **MUST MATCH EXACTLY**
5. **Subscription Duration**: 1 Year
6. **Price**: Set your price (e.g., $59.99)
7. Click **Create**

**Add Localization**:

- **Display Name**: `Yearly Subscription`
- **Description**: `Get access to all premium decks for one year. Best value!`

---

## Step 3: Submit Products for Review

### 3.1 Complete Product Information

For each product (Weekly, Monthly, Yearly):

1. **Review Information**:

   - Click on the product
   - Scroll to **Review Information** section
   - **Screenshot**: Upload a screenshot showing the subscription in your app
   - **Review Notes**: Add notes like "This is a subscription for premium card deck content"

2. **Subscription Details**:
   - **Subscription Display Name**: Same as Display Name
   - **Description**: Same as Description

### 3.2 Submit Each Product

1. For each product, click **Submit for Review** button
2. Apple will review (usually 24-48 hours)
3. Status will show as "Waiting for Review" → "In Review" → "Approved"

**Important**: Products must be **Approved** before they work in your app!

---

## Step 4: Verify Your Setup

### 4.1 Check Product IDs

Make sure these match **exactly**:

- ✅ `deckedout_weekly`
- ✅ `deckedout_monthly`
- ✅ `deckedout_annual`

### 4.2 Check Bundle ID

- ✅ Must be: `com.vwindi.deckedout`
- ✅ Must match your `app.json` bundleIdentifier

### 4.3 Check Subscription Group

- ✅ All 3 products in same group: "DeckedOut Subscriptions"

---

## Step 5: Create Sandbox Test Account

### 5.1 Create Tester

1. In App Store Connect, go to **Users and Access** (top navigation)
2. Click **Sandbox Testers** tab
3. Click **+** button
4. Fill in:
   - **Email**: Use a real email (not your Apple ID)
   - **Password**: Create a password
   - **First Name**: Test
   - **Last Name**: User
   - **Country/Region**: Your country
5. Click **Invite**

**Note**: You'll receive an email - you don't need to accept it, the account is ready to use.

---

## Step 6: Test Your Setup

### 6.1 Build App on Device

```bash
# Build for iOS device
npx expo run:ios --device

# Or use EAS Build
eas build --platform ios --profile production
```

### 6.2 Test Purchase Flow

1. Install app on **real iOS device** (simulator won't work for IAP)
2. Sign out of App Store in Settings → [Your Name] → Media & Purchases
3. Open your app
4. Navigate to PaywallScreen
5. Tap a subscription
6. When Apple IAP dialog appears, sign in with **sandbox tester email**
7. Purchase should complete (it's free in sandbox)

---

## ⚠️ Common Issues & Solutions

### Issue: "Product not available"

**Solution**:

- Products must be **Approved** (not just submitted)
- Wait 24-48 hours after submission
- Check product status in App Store Connect

### Issue: "No subscription packages available"

**Solution**:

- Check RevenueCat is configured (see next step)
- Verify products are approved
- Check Bundle ID matches

### Issue: Purchase dialog doesn't appear

**Solution**:

- Must test on **real device** (not simulator)
- Must be signed out of App Store
- Check internet connection

---

## 📋 Checklist

Before moving to RevenueCat setup, verify:

- [ ] App created in App Store Connect
- [ ] Bundle ID: `com.vwindi.deckedout`
- [ ] 3 subscription products created:
  - [ ] `deckedout_weekly` (1 Week)
  - [ ] `deckedout_monthly` (1 Month)
  - [ ] `deckedout_annual` (1 Year)
- [ ] All products in same subscription group
- [ ] All products have localizations (English)
- [ ] All products submitted for review
- [ ] At least one product is **Approved** (wait if needed)
- [ ] Sandbox tester created

---

## 🎯 Next Step: RevenueCat Configuration

Once your products are **approved** in App Store Connect:

1. Go to RevenueCat Dashboard
2. Add iOS app
3. Connect App Store Connect
4. Create products in RevenueCat (match the Product IDs exactly)
5. Create entitlement "DeckedOut Pro"
6. Create offering with all packages

See `APPLE_IAP_SETUP.md` Step 2 for RevenueCat setup details.

---

## ⏱️ Timeline

- **Creating products**: 10-15 minutes
- **Submitting for review**: 5 minutes
- **Apple review**: 24-48 hours (usually)
- **Total time**: 1-2 days

**Pro Tip**: Start this process now, then work on RevenueCat setup while waiting for approval!

---

## 📞 Need Help?

- **App Store Connect Help**: [help.apple.com/app-store-connect](https://help.apple.com/app-store-connect/)
- **Apple Developer Support**: Available in App Store Connect
- **Product ID Issues**: Make sure they match exactly (case-sensitive)

---

## Quick Reference

**Bundle ID**: `com.vwindi.deckedout`
**Product IDs**:

- `deckedout_weekly`
- `deckedout_monthly`
- `deckedout_annual`
  **Subscription Group**: DeckedOut Subscriptions

Once products are approved, your iOS subscriptions will work! 🎉
