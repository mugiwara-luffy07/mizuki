# Next Steps - Getting Your Auth System Running

Follow these steps in order to set up your authentication system.

## Step 1: Run the Database Migration ✅

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Migration**
   - Open the file `supabase-auth-migration.sql` from your project
   - Copy the **entire contents** (all 510 lines)
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify Success**
   - You should see "Success. No rows returned"
   - Check that tables were created:
     - Go to **Table Editor** → You should see `profiles` and `admin_invites` tables
   - Check that triggers exist:
     - Go to **Database** → **Triggers** → Look for `on_auth_user_created`

## Step 2: Create Your First Super Admin 👑

You need at least one super admin to manage the system.

### Option A: Via Supabase Dashboard (Easiest)

1. **Create Auth User**
   - Go to **Authentication** → **Users** → **Add User**
   - Enter email: `superadmin@yourcompany.com`
   - Enter password: (choose a strong password)
   - Click **Create User**
   - **Copy the User UUID** (you'll need this)

2. **Create Super Admin Profile**
   - Go to **SQL Editor** → **New Query**
   - Run this SQL (replace with your actual UUID and email):
   ```sql
   INSERT INTO profiles (id, email, role, tenant)
   VALUES (
     'PASTE_USER_UUID_HERE',
     'superadmin@yourcompany.com',
     'super_admin',
     NULL
   );
   ```

### Option B: Via SQL (More Control)

```sql
-- Step 1: Create auth user via Supabase Auth API or Dashboard first
-- Then get the UUID and run:

INSERT INTO profiles (id, email, role, tenant)
VALUES (
  'USER_UUID_FROM_AUTH_USERS',
  'superadmin@yourcompany.com',
  'super_admin',
  NULL
);
```

## Step 3: Test Super Admin Login 🔐

1. **Start Your Dev Server**
   ```powershell
   cd storefuse-saas-engine-e70d09d1
   npm run dev
   ```

2. **Navigate to Super Admin Login**
   - Open browser: `http://localhost:5173/superadmin/login`
   - Enter your super admin email and password
   - Click **Sign In**

3. **Verify Redirect**
   - Should redirect to `/superadmin/dashboard`
   - You should see the Super Admin dashboard

## Step 4: Create Admin Invites 📧

Now that you're logged in as super admin, create invites for your admins.

### Via SQL (Quick Test)

```sql
-- Create an admin invite
INSERT INTO admin_invites (email, tenant)
VALUES ('admin@mizuki.com', 'mizuki');
```

### Via Your App (Recommended)

1. **Add Admin Invite Manager to Super Admin Dashboard**
   - Open `src/superadmin/DashboardHome.tsx`
   - Import and add the `AdminInviteManager` component:
   ```tsx
   import { AdminInviteManager } from '@/components/AdminInviteManager';
   
   // In your component:
   <AdminInviteManager />
   ```

2. **Create Invites via UI**
   - Navigate to Super Admin Dashboard
   - Use the invite manager to create admin invites

## Step 5: Test Admin Signup & Login 👨‍💼

1. **Sign Up as Invited Admin**
   - Go to `/login` (or your signup page)
   - Use the email from the invite you created
   - Sign up with a password
   - Should automatically get `admin` role

2. **Verify Profile Created**
   - Go to Supabase Dashboard → **Table Editor** → `profiles`
   - Find your new admin user
   - Verify: `role = 'admin'`, `tenant = 'mizuki'` (or your tenant)

3. **Test Admin Login**
   - Go to `/mizuki/admin` (replace with your tenant)
   - Login with admin credentials
   - Should redirect to `/:tenant/admin/dashboard`

## Step 6: Test Regular User Signup 👤

1. **Sign Up as Regular User**
   - Go to `/login`
   - Use an email that's NOT in admin_invites
   - Sign up with a password
   - Should automatically get `user` role

2. **Verify Profile**
   - Check `profiles` table
   - Should have `role = 'user'`, `tenant = NULL`

## Step 7: Test Order Creation (CRUD) 📦

1. **Create an Order**
   - As a regular user, go to `/:tenant/order`
   - Fill out the order form
   - Submit the order

2. **Verify Order in Database**
   - Go to Supabase Dashboard → **Table Editor** → `orders`
   - Should see your new order

## Step 8: Verify RLS Policies 🔒

Test that Row Level Security is working:

### Test 1: Users can only see their own orders
```sql
-- Login as a regular user, then try:
SELECT * FROM orders;
-- Should only see orders where customer.email matches user email
```

### Test 2: Admins can see tenant orders
```sql
-- Login as admin, then try:
SELECT * FROM orders;
-- Should only see orders for their tenant
```

### Test 3: Super Admins can see everything
```sql
-- Login as super admin, then try:
SELECT * FROM orders;
-- Should see all orders
```

## Troubleshooting 🔧

### Issue: "User profile not found" after signup
**Solution:**
```sql
-- Manually create the profile
INSERT INTO profiles (id, email, role, tenant)
VALUES (
  'USER_UUID_HERE',
  'user@example.com',
  'user',
  NULL
);
```

### Issue: "Access denied" when logging in
**Check:**
1. Profile exists in `profiles` table
2. Role is correct (`super_admin`, `admin`, or `user`)
3. Tenant matches for admin users

### Issue: Trigger not firing
**Check:**
1. Go to **Database** → **Triggers**
2. Verify `on_auth_user_created` exists
3. Check trigger is enabled

### Issue: Can't create admin invite
**Check:**
1. You're logged in as super admin
2. RLS policies are correct
3. Check Supabase logs for errors

## Quick Reference Commands 📋

### Check if migration ran successfully:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'admin_invites', 'orders');

-- Check triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check policies exist
SELECT policyname FROM pg_policies 
WHERE tablename IN ('profiles', 'admin_invites');
```

### View all users and their roles:
```sql
SELECT p.id, p.email, p.role, p.tenant, p.created_at
FROM profiles p
ORDER BY p.created_at DESC;
```

### View all admin invites:
```sql
SELECT id, email, tenant, used, created_at
FROM admin_invites
ORDER BY created_at DESC;
```

## What's Next? 🚀

After everything is working:

1. ✅ **Add Admin Invite Manager UI** to Super Admin Dashboard
2. ✅ **Add User Management UI** for admins to manage their tenant users
3. ✅ **Add Password Reset** functionality
4. ✅ **Add Email Verification** (optional)
5. ✅ **Customize email templates** for invites
6. ✅ **Add audit logging** for admin actions
7. ✅ **Set up monitoring** and alerts

## Need Help? 💬

- Check `AUTH_SETUP.md` for detailed setup guide
- Check `TRIGGER_FIX.md` for trigger troubleshooting
- Check `SQL_FIX_SUMMARY.md` for SQL fixes documentation
- Check Supabase Dashboard → **Logs** for error messages

---

**You're all set! Start with Step 1 and work through each step. Good luck! 🎉**

