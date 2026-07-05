export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizeEmail(value));

export const normalizePhone = (value: string): string =>
  value.replace(/[\s().-]/g, "");

export const isValidIndonesianPhone = (value: string): boolean =>
  /^(?:\+62|62|0)8\d{8,12}$/.test(normalizePhone(value));

export const isPositiveNumber = (value: number | string): boolean => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const isNonNegativeNumber = (value: number | string): boolean => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

export const isValidPastDate = (value: string): boolean => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date <= new Date();
};

export const isValidFutureDate = (value: string): boolean => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date > new Date();
};

export const IMAGE_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp";

const imageUploadTypes = IMAGE_UPLOAD_ACCEPT.split(",");

export const getImageUploadError = (
  file: File,
  maxSizeBytes: number,
): string | null => {
  if (!imageUploadTypes.includes(file.type)) {
    return "Format file tidak didukung. Gunakan gambar JPEG, PNG, atau WebP.";
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    return `Ukuran file terlalu besar. Ukuran maksimal adalah ${maxSizeMB} MB.`;
  }

  return null;
};
