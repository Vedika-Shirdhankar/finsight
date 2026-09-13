/**
 * Cloudinary Upload Service Helper
 * Handles receipt and image uploads via the Render Express Backend API or direct Cloudinary uploads.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'finsight_uploads';

export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  public_id?: string;
  error?: string;
}

/**
 * Upload receipt image to Cloudinary via the Render backend API endpoint
 */
export async function uploadReceiptViaBackend(file: File): Promise<CloudinaryUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${BACKEND_URL}/api/upload/receipt`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      public_id: data.public_id,
    };
  } catch (error: any) {
    console.error('Error uploading receipt via backend:', error);
    // Fallback to direct unsigned upload if backend is unreachable
    return uploadDirectToCloudinary(file, 'receipts');
  }
}

/**
 * Direct unsigned upload to Cloudinary (fallback when server route is omitted)
 */
export async function uploadDirectToCloudinary(
  file: File,
  folder = 'receipts'
): Promise<CloudinaryUploadResponse> {
  if (!CLOUDINARY_CLOUD_NAME) {
    return {
      success: false,
      url: '',
      error: 'Cloudinary Cloud Name (VITE_CLOUDINARY_CLOUD_NAME) is not set in environment variables.',
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `finsight/${folder}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Direct Cloudinary upload failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error: any) {
    console.error('Direct Cloudinary Upload Error:', error);
    return {
      success: false,
      url: '',
      error: error.message || 'Direct upload to Cloudinary failed.',
    };
  }
}
