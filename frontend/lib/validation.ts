export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizeEmail(value));

export const normalizePhone = (value: string): string =>
  value.replace(/[\s().-]/g, "");

export const isValidIndonesianPhone = (value: string): boolean =>
  /^(?:\+62|62|0)8\d{8,12}$/.test(normalizePhone(value));

export const isValidPersonName = (value: string): boolean => {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length >= 2 &&
    normalized.length <= 100 &&
    /^[\p{L}][\p{L}\p{M} .'-]*$/u.test(normalized);
};

export const isValidCode = (value: string, maxLength = 50): boolean => {
  const normalized = value.trim();
  return normalized.length > 0 &&
    normalized.length <= maxLength &&
    /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(normalized);
};

export const isPositiveNumber = (value: number | string): boolean => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const isNonNegativeNumber = (value: number | string): boolean => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

const parseDateOnly = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
};

const today = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const isValidPastDate = (value: string): boolean => {
  const date = parseDateOnly(value);
  return date !== null && date <= today();
};

export const isValidFutureDate = (value: string): boolean => {
  const date = parseDateOnly(value);
  return date !== null && date > today();
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
