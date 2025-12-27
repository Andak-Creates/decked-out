# Subscription Prices Update - Summary

## ✅ Changes Made

### Updated Subscription Packages

**Old Prices (USD)**:
- 3 Hour Pass: $2.99
- 6 Hour Pass: $4.99
- Weekly: $4.99
- Monthly: $9.99
- Yearly: $59.99

**New Prices (NGN - Nigerian Naira)**:
- ✅ **6 Hour Pass**: ₦1,200
- ✅ **24 Hour Pass**: ₦2,800 (NEW - replaced 3 Hour Pass)
- ✅ **Weekly**: ₦700
- ✅ **Monthly**: ₦2,500
- ✅ **Yearly**: ₦19,900

---

## 📝 What Was Changed

### 1. **Removed 3 Hour Pass**
- Removed `deckedout_3hour` package
- All references to "3hour" updated

### 2. **Added 24 Hour Pass**
- New package: `deckedout_24hour`
- Price: ₦2,800
- Duration: 24 hours

### 3. **Updated 6 Hour Pass**
- Price changed from $4.99 to ₦1,200
- Duration remains: 6 hours

### 4. **Updated Subscription Prices**
- Weekly: ₦700 (was $4.99)
- Monthly: ₦2,500 (was $9.99)
- Yearly: ₦19,900 (was $59.99)

---

## 📁 Files Updated

1. **`services/paymentService.ts`**
   - Updated `SubscriptionPackage` interface (removed "3hour", added "24hour")
   - Updated `getMockPackages()` with new prices
   - Updated `handleMockPurchase()` to handle 6hr/24hr
   - Updated helper functions (`getPackageTitle`, `getPackageDescription`, `getPackageDuration`)
   - Updated `syncSubscriptionToSupabase()` to check for 6hr/24hr

2. **`app/PaywallScreen.tsx`**
   - Updated `getPackageTitle()` function
   - Updated `getPackageDescription()` function

3. **`services/revenueCatService.ts`**
   - Updated temporary pass detection (6hr/24hr instead of 3hr/6hr)

---

## 🎯 Current Subscription Packages

| Package | Identifier | Price | Duration |
|---------|-----------|-------|----------|
| 6 Hour Pass | `deckedout_6hour` | ₦1,200 | 6 hours |
| 24 Hour Pass | `deckedout_24hour` | ₦2,800 | 24 hours |
| Weekly | `deckedout_weekly` | ₦700 | 1 week |
| Monthly | `deckedout_monthly` | ₦2,500 | 1 month |
| Yearly | `deckedout_annual` | ₦19,900 | 1 year |

---

## ⚠️ Important Notes

### For App Store Connect (iOS)
If you've already created products in App Store Connect, you'll need to:
1. **Remove** `deckedout_3hour` product (if created)
2. **Add** `deckedout_24hour` product:
   - Product ID: `deckedout_24hour`
   - Duration: Not applicable (consumable/non-renewable subscription)
   - Price: Set to match ₦2,800 (or equivalent in your App Store pricing tier)

### For RevenueCat
When configuring RevenueCat:
- Remove `deckedout_3hour` product (if added)
- Add `deckedout_24hour` product
- Update prices to match NGN amounts

### Currency Display
- Prices are displayed with ₦ symbol (Nigerian Naira)
- Format: ₦1,200, ₦2,800, etc.
- Prices stored as numbers: 1200, 2800, 700, 2500, 19900

---

## ✅ Testing

After these changes:
1. **Android**: Mock purchases will use new prices immediately
2. **iOS**: Will use new prices once App Store Connect products are updated
3. **Premium Status**: 6hr and 24hr passes will work correctly with timers

---

## 📊 Price Comparison

**Old (USD)** → **New (NGN)**:
- 3hr ($2.99) → **REMOVED**
- 6hr ($4.99) → 6hr (₦1,200)
- **NEW**: 24hr (₦2,800)
- Weekly ($4.99) → Weekly (₦700)
- Monthly ($9.99) → Monthly (₦2,500)
- Yearly ($59.99) → Yearly (₦19,900)

---

All changes are complete and ready to test! 🎉

