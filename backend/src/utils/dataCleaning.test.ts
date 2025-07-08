import {
  cleanWhitespace,
  removeSpecialCharacters,
  stripHtmlTags,
  normalizeCase,
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
});
