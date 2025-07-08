// Data cleaning utilities for job ingestion

import type { JobLocation } from '../db/schema/jobs';

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

/**
 * US state abbreviation to full name mapping
 */
const US_STATE_MAP: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
};

/**
 * Normalizes a location string into a JobLocation object.
 * Handles US state abbreviations and parses city, state, country, zip.
 * Examples:
 *   'New York, NY, USA' => { city: 'New York', state: 'New York', country: 'USA' }
 *   'San Francisco, CA' => { city: 'San Francisco', state: 'California' }
 *   'London, UK' => { city: 'London', country: 'UK' }
 */
export const normalizeLocation = (input: string): JobLocation => {
  if (!input) return {};
  // Split by comma, trim whitespace
  const parts = input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  let city: string | undefined;
  let state: string | undefined;
  let country: string | undefined;
  let zip: string | undefined;

  if (parts.length > 0) city = parts[0];
  if (parts.length > 1) {
    const statePart = parts[1].toUpperCase();
    if (US_STATE_MAP[statePart]) {
      state = US_STATE_MAP[statePart];
    } else if (parts.length === 2) {
      country = parts[1];
    } else {
      state = parts[1];
    }
  }
  if (parts.length > 2) {
    // If third part is a zip code (all digits or digits+letters), else country
    if (/^\d{5}(-\d{4})?$/.test(parts[2])) {
      zip = parts[2];
    } else {
      country = parts[2];
    }
  }
  if (parts.length > 3) {
    // If fourth part exists, treat as country or zip
    if (!country && /^[A-Za-z]{2,}$/.test(parts[3])) {
      country = parts[3];
    } else if (!zip && /^\d{5}(-\d{4})?$/.test(parts[3])) {
      zip = parts[3];
    }
  }
  return { city, state, country, zip };
};
