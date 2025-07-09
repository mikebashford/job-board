import {
  cleanWhitespace,
  removeSpecialCharacters,
  stripHtmlTags,
  normalizeCase,
  normalizeLocation,
  extractSkills,
} from './dataCleaning';

describe('dataCleaning utilities', () => {
  test('cleanWhitespace trims and collapses spaces', () => {
    expect(cleanWhitespace('  Hello   world   ')).toBe('Hello world');
    expect(cleanWhitespace('\tTab\nNewline\t')).toBe('Tab Newline');
  });

  test('removeSpecialCharacters removes unwanted characters', () => {
    expect(removeSpecialCharacters('Hello! @World# $2024%')).toBe(
      'Hello World 2024'
    );
    expect(removeSpecialCharacters('Keep . , - _ ( ) /')).toBe(
      'Keep . , - _ ( ) /'
    );
  });

  test('stripHtmlTags removes HTML tags', () => {
    expect(stripHtmlTags('<p>Hello <b>world</b></p>')).toBe('Hello world');
    expect(stripHtmlTags('No tags')).toBe('No tags');
  });

  test('normalizeCase capitalizes first letter of each word', () => {
    expect(normalizeCase('hello world')).toBe('Hello World');
    expect(normalizeCase('COMPANY NAME')).toBe('Company Name');
    expect(normalizeCase('mIxEd CaSe')).toBe('Mixed Case');
  });

  test('normalizeLocation parses and normalizes locations', () => {
    expect(normalizeLocation('New York, NY, USA')).toEqual({
      city: 'New York',
      state: 'New York',
      country: 'USA',
    });
    expect(normalizeLocation('San Francisco, CA')).toEqual({
      city: 'San Francisco',
      state: 'California',
    });
    expect(normalizeLocation('London, UK')).toEqual({
      city: 'London',
      country: 'UK',
    });
    expect(normalizeLocation('Austin, TX, 78701, USA')).toEqual({
      city: 'Austin',
      state: 'Texas',
      zip: '78701',
      country: 'USA',
    });
    expect(normalizeLocation('Berlin')).toEqual({ city: 'Berlin' });
    expect(normalizeLocation('')).toEqual({});
    expect(normalizeLocation('Chicago, IL, USA')).toEqual({
      city: 'Chicago',
      state: 'Illinois',
      country: 'USA',
    });
    expect(normalizeLocation('Toronto, ON, Canada')).toEqual({
      city: 'Toronto',
      state: 'ON',
      country: 'Canada',
    });
  });
});

describe('extractSkills', () => {
  test('extracts and normalizes single skill', () => {
    expect(extractSkills('Looking for a JavaScript developer')).toEqual([
      'JavaScript',
    ]);
    expect(extractSkills('Experience with React.js required')).toEqual([
      'React',
    ]);
    expect(extractSkills('Must know TS and Node.js')).toEqual([
      'TypeScript',
      'Node.js',
    ]);
  });

  test('extracts multiple skills and deduplicates', () => {
    expect(
      extractSkills(
        'We use React, Redux, TypeScript, and React.js in our stack'
      )
    ).toEqual(['React', 'Redux', 'TypeScript']);
  });

  test('handles aliases and ignores case', () => {
    expect(
      extractSkills('Skills: js, reactjs, nodejs, HTML, CSS, tailwindcss')
    ).toEqual(['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'TailwindCSS']);
  });

  test('returns empty array for no matches or empty input', () => {
    expect(extractSkills('No relevant skills here')).toEqual([]);
    expect(extractSkills('')).toEqual([]);
    expect(extractSkills(undefined as unknown as string)).toEqual([]);
  });
});
