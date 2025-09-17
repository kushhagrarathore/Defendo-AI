# Supabase Storage Setup Guide

## 🗂️ **Step 1: Create Storage Bucket**

### Via Supabase Dashboard:
1. **Go to your Supabase project dashboard**
2. **Navigate to Storage** (left sidebar)
3. **Click "Create a new bucket"**
4. **Configure the bucket:**
   - **Name**: `service-images` (exactly this name)
   - **Public**: ✅ **Yes** (for direct image viewing)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
5. **Click "Create bucket"**

### Via SQL (Alternative):
Run this in your Supabase SQL Editor:
```sql
-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;
```

## 🔐 **Step 2: Set Up RLS Policies**

Run this SQL in your Supabase SQL Editor:
```sql
-- Create RLS policies for the storage bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload service images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to service images
CREATE POLICY "Public can view service images" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

-- Allow users to update their own service images
CREATE POLICY "Users can update their own service images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own service images
CREATE POLICY "Users can delete their own service images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 📁 **Step 3: Verify Folder Structure**

Your images will be organized as:
```
service-images/
├── {host_id}/
│   ├── {service_id}/
│   │   ├── image1.jpg
│   │   ├── image2.png
│   │   └── image3.webp
│   └── {another_service_id}/
│       └── image1.jpg
└── {another_host_id}/
    └── {service_id}/
        └── image1.jpg
```

## 🧪 **Step 4: Test the Setup**

### Test Upload:
1. **Go to Add Service page**
2. **Upload an image**
3. **Check Supabase Storage** to see if file appears
4. **Check the folder structure** matches expected format

### Test Viewing:
1. **Go to My Services page**
2. **Verify images display** in carousel
3. **Test carousel navigation**
4. **Check image URLs** in browser dev tools

## 🔧 **Troubleshooting**

### Common Issues:

#### ❌ "Bucket not found" error
- **Solution**: Ensure bucket name is exactly `service-images`
- **Check**: Go to Storage → Buckets → Verify bucket exists

#### ❌ "Permission denied" error
- **Solution**: Run the RLS policies SQL above
- **Check**: Go to Storage → Policies → Verify policies exist

#### ❌ Images not displaying
- **Solution**: Check if bucket is set to Public
- **Check**: Go to Storage → Buckets → service-images → Settings → Public

#### ❌ Upload fails silently
- **Solution**: Check browser console for errors
- **Check**: Verify file size < 5MB and correct MIME type

### Debug Steps:
1. **Check browser console** for JavaScript errors
2. **Check Network tab** for failed requests
3. **Verify bucket exists** in Supabase dashboard
4. **Test with small image** first (< 1MB)
5. **Check RLS policies** are applied correctly

## 📋 **Verification Checklist**

- [ ] Bucket `service-images` created
- [ ] Bucket set to Public
- [ ] RLS policies applied
- [ ] File size limit set to 5MB
- [ ] MIME types configured
- [ ] Test upload works
- [ ] Test viewing works
- [ ] Carousel displays images
- [ ] Navigation works smoothly

## 🎯 **Expected Behavior**

After setup, you should be able to:
1. **Upload images** when adding services
2. **See images** in service cards
3. **Navigate carousel** with smooth animations
4. **View images** directly via URLs
5. **Delete services** (images should be cleaned up)

## 📞 **Need Help?**

If you're still having issues:
1. **Check the browser console** for specific error messages
2. **Verify your Supabase project settings**
3. **Test with a simple image upload first**
4. **Check network requests** in browser dev tools
