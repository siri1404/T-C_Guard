import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  async initializeKey(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get(['encryptionKey']);
      if (stored.encryptionKey) {
        this.encryptionKey = stored.encryptionKey;
      } else {
        // Generate new key
        this.encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
        await chrome.storage.local.set({ encryptionKey: this.encryptionKey });
      }
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  encrypt(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Decryption resulted in empty string');
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  async secureStore(key: string, data: any): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      const encrypted = this.encrypt(serialized);
      await chrome.storage.local.set({ [key]: encrypted });
    } catch (error) {
      console.error('Secure storage failed:', error);
      throw new Error('Failed to securely store data');
    }
  }

  async secureRetrieve(key: string): Promise<any> {
    try {
      const stored = await chrome.storage.local.get([key]);
      if (!stored[key]) {
        return null;
      }
      
      const decrypted = this.decrypt(stored[key]);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Secure retrieval failed:', error);
      return null;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      this.encryptionKey = null;
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('Data clearing failed');
    }
  }
}