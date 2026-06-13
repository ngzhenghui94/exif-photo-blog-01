jest.mock('@vercel/blob', () => ({
  copy: jest.fn(),
  del: jest.fn(),
  list: jest.fn(),
  put: jest.fn(),
}));

jest.mock('@vercel/blob/client', () => ({
  upload: jest.fn(),
}));

import {
  getIdFromStorageUrl,
  isUploadPathnameValid,
} from '@/services/storage';

describe('Storage', () => {
  it('accepts uniquely named upload paths', () => {
    expect(isUploadPathnameValid('upload-abc123def4567890.jpg')).toBeTruthy();
    expect(isUploadPathnameValid('upload-abc123def4567890.PNG')).toBeTruthy();
  });

  it('rejects non-unique upload paths', () => {
    expect(isUploadPathnameValid('upload.jpg')).toBeFalsy();
    expect(isUploadPathnameValid('folder/upload-abc123def4567890.jpg')).toBeFalsy();
  });

  it('extracts upload ids from storage urls', () => {
    expect(getIdFromStorageUrl(
      'https://example.com/upload-abc123def4567890.jpg',
    )).toBe('abc123def4567890');
  });
});
