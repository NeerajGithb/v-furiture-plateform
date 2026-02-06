/**
 * Generate a slug from product name
 * Example: "Modern Wooden Dining Table" -> "modern-wooden-dining-table"
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Generate a random alphanumeric string
 */
const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Get timestamp-based unique identifier
 * Returns last 6 digits of timestamp + 3 random chars
 */
const getTimestampId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = generateRandomString(3);
  return `${timestamp}${random}`;
};

/**
 * Generate unique SKU from product name with timestamp
 * Example: "Storage Bench" -> "STORAGE-BENCH-172345ABC"
 * Format: PREFIX-TIMESTAMP(6)+RANDOM(3)
 */
export const generateUniqueSKU = (name: string): string => {
  const prefix = name
    .toUpperCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .slice(0, 2) // Take first 2 words to keep it shorter
    .join('-');
  
  const uniqueId = getTimestampId();
  
  return `${prefix}-${uniqueId}`;
};

/**
 * Generate unique itemId from product name with timestamp
 * Example: "Storage Bench" -> "storage-bench-172345"
 * Format: slug-timestamp(6)
 */
export const generateUniqueItemId = (name: string): string => {
  const slug = generateSlug(name);
  const timestamp = Date.now().toString().slice(-6);
  
  return `${slug}-${timestamp}`;
};

/**
 * Generate unique slug from product name with timestamp
 * Example: "Modern Wooden Table" -> "modern-wooden-table-172345"
 * Format: slug-timestamp(6)
 */
export const generateUniqueSlug = (name: string): string => {
  const baseSlug = generateSlug(name);
  const timestamp = Date.now().toString().slice(-6);
  
  return `${baseSlug}-${timestamp}`;
};
