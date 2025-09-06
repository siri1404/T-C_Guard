import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsentManager } from '../services/ConsentManager';
import { EncryptionService } from '../services/EncryptionService';

// Mock EncryptionService
vi.mock('../services/EncryptionService');

describe('ConsentManager', () => {
  let consentManager: ConsentManager;
  let mockEncryptionService: any;

  beforeEach(() => {
    mockEncryptionService = {
      secureStore: vi.fn(),
      secureRetrieve: vi.fn(),
      clearAllData: vi.fn(),
    };
    
    vi.mocked(EncryptionService.getInstance).mockReturnValue(mockEncryptionService);
    consentManager = ConsentManager.getInstance();
  });

  describe('hasValidConsent', () => {
    it('should return false when no consent exists', async () => {
      mockEncryptionService.secureRetrieve.mockResolvedValue(null);
      
      const result = await consentManager.hasValidConsent();
      
      expect(result).toBe(false);
    });

    it('should return true for valid recent consent', async () => {
      const validConsent = {
        dataCollection: true,
        analytics: false,
        storage: true,
        consentDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      mockEncryptionService.secureRetrieve.mockResolvedValue(validConsent);
      
      const result = await consentManager.hasValidConsent();
      
      expect(result).toBe(true);
    });

    it('should return false for expired consent', async () => {
      const expiredConsent = {
        dataCollection: true,
        analytics: false,
        storage: true,
        consentDate: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString(), // 366 days ago
        version: '1.0.0'
      };
      
      mockEncryptionService.secureRetrieve.mockResolvedValue(expiredConsent);
      
      const result = await consentManager.hasValidConsent();
      
      expect(result).toBe(false);
    });
  });

  describe('saveConsent', () => {
    it('should save consent using encryption service', async () => {
      const consent = {
        dataCollection: true,
        analytics: true,
        storage: true,
        consentDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      await consentManager.saveConsent(consent);
      
      expect(mockEncryptionService.secureStore).toHaveBeenCalledWith('userConsent', consent);
    });
  });

  describe('revokeConsent', () => {
    it('should clear all data when consent is revoked', async () => {
      await consentManager.revokeConsent();
      
      expect(mockEncryptionService.clearAllData).toHaveBeenCalled();
    });
  });
});