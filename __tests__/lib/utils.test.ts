/**
 * Unit tests for utility functions
 */

import {
  sanitise_input,
  sanitise_html,
  is_valid_zip_code,
  extract_zip_from_message,
  extract_suggested_question,
  strip_suggested_question,
  days_until,
} from '@/lib/utils';

describe('sanitise_input', () => {
  it('should trim whitespace', () => {
    expect(sanitise_input('  hello  ')).toBe('hello');
  });

  it('should collapse multiple spaces', () => {
    expect(sanitise_input('hello    world')).toBe('hello world');
  });

  it('should limit length', () => {
    const long_string = 'a'.repeat(3000);
    expect(sanitise_input(long_string, 100)).toHaveLength(100);
  });

  it('should remove control characters', () => {
    expect(sanitise_input('hello\x00world\x1F')).toBe('hello world');
  });

  it('should handle empty string', () => {
    expect(sanitise_input('')).toBe('');
  });
});

describe('sanitise_html', () => {
  it('should remove script tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    expect(sanitise_html(input)).toBe('Hello');
  });

  it('should remove iframe tags', () => {
    const input = '<iframe src="evil.com"></iframe>Hello';
    expect(sanitise_html(input)).toBe('Hello');
  });

  it('should remove event handlers', () => {
    const input = '<div onclick="alert()">Hello</div>';
    expect(sanitise_html(input)).not.toContain('onclick');
  });

  it('should remove javascript: protocol', () => {
    const input = '<a href="javascript:alert()">Click</a>';
    expect(sanitise_html(input)).not.toContain('javascript:');
  });
});

describe('is_valid_zip_code', () => {
  it('should accept valid 5-digit ZIP', () => {
    expect(is_valid_zip_code('12345')).toBe(true);
  });

  it('should reject 4-digit ZIP', () => {
    expect(is_valid_zip_code('1234')).toBe(false);
  });

  it('should reject 6-digit ZIP', () => {
    expect(is_valid_zip_code('123456')).toBe(false);
  });

  it('should reject non-numeric ZIP', () => {
    expect(is_valid_zip_code('abcde')).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(is_valid_zip_code(' 12345 ')).toBe(true);
  });
});

describe('extract_zip_from_message', () => {
  it('should extract ZIP from message', () => {
    expect(extract_zip_from_message('I live in 90210')).toBe('90210');
  });

  it('should return null if no ZIP', () => {
    expect(extract_zip_from_message('No ZIP here')).toBeNull();
  });

  it('should extract first ZIP if multiple', () => {
    expect(extract_zip_from_message('90210 or 10001')).toBe('90210');
  });
});

describe('extract_suggested_question', () => {
  it('should extract suggested question', () => {
    const content = 'Some response\n**Suggested question:** What is next?';
    expect(extract_suggested_question(content)).toEqual(['What is next?']);
  });

  it('should return empty array if no suggestion', () => {
    expect(extract_suggested_question('No suggestion here')).toEqual([]);
  });
});

describe('strip_suggested_question', () => {
  it('should remove suggested question line', () => {
    const content = 'Response text\n**Suggested question:** What next?';
    expect(strip_suggested_question(content)).toBe('Response text');
  });

  it('should not modify content without suggestion', () => {
    const content = 'Just response text';
    expect(strip_suggested_question(content)).toBe(content);
  });
});

describe('days_until', () => {
  it('should calculate days until future date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date_str = tomorrow.toISOString().split('T')[0];
    expect(days_until(date_str)).toBe(1);
  });

  it('should return negative for past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date_str = yesterday.toISOString().split('T')[0];
    expect(days_until(date_str)).toBeLessThan(0);
  });
});
