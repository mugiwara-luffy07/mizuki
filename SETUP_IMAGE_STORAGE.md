## SETUP QUICK START

### 1️⃣ Create Supabase Storage Bucket

**Option A: Using SQL (Recommended)**
```sql
-- Copy entire content of supabase-storage-setup.sql
-- Paste in Supabase Dashboard → SQL Editor
-- Click "Run"
```

**Option B: Using Dashboard**
1. Supabase → Project → Storage
2. Click "Create a new bucket"
3. Enter name: `product-images`
4. Toggle OFF "Public bucket"
5. Click Create

### 2️⃣ Set Up RLS Policies (If not using SQL)

In Supabase Dashboard → Storage → product-images → Policies:

**Policy 1: Admins can upload**
```
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
)
```

**Policy 2: Admins can read**
```
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
)
```

**Policy 3: Admins can delete**
```
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
)
```

**Policy 4: Public can read via signed URL**
```
FOR SELECT
TO public
USING (true)
```

### 3️⃣ Restart Dev Server

```bash
npm run dev
```

---

## TESTING

### Test URL Link Upload:
1. Admin → Products → Add Product
2. Click "Add URL" tab
3. Paste: `https://images.unsplash.com/photo-...jpg`
4. Click "Add URL"
5. Click Save → Should work ✓

### Test File Upload:
1. Admin → Products → Add Product
2. Click "Upload File"
3. Select image from computer
4. Should show upload progress
5. Click Save → Should work ✓

### Test Rendering:
1. Go to Shop page
2. Check images load correctly
3. Verify no 404 errors in console
4. Try opening product details

---

## TROUBLESHOOTING

### "Upload failed: 403" 
→ RLS policies not set correctly
→ Check user has `admin` or `superadmin` role in `profiles` table

### "CORS error"
→ Bucket is public (should be PRIVATE)
→ Verify bucket settings

### Images show as broken
→ Signed URL expired (regenerate)
→ Check network tab for 404s

### Bucket doesn't exist
→ Run the SQL migration
→ Or create manually via Dashboard

---

## FILES MODIFIED/CREATED

✅ **New Files:**
- `supabase-storage-setup.sql` - Bucket & RLS setup
- `src/lib/imageUtils.ts` - Image URL utilities
- `src/components/ProductCard.tsx` - Reusable product card
- `IMAGE_REFACTOR_COMPLETE.md` - Full documentation

✅ **Modified Files:**
- `src/admin/AdminProducts.tsx` - Storage upload + payload fix
- `src/admin/ProductPreview.tsx` - Image resolution
- `src/pages/ProductDetails.tsx` - Image resolution
- `src/pages/Shop.tsx` - Uses ProductCard

✅ **Database Schema:**
- ✓ No changes needed (already has `images` JSONB)

---

## WHAT CHANGED

### ❌ Removed:
- Base64 file upload logic
- FileReader.readAsDataURL()
- Cloudinary config import

### ✅ Added:
- Supabase Storage file upload
- UUID-based unique filenames
- Signed URL generation
- supabase:// URL references
- Image utility functions
- ProductCard component

### ℹ️ Kept Working:
- HTTP URL linking
- Database schema
- Product editing
- All existing products

---

## PERFORMANCE NOTES

**Before:**
- 1MB file = 1.3MB in database
- Large products slow to load/save

**After:**
- 1MB file = 1MB in storage + 100 bytes ref
- Much faster database operations
- Signed URLs cached for 5 minutes
- Minimal bandwidth usage

---

Ready to test? Start with Step 1 above! 🚀
