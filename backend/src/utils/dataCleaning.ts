// Data cleaning utilities for job ingestion

/**
 * Trims leading/trailing whitespace and collapses multiple spaces to a single space.
 */
export const cleanWhitespace = (input: string): string => {
  return input.replace(/\s+/g, ' ').trim();
};

/**
 * Removes unwanted special characters (except basic punctuation).
 * Allows letters, numbers, spaces, and . , - _ ( ) /
 */
export const removeSpecialCharacters = (input: string): string => {
  return input.replace(/[^\w\s.,\-_/()]/g, '');
};

/**
 * Strips HTML tags from a string (for descriptions).
 */
export const stripHtmlTags = (input: string): string => {
  return input.replace(/<[^>]*>/g, '');
};

/**
 * Normalizes casing: capitalizes first letter of each word, lowercases the rest.
 * Useful for company names, titles, etc.
 */
export const normalizeCase = (input: string): string => {
  return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};
