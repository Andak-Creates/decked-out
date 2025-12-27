# Debugging Android Purchase Issue

## Problem
User purchased premium on Android emulator but premium cards didn't unlock.

## Possible Causes

### 1. Supabase Table Missing
The `premium_status` table might not exist in your Supabase database.

**Check**: Go to Supabase Dashboard → Table Editor → Check if `premium_status` table exists

**Fix**: Create the table with this SQL:
```sql
CREATE TABLE IF NOT EXISTS premium_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN DEFAULT false,
  premium_type TEXT, -- 'temporary' or 'subscription'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE premium_status ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own status
CREATE POLICY "Users can view their own premium status"
  ON premium_status
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to update their own status
CREATE POLICY "Users can update their own premium status"
  ON premium_status
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own status
CREATE POLICY "Users can insert their own premium status"
  ON premium_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 2. Supabase Update Failing Silently
The `upsert` might be failing but not throwing an error.

**Check**: Add error logging to see if Supabase update fails

### 3. Premium Status Not Reloading
After purchase, `loadPremiumStatus()` might not be called or might fail.

**Check**: Verify the purchase flow calls `loadPremiumStatus()` after successful purchase

### 4. State Not Updating
The React state might not be updating even though Supabase is updated.

**Check**: Check if `isPremium` state is being set correctly

## Debugging Steps

1. **Check Console Logs**:
   - Look for "🧪 MOCK Android Purchase" log
   - Look for any Supabase errors
   - Look for "Error loading premium status" messages

2. **Check Supabase**:
   - Go to Supabase Dashboard
   - Check `premium_status` table
   - See if a row was created/updated for your user

3. **Check Premium State**:
   - After purchase, check if `isPremium` is true
   - You can add a console.log in PremiumContext

4. **Check Deck Locking**:
   - Verify `isDeckPremium()` function is working
   - Check which decks are marked as premium

## Quick Fix to Test

Add this temporary debug code to see what's happening:

```typescript
// In handleMockPurchase, add logging:
console.log("🛒 Updating premium status:", {
  userId,
  package: pkg.identifier,
  isTemporary,
  expiresAt
});

const { data, error } = await supabase
  .from("premium_status")
  .upsert({
    user_id: userId,
    is_premium: true,
    premium_type: isTemporary ? "temporary" : "subscription",
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });

console.log("📊 Supabase update result:", { data, error });
```

