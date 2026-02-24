# 🎯 Quick Start: Admin Authentication Setup

## What Changed?

✅ **Removed**: Separate admin login UI  
✅ **Added**: Email-based admin role system  
✅ **Changed**: Admins now use the same login page as regular users

## 🚀 Setup in 3 Steps

### 1️⃣ Run SQL Migration

```bash
# Open Supabase Dashboard → SQL Editor
# Copy & paste: supabase-admin-setup.sql
# Click "Run"
```

### 2️⃣ Set Admin Emails

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@example.com';
```

### 3️⃣ Test It

```
Visit: http://localhost:8080/mizuki/admin
↓
Redirects to: /mizuki/login
↓
Login with admin email
↓
Lands on: /mizuki/admin/dashboard ✨
```

## 📋 File Reference

| File | Purpose |
|------|---------|
| `supabase-admin-setup.sql` | Main database migration |
| `set-admin-emails.sql` | Quick reference for setting admins |
| `ADMIN_AUTH_SETUP.md` | Full setup guide |

## 🔑 Quick Commands

```sql
-- Set admin
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- Check admins
SELECT email, role FROM profiles WHERE role IN ('admin', 'superadmin');

-- Remove admin
UPDATE profiles SET role = 'user' WHERE email = 'old-admin@example.com';
```

## 💡 How Admin Login Works

```
/tenant/admin → Redirects → /tenant/login
                              ↓
                         Check credentials
                              ↓
                         Fetch user role
                              ↓
                    ┌─────────┴─────────┐
               Admin?              Not Admin?
                    │                   │
         /tenant/admin/dashboard    /tenant/home
              (Success!)          (Access Denied)
```

## 🎨 Code Examples

### Check if user is admin

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { isAdmin, role } = useAuthStore();
  
  if (isAdmin()) {
    return <AdminPanel />;
  }
  
  return <UserPanel />;
}
```

### Show admin-only features

```typescript
function Navigation() {
  const { isAdmin } = useAuthStore();
  
  return (
    <nav>
      <Link to="/">Home</Link>
      {isAdmin() && <Link to="/admin">Admin Dashboard</Link>}
    </nav>
  );
}
```

## 📦 What's Included

✅ Role-based authentication (user, admin, superadmin)  
✅ Protected admin routes  
✅ Automatic redirect after login based on role  
✅ Row Level Security (RLS) policies  
✅ Helper functions for checking admin status  
✅ Database triggers for new users  

## 🐛 Troubleshooting

**Q: Still seeing separate admin login?**  
→ Clear browser cache and restart dev server

**Q: Access denied even though I'm admin?**  
→ Run: `SELECT email, role FROM profiles WHERE email = 'your-email@example.com';`

**Q: Can't access admin routes?**  
→ Make sure you ran the SQL migration and set your email as admin

## 📞 Need Help?

Check the full guide: [ADMIN_AUTH_SETUP.md](./ADMIN_AUTH_SETUP.md)
