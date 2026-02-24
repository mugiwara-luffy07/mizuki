# Trigger Function Fix for User Signup

## Problem
The `handle_new_user()` trigger function was failing when creating user profiles, causing "Database error saving new user" during signup/invite acceptance.

## Root Cause
The trigger function runs with `SECURITY DEFINER`, but RLS policies were blocking:
1. **INSERT into profiles** - No policy allowed the trigger to create profiles
2. **UPDATE admin_invites** - RLS policies might block the invite update
3. **SELECT from admin_invites** - RLS policies might block reading invites

## Solution Applied

### 1. Added Policy for Profile Creation
Created a new policy that allows profile creation during signup:
```sql
CREATE POLICY "Allow profile creation on signup"
  ON profiles
  FOR INSERT
  TO authenticated, anon, service_role
  WITH CHECK (
    id = auth.uid()  -- User can create their own profile
    OR EXISTS (...super admin check...)  -- Super admin can create any profile
  );
```

This allows:
- Users to create their own profile during signup (id = auth.uid())
- Super admins to create profiles manually
- The trigger function (running as service_role) to create profiles

### 2. Improved Error Handling
The function now:
- ✅ Catches errors when checking/updating admin_invites
- ✅ Falls back to 'user' role if invite processing fails
- ✅ Provides clear error messages if profile creation fails
- ✅ Validates tenant is not NULL for admin role

### 3. Function Privileges
The function uses:
- `SECURITY DEFINER` - Runs with function owner's privileges
- `SET search_path = public` - Ensures correct schema resolution
- Proper exception handling - Prevents silent failures

## Testing the Fix

### Test 1: Regular User Signup
```sql
-- Should create profile with role = 'user', tenant = NULL
-- Test via Supabase Auth signup or invite
```

### Test 2: Admin Invite Signup
1. Create an admin invite:
   ```sql
   INSERT INTO admin_invites (email, tenant)
   VALUES ('admin@test.com', 'mizuki');
   ```

2. Sign up with that email
3. Should create profile with role = 'admin', tenant = 'mizuki'
4. Invite should be marked as used

### Test 3: Error Cases
- **Invalid invite (NULL tenant):** Should fail with clear error
- **Missing profile creation:** Should fail auth user creation (correct behavior)

## Verification Queries

### Check if trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Check function:
```sql
SELECT proname, prosecdef, proconfig 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### Test profile creation manually:
```sql
-- This should work if policies are correct
INSERT INTO profiles (id, email, role, tenant)
VALUES (gen_random_uuid(), 'test@example.com', 'user', NULL);
```

## If Still Failing

### Check Auth Logs
1. Go to Supabase Dashboard → **Logs** → **Postgres Logs**
2. Look for errors when creating users
3. The error message will show the exact failing statement

### Common Issues

#### Issue: "permission denied for table profiles"
**Fix:** Ensure the function owner has INSERT permission:
```sql
GRANT INSERT ON profiles TO postgres;
-- Or grant to the role that owns the function
```

#### Issue: "new row violates row-level security policy"
**Fix:** The policy should allow the insert. Verify:
```sql
-- Check if policy exists
SELECT * FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow profile creation on signup';

-- Temporarily disable RLS to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- Test signup
-- Re-enable: ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

#### Issue: "null value in column violates not-null constraint"
**Fix:** Check that all required fields are provided:
- `id` (from NEW.id)
- `email` (from NEW.email)
- `role` (defaults to 'user' or 'admin' from invite)
- `tenant` (NULL for user, required for admin)

## Alternative: Debug Version

If you need to debug, use this version that logs everything:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invite_record RECORD;
  user_role TEXT := 'user';
  user_tenant TEXT := NULL;
BEGIN
  RAISE NOTICE 'handle_new_user: Processing user % (%)', NEW.email, NEW.id;

  -- Check for admin invite
  BEGIN
    SELECT * INTO invite_record
    FROM public.admin_invites
    WHERE email = NEW.email
      AND used = FALSE
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1;

    IF FOUND THEN
      RAISE NOTICE 'Found invite: id=%, tenant=%', invite_record.id, invite_record.tenant;
      user_role := 'admin';
      user_tenant := invite_record.tenant;
      
      UPDATE public.admin_invites
      SET used = TRUE, used_at = NOW(), used_by = NEW.id
      WHERE id = invite_record.id;
      RAISE NOTICE 'Invite marked as used';
    ELSE
      RAISE NOTICE 'No invite found, using default user role';
    END IF;
  EXCEPTION
    WHEN others THEN
      RAISE WARNING 'Error in invite processing: %', SQLERRM;
  END;

  -- Create profile
  BEGIN
    INSERT INTO public.profiles (id, email, role, tenant)
    VALUES (NEW.id, NEW.email, user_role, user_tenant);
    RAISE NOTICE 'Profile created: role=%, tenant=%', user_role, user_tenant;
  EXCEPTION
    WHEN others THEN
      RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Check logs in Supabase Dashboard → **Logs** → **Postgres Logs** to see the NOTICE messages.

