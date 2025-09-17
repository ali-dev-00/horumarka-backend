import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const cloud_name = process.env.CLOUDINARY_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
      // Fail fast with a clear message if envs are missing
      // eslint-disable-next-line no-console
      console.error('[CloudinaryProvider] Missing Cloudinary configuration:', {
        cloud_name_present: !!cloud_name,
        api_key_present: !!api_key,
        api_secret_present: !!api_secret,
      });
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    }

    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });
    // eslint-disable-next-line no-console
    console.log('[CloudinaryProvider] Configured Cloudinary:', {
      cloud_name,
      api_key_masked: api_key?.slice?.(0, 4) + '****',
    });
    return cloudinary;
  },
};