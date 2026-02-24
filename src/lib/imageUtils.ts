import { supabase } from '@/supabase-client';

/**
 * Image utility for handling both HTTP URLs and Supabase Storage references
 */

/**
 * Generate a signed URL for a Supabase Storage reference
 * Signed URLs are valid for 300 seconds (5 minutes)
 * Use for rendering images stored in private buckets
 */
export async function getImageUrl(imageRef: string): Promise<string> {
  // If it's already an HTTP URL, return as-is
  if (imageRef.startsWith('http://') || imageRef.startsWith('https://')) {
    return imageRef;
  }

  // If it's a data URI (base64 encoded image), return as-is
  if (imageRef.startsWith('data:')) {
    return imageRef;
  }

  // If it's a Supabase Storage reference, generate signed URL
  if (imageRef.startsWith('supabase://')) {
    try {
      // Remove the supabase:// prefix and split into bucket and file path
      const pathWithoutScheme = imageRef.replace('supabase://', '');
      const parts = pathWithoutScheme.split('/');
      const bucketId = parts[0];
      const filePath = parts.slice(1).join('/');
      
      if (!bucketId || !filePath) {
        console.error('Invalid supabase:// reference:', imageRef);
        return '';
      }

      const { data } = await supabase.storage
        .from(bucketId)
        .createSignedUrl(filePath, 300); // 5 minute signed URL

      return data?.signedUrl || '';
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return '';
    }
  }

  // Fallback for any other format
  console.warn('Unknown image format:', imageRef);
  return imageRef;
}

/**
 * Convert image reference to a URL suitable for img src attribute
 * For private buckets, must fetch signed URL first
 */
export async function resolveImageUrl(imageRef: string): Promise<string> {
  if (!imageRef) return '';
  return await getImageUrl(imageRef);
}

/**
 * Extract filename from supabase:// reference
 */
export function getFilenameFromReference(imageRef: string): string {
  if (imageRef.startsWith('supabase://')) {
    const parts = imageRef.split('/');
    return parts[parts.length - 1];
  }
  return '';
}

/**
 * Check if image is stored in Supabase Storage
 */
export function isSupabaseStorageImage(imageRef: string): boolean {
  return imageRef.startsWith('supabase://');
}

/**
 * Check if image is HTTP URL
 */
export function isHttpUrl(imageRef: string): boolean {
  return imageRef.startsWith('http://') || imageRef.startsWith('https://');
}
