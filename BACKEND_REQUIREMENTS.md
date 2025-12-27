# Backend API Requirements for Paystack Integration

## Overview

Your backend needs to handle the Paystack payment flow for Android users. The flow is:

1. **App** → Calls your backend to create Paystack payment
2. **Backend** → Creates Paystack payment, stores reference, returns payment URL
3. **User** → Completes payment on Paystack
4. **Paystack** → Sends webhook to your backend
5. **Backend** → Verifies payment, updates Supabase, syncs to RevenueCat
6. **App** → Polls backend to check payment status

## Required Backend Endpoints

### 1. Create Paystack Payment
**Endpoint**: `POST /api/payments/paystack/create`

**Request Body**:
```json
{
  "userId": "user-uuid",
  "userEmail": "user@example.com",
  "packageIdentifier": "deckedout_monthly",
  "amount": 9.99
}
```

**Response**:
```json
{
  "success": true,
  "paymentUrl": "https://paystack.com/pay/xxxxx",
  "paymentReference": "deckedout_userId_timestamp"
}
```

**Backend Logic**:
1. Create Paystack payment using Paystack API
2. Store payment reference in your database with:
   - userId
   - packageIdentifier
   - amount
   - status: "pending"
   - paymentReference
3. Return payment URL and reference

### 2. Verify Payment Status
**Endpoint**: `GET /api/payments/paystack/verify/:paymentReference`

**Response**:
```json
{
  "success": true,
  "status": "completed", // pending, completed, failed
  "subscriptionActive": true
}
```

**Backend Logic**:
1. Check payment status in your database
2. If completed, return status
3. If pending, check Paystack API for latest status

### 3. Paystack Webhook Handler
**Endpoint**: `POST /api/payments/paystack/webhook`

**Paystack Webhook Payload** (from Paystack):
```json
{
  "event": "charge.success",
  "data": {
    "reference": "payment_reference",
    "amount": 999,
    "customer": {
      "email": "user@example.com"
    },
    "status": "success"
  }
}
```

**Backend Logic** (CRITICAL):
1. Verify webhook signature from Paystack
2. Verify payment with Paystack API
3. Update Supabase `premium_status` table:
   ```sql
   UPDATE premium_status
   SET 
     is_premium = true,
     premium_type = 'subscription',
     expires_at = [calculate expiration based on package],
     updated_at = NOW()
   WHERE user_id = [userId from payment record]
   ```
4. Sync to RevenueCat using RevenueCat REST API:
   ```javascript
   // POST https://api.revenuecat.com/v1/subscribers/{userId}/subscriptions
   // Headers: Authorization: Bearer {REVENUECAT_SECRET_KEY}
   // Body: {
   //   "product_id": "deckedout_monthly",
   //   "purchased_at": "2024-01-01T00:00:00Z",
   //   "expires_at": "2024-02-01T00:00:00Z"
   // }
   ```
5. Update payment record status to "completed"

## Database Schema

You'll need a `paystack_payments` table (or similar):

```sql
CREATE TABLE paystack_payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  package_identifier TEXT NOT NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in kobo
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## RevenueCat Sync

To sync Android subscriptions to RevenueCat, use RevenueCat's REST API:

**Endpoint**: `POST https://api.revenuecat.com/v1/subscribers/{userId}/subscriptions`

**Headers**:
```
Authorization: Bearer {REVENUECAT_SECRET_KEY}
Content-Type: application/json
```

**Body**:
```json
{
  "product_id": "deckedout_monthly",
  "purchased_at": "2024-01-01T00:00:00Z",
  "expires_at": "2024-02-01T00:00:00Z",
  "store": "paystack" // or "promotional"
}
```

**Note**: You'll need your RevenueCat Secret Key (not the public API key)

## Package Duration Mapping

Map package identifiers to subscription durations:

- `deckedout_weekly` → 7 days
- `deckedout_monthly` → 30 days
- `deckedout_annual` → 365 days
- `deckedout_3hour` → 3 hours
- `deckedout_6hour` → 6 hours

## Security Considerations

1. **Webhook Verification**: Always verify Paystack webhook signatures
2. **Idempotency**: Handle duplicate webhook calls
3. **Error Handling**: Log all errors, retry failed operations
4. **API Keys**: Store Paystack secret key and RevenueCat secret key securely (environment variables)

## Testing

1. Use Paystack test mode
2. Test with Paystack test cards
3. Verify webhook is received
4. Check Supabase is updated
5. Verify RevenueCat shows subscription

