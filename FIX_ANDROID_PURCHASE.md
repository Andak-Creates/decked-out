# Fix Android Purchase Not Unlocking Premium

## 🔍 Most Likely Issue

The `premium_status` table doesn't exist in your Supabase database, or Row Level Security (RLS) policies are blocking the update.

## ✅ Quick Fix Steps

### Step 1: Check if Table Exists

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Table Editor**
4. Look for `premium_status` table

### Step 2: Create Table (If Missing)

If the table doesn't exist, run this SQL in Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of:
-- migrations/create_premium_status_table.sql
```

Or run this directly:

```sql
CREATE TABLE IF NOT EXISTS premium_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN DEFAULT false,
  premium_type TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE premium_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own premium status"
  ON premium_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own premium status"
  ON premium_status FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own premium status"
  ON premium_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Step 3: Test Again

1. Restart your app
2. Try purchasing again
3. Check console logs for:
   - "🛒 Updating premium status in Supabase"
   - "✅ Premium status updated successfully"
   - "🔄 Reloading premium status after purchase"
   - "✅ Premium status reloaded"

### Step 4: Check Supabase

After purchase, check Supabase:
1. Go to Table Editor → `premium_status`
2. Look for a row with your `user_id`
3. Check if `is_premium` is `true`

## 🐛 Debugging

### Check Console Logs

Look for these logs in your console:
- ✅ "🧪 MOCK Android Purchase: deckedout_xxx" - Purchase started
- ✅ "🛒 Updating premium status in Supabase" - Supabase update started
- ✅ "✅ Premium status updated successfully" - Supabase update succeeded
- ❌ "❌ Error updating premium status" - Supabase update failed
- ✅ "🔄 Reloading premium status after purchase" - Status reload started
- ✅ "📊 Premium status from Supabase" - Status loaded
- ✅ "✅ Setting premium status" - State updated

### Common Errors

**Error: "relation 'premium_status' does not exist"**
- **Fix**: Create the table (Step 2 above)

**Error: "new row violates row-level security policy"**
- **Fix**: Check RLS policies are set correctly (Step 2 above)

**Error: "duplicate key value violates unique constraint"**
- **Fix**: This is fine - upsert should handle it, but check the UNIQUE constraint

**No error but premium not unlocking**
- Check if `is_premium` is actually `true` in Supabase
- Check if `loadPremiumStatus()` is being called
- Check if `isPremium` state is updating

## 🔧 Manual Test

To manually test if premium works:

1. Go to Supabase Table Editor
2. Find or create a row in `premium_status`:
   ```sql
   INSERT INTO premium_status (user_id, is_premium, premium_type)
   VALUES ('your-user-id-here', true, 'subscription')
   ON CONFLICT (user_id) 
   DO UPDATE SET is_premium = true, premium_type = 'subscription';
   ```
3. Restart your app
4. Premium should be unlocked

If this works, the issue is with the purchase flow. If it doesn't, the issue is with premium status checking.

## 📝 What I Added

I've added comprehensive logging to help debug:
- ✅ Error handling in `handleMockPurchase`
- ✅ Logging in `loadPremiumStatus`
- ✅ Logging after purchase completion

Check your console logs to see exactly where it's failing!

