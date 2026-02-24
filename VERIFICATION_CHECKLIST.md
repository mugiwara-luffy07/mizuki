## IMAGE REFACTOR - VERIFICATION CHECKLIST

### ✅ Files Created
- [ ] `supabase-storage-setup.sql` - Storage bucket + RLS policies
- [ ] `src/lib/imageUtils.ts` - Image URL utilities
- [ ] `src/components/ProductCard.tsx` - Reusable card with image handling
- [ ] `IMAGE_REFACTOR_COMPLETE.md` - Complete documentation
- [ ] `SETUP_IMAGE_STORAGE.md` - Setup quick start

### ✅ Files Modified
- [ ] `src/admin/AdminProducts.tsx`
  - Removed Cloudinary import
  - Replaced FileReader with Supabase Storage upload
  - Added file size validation (10MB max)
  - Added UUID filename generation
  - **CRITICAL:** Fixed payload to include `images` array
  
- [ ] `src/admin/ProductPreview.tsx`
  - Added image resolution useEffect
  - Caches resolved URLs in state
  
- [ ] `src/pages/ProductDetails.tsx`
  - Added getImageUrl import
  - Added image resolution useEffect
  - Uses resolved URLs for rendering
  
- [ ] `src/pages/Shop.tsx`
  - Added ProductCard import
  - Removed inline card rendering
  - Uses ProductCard component

### ✅ Core Features
- [ ] URL input still works (https:// links accepted)
- [ ] File upload converts to Supabase Storage
- [ ] Unique filenames generated (UUID)
- [ ] References stored as `supabase://product-images/<uuid>`
- [ ] Both reference types coexist in database
- [ ] HTTP URLs rendered directly
- [ ] supabase:// refs converted to signed URLs
- [ ] Signed URLs cached to minimize API calls
- [ ] No Base64 anywhere (completely removed)

### ✅ Database
- [ ] `images` JSONB column utilized correctly
- [ ] `main_image_url` set to first image
- [ ] Multiple images persisted in array
- [ ] Existing HTTP URLs continue to work
- [ ] No schema changes required

### ✅ Supabase Setup
- [ ] Created bucket: `product-images` (PRIVATE)
- [ ] RLS policies set:
  - [ ] Admins can upload
  - [ ] Admins can read
  - [ ] Admins can delete
  - [ ] Public can read via signed URL

### ✅ Testing Tasks

**Test 1: Add Product with URL**
1. Admin → Products → Add Product
2. Paste URL: `https://images.unsplash.com/...jpg`
3. Click "Add URL"
4. Complete form, Save
5. Check database: `images` array contains URL ✓
6. Check Shop: Image displays correctly ✓

**Test 2: Add Product with File Upload**
1. Admin → Products → Add Product
2. Click "Upload File"
3. Select small image (< 10MB)
4. Verify upload progress
5. Complete form, Save
6. Check database: `images` contains `supabase://product-images/...` ✓
7. Check Shop: Image displays correctly ✓

**Test 3: Mixed Images**
1. Add 1 URL image
2. Add 1 file upload
3. Save product
4. Check database has both types ✓
5. Check Shop displays both ✓
6. Check ProductDetails carousel shows both ✓

**Test 4: File Size Validation**
1. Attempt to upload > 10MB file
2. Should show error: "File too large" ✓
3. Attempt to upload < 10MB
4. Should upload successfully ✓

**Test 5: Edit Existing Product**
1. Load existing product (with HTTP URL)
2. Add file upload
3. Save
4. Check both images persist ✓
5. Can remove either image ✓

**Test 6: Rendering**
- [ ] Shop page - images load
- [ ] Product details - carousel works
- [ ] Product preview - images visible
- [ ] Wishlist - thumbnail shows
- [ ] Cart - thumbnail shows
- [ ] Check console - no 404 errors
- [ ] Check console - no CORS errors

### ✅ Browser Console
After each test, verify:
- [ ] No errors in Console
- [ ] No failed image requests (Network tab)
- [ ] Images load from correct sources:
  - HTTP URLs from external domain
  - Storage URLs from Supabase signed URLs

### ✅ Performance
- [ ] No noticeable slowdown on Shop page
- [ ] ProductDetails carousel smooth
- [ ] Image upload shows progress
- [ ] File size validation instant

### ❌ Issues That Should NOT Occur
- [ ] Base64 strings in database ❌
- [ ] Images showing as broken ❌
- [ ] CORS errors on image load ❌
- [ ] Upload without file size check ❌
- [ ] Multiple images lost on save ❌
- [ ] Hardcoded tenant IDs ❌

---

## SIGN-OFF

When all checks pass, the refactor is complete:

**Date:** _____________
**Tester:** _____________
**Status:** ✅ Complete / ⚠️ Issues Found

**Issues Found (if any):**
```
(List any problems discovered)
```

**Notes:**
```
(Any additional notes)
```

---

## ROLLBACK (If Needed)

If critical issues found:

1. Restore from git:
   ```bash
   git checkout HEAD -- src/admin/AdminProducts.tsx
   git checkout HEAD -- src/pages/Shop.tsx
   git checkout HEAD -- src/pages/ProductDetails.tsx
   git checkout HEAD -- src/admin/ProductPreview.tsx
   ```

2. Remove new files:
   ```bash
   rm src/lib/imageUtils.ts
   rm src/components/ProductCard.tsx
   rm supabase-storage-setup.sql
   ```

3. Restart dev server
4. Test that image feature still works with Base64

---

## SUCCESS INDICATORS

✅ **System works correctly when:**
1. File uploads go to Supabase Storage (not Base64)
2. HTTP URLs work as URL links
3. Multiple images persist in database
4. Images render on all pages
5. No Base64 in database
6. Console shows no errors
7. Performance is good
