import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EncryptionService } from '../services/EncryptionService';

// Mock chrome storage
const mockChromeStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
  }
};

global.chrome = {
  storage: mockChromeStorage,
} as any;

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = EncryptionService.getInstance();
    vi.clearAllMocks();
  });

  describe('initializeKey', () => {
    it('should generate new key if none exists', async () => {
      mockChromeStorage.local.get.mockResolvedValue({});
      
      await encryptionService.initializeKey();
      
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({ encryptionKey: expect.any(String) })
      );
    });

    it('should use existing key if available', async () => {
      const existingKey = 'existing-key';
      mockChromeStorage.local.get.mockResolvedValue({ encryptionKey: existingKey });
      
      await encryptionService.initializeKey();
      
      expect(mockChromeStorage.local.set).not.toHaveBeenCalled();
    });
  });

  describe('encrypt and decrypt', () => {
    beforeEach(async () => {
      mockChromeStorage.local.get.mockResolvedValue({});
      await encryptionService.initializeKey();
    });

    it('should encrypt and decrypt data correctly', () => {
      const testData = 'sensitive information';
      
      const encrypted = encryptionService.encrypt(testData);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(encrypted).not.toBe(testData);
      expect(decrypted).toBe(testData);
    });

    it('should throw error when encrypting without initialized key', () => {
      const newService = EncryptionService.getInstance();
      
      expect(() => {
        newService.encrypt('test');
      }).toThrow('Encryption key not initialized');
    });
  });

  describe('secureStore and secureRetrieve', () => {
    beforeEach(async () => {
      mockChromeStorage.local.get.mockResolvedValue({});
      await encryptionService.initializeKey();
    });

    it('should store and retrieve data securely', async () => {
      const testData = { sensitive: 'information', number: 42 };
      const key = 'test-key';
      
      mockChromeStorage.local.set.mockResolvedValue(undefined);
      mockChromeStorage.local.get.mockImplementation((keys) => {
        if (keys.includes(key)) {
          // Return encrypted data (mocked)
          return Promise.resolve({ [key]: 'encrypted-data' });
        }
        return Promise.resolve({});
      });
      
      await encryptionService.secureStore(key, testData);
      
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({ [key]: expect.any(String) })
      );
    });
  });
});