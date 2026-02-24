# SQL Migration Fix Summary

## Problem
The original SQL migration had errors where `OLD` and `NEW` record variables were referenced in RLS policy expressions. These variables only exist in trigger functions, not in policy expressions, causing the error:
```
missing FROM-clause entry for table 'old'
```

## Solution Applied

### 1. Fixed Update Policy
**Before (incorrect):**
```sql
WITH CHECK (
  OLD.role = 'super_admin' OR NEW.role != 'super_admin'
);
```

**After (correct):**
```sql
WITH CHECK (
  -- Only super admins can update (already enforced by USING clause)
  -- Prevent changing someone to super_admin unless they already are one
  -- This is enforced by trigger function below
  TRUE
);
```

### 2. Fixed Delete Policy
**Before (incorrect):**
```sql
USING (
  EXISTS (...)
  AND OLD.role != 'super_admin' -- Cannot delete super admin
);
```

**After (correct):**
```sql
USING (
  EXISTS (...)
  -- Prevent deleting super_admin rows (check current row's role)
  AND NOT EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = profiles.id
      AND p2.role = 'super_admin'
  )
);
```

### 3. Added Trigger Functions
Since we need to compare OLD and NEW values to prevent demoting/deleting super admins, we added trigger functions:

#### `prevent_demote_super_admin()`
- **Trigger:** `BEFORE UPDATE` on `profiles`
- **Purpose:** Prevents changing a super_admin's role to anything else
- **Also prevents:** Promoting someone to super_admin via UPDATE (must be done manually)

#### `prevent_delete_super_admin()`
- **Trigger:** `BEFORE DELETE` on `profiles`
- **Purpose:** Prevents deleting any profile with role = 'super_admin'

## How It Works Now

1. **RLS Policies** control **who** can perform operations (authentication/authorization)
2. **Trigger Functions** control **what** operations are allowed (business rules)

### Update Flow
1. RLS policy checks if caller is super_admin (USING clause)
2. If yes, allows the UPDATE to proceed
3. Trigger function checks if trying to demote/promote super_admin
4. If violation, raises exception and blocks the operation

### Delete Flow
1. RLS policy checks:
   - Caller is super_admin (USING clause)
   - Target row is NOT a super_admin (subquery check)
2. If both pass, DELETE proceeds
3. Trigger function provides additional safety check (redundant but safe)

## Benefits

✅ **No more SQL errors** - Policies use valid SQL expressions
✅ **Stronger protection** - Triggers enforce business rules at database level
✅ **Clear separation** - RLS for access control, triggers for business logic
✅ **Better error messages** - Triggers can provide specific error messages

## Testing

After running the fixed migration, test:

1. **Try to demote super_admin:**
   ```sql
   UPDATE profiles SET role = 'admin' WHERE role = 'super_admin';
   -- Should fail with: "Cannot demote a super_admin..."
   ```

2. **Try to delete super_admin:**
   ```sql
   DELETE FROM profiles WHERE role = 'super_admin';
   -- Should fail with: "Cannot delete a super_admin..."
   ```

3. **Try to promote to super_admin:**
   ```sql
   UPDATE profiles SET role = 'super_admin' WHERE role = 'admin';
   -- Should fail with: "Cannot promote user to super_admin via update..."
   ```

All these operations should be blocked, ensuring super_admin accounts are protected.

## Migration Instructions

If you've already run the old migration:

1. **Drop the problematic policies:**
   ```sql
   DROP POLICY IF EXISTS "Only super admins can update profiles" ON profiles;
   DROP POLICY IF EXISTS "Only super admins can delete profiles" ON profiles;
   ```

2. **Run the fixed policies and triggers** from the updated `supabase-auth-migration.sql` file (sections 5 and 6).

Or simply re-run the entire migration file - it uses `CREATE OR REPLACE` and `IF NOT EXISTS` so it's safe to re-run.

