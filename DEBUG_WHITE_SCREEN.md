# Debugging White Screen Issue

If you're seeing a white blank screen at `http://localhost:8080/`, follow these steps:

## Quick Fixes

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for any JavaScript errors.

### 2. Verify Default Tenant
The root URL redirects to the default tenant. Check `src/config/defaultTenant.ts`:
```typescript
export const DEFAULT_TENANT = "mizuki";
```

Make sure this tenant exists in your Supabase database or tenant configuration.

### 3. Check Network Tab
In Developer Tools → Network tab, check if:
- CSS files are loading (`index.css`)
- JavaScript bundles are loading
- API calls to Supabase are working

### 4. Common Issues

#### Issue: Import Error
**Symptom:** Console shows "Cannot find module" or "Failed to resolve"
**Fix:** 
```bash
npm install
npm run dev
```

#### Issue: Supabase Connection Error
**Symptom:** Console shows Supabase connection errors
**Fix:** Check your `.env` file:
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

#### Issue: Tenant Config Not Loading
**Symptom:** Page redirects but shows blank
**Fix:** 
1. Check if tenant config file exists: `src/config/tenants/{tenant}.ts`
2. Or check Supabase `tenants` table if using database config

#### Issue: Infinite Redirect Loop
**Symptom:** Page keeps reloading
**Fix:** Check browser console for redirect errors. The Index page should redirect once.

### 5. Manual Navigation
If the redirect isn't working, try navigating directly:
- `http://localhost:8080/mizuki` (or your default tenant)

### 6. Clear Browser Cache
Sometimes cached files cause issues:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### 7. Check React DevTools
Install React DevTools extension and check:
- Is the App component rendering?
- Are there any component errors?

## Debug Steps

1. **Check if React is loading:**
   - Open browser console
   - Type: `window.React` - should not be undefined

2. **Check if root element exists:**
   - In console: `document.getElementById('root')` - should return the div

3. **Check for JavaScript errors:**
   - Look for red errors in console
   - Common errors:
     - `Cannot read property 'X' of undefined`
     - `Module not found`
     - `Failed to fetch`

4. **Check CSS loading:**
   - In Network tab, verify `index.css` loads successfully
   - Check if Tailwind classes are being applied

5. **Check Supabase connection:**
   - In console, look for Supabase initialization logs
   - Should see: `[Supabase] Client ready`

## Still Not Working?

1. **Restart dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Check port:**
   - Make sure port 8080 is not in use by another application
   - Try a different port: `npm run dev -- --port 3000`

3. **Check file paths:**
   - Make sure all imports are correct
   - Check for case-sensitive file names (especially on Linux/Mac)

4. **Check dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Check TypeScript errors:**
   ```bash
   npm run build
   ```
   This will show any TypeScript compilation errors.

## Expected Behavior

When you visit `http://localhost:8080/`:
1. Index page loads briefly (shows "Loading...")
2. Redirects to `http://localhost:8080/mizuki` (or your default tenant)
3. Home page loads with navbar, content, and footer

If any step fails, check the console for errors.












