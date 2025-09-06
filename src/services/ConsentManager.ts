import { EncryptionService } from './EncryptionService';

export interface UserConsent {
  dataCollection: boolean;
  analytics: boolean;
  storage: boolean;
  consentDate: string;
  version: string;
}

export interface DataRetentionSettings {
  retentionDays: number;
  autoDelete: boolean;
  lastCleanup: string;
}

export class ConsentManager {
  private static instance: ConsentManager;
  private encryptionService: EncryptionService;
  private readonly CONSENT_VERSION = '1.0.0';
  private readonly DEFAULT_RETENTION_DAYS = 30;

  private constructor() {
    this.encryptionService = EncryptionService.getInstance();
  }

  static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  async hasValidConsent(): Promise<boolean> {
    try {
      const consent = await this.getConsent();
      if (!consent) return false;

      // Check if consent is still valid (not expired)
      const consentDate = new Date(consent.consentDate);
      const now = new Date();
      const daysSinceConsent = (now.getTime() - consentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSinceConsent <= 365 && consent.version === this.CONSENT_VERSION;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }

  async requestConsent(): Promise<UserConsent | null> {
    return new Promise((resolve) => {
      // Create consent dialog
      const dialog = this.createConsentDialog();
      document.body.appendChild(dialog);

      const handleConsent = (granted: boolean, options: Partial<UserConsent> = {}) => {
        document.body.removeChild(dialog);
        
        if (granted) {
          const consent: UserConsent = {
            dataCollection: options.dataCollection ?? true,
            analytics: options.analytics ?? false,
            storage: options.storage ?? true,
            consentDate: new Date().toISOString(),
            version: this.CONSENT_VERSION
          };
          
          this.saveConsent(consent);
          resolve(consent);
        } else {
          resolve(null);
        }
      };

      // Add event listeners to dialog buttons
      dialog.querySelector('#consent-accept')?.addEventListener('click', () => {
        const analytics = (dialog.querySelector('#analytics-consent') as HTMLInputElement)?.checked ?? false;
        handleConsent(true, { analytics });
      });

      dialog.querySelector('#consent-decline')?.addEventListener('click', () => {
        handleConsent(false);
      });
    });
  }

  private createConsentDialog(): HTMLElement {
    const dialog = document.createElement('div');
    dialog.id = 'tc-guard-consent-dialog';
    dialog.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      ">
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          margin: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
          <h2 style="margin: 0 0 16px 0; color: #1a1a1a;">Privacy & Data Consent</h2>
          <p style="margin: 0 0 16px 0; color: #666; line-height: 1.5;">
            T&C Guard analyzes privacy policies to help protect your privacy. To provide this service, we need your consent for:
          </p>
          <ul style="margin: 0 0 16px 0; color: #666; line-height: 1.5;">
            <li>Analyzing policy content you visit (processed locally)</li>
            <li>Storing analysis results securely on your device</li>
            <li>Remembering your preferences</li>
          </ul>
          <label style="display: flex; align-items: center; margin: 16px 0; color: #666;">
            <input type="checkbox" id="analytics-consent" style="margin-right: 8px;">
            Optional: Anonymous usage analytics to improve the extension
          </label>
          <p style="margin: 16px 0; font-size: 12px; color: #999;">
            You can change these preferences anytime in the extension settings. 
            Data is encrypted and stored only on your device.
          </p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="consent-decline" style="
              padding: 8px 16px;
              border: 1px solid #ddd;
              background: white;
              border-radius: 6px;
              cursor: pointer;
            ">Decline</button>
            <button id="consent-accept" style="
              padding: 8px 16px;
              border: none;
              background: #14B8A6;
              color: white;
              border-radius: 6px;
              cursor: pointer;
            ">Accept</button>
          </div>
        </div>
      </div>
    `;
    return dialog;
  }

  async getConsent(): Promise<UserConsent | null> {
    try {
      return await this.encryptionService.secureRetrieve('userConsent');
    } catch (error) {
      console.error('Error retrieving consent:', error);
      return null;
    }
  }

  async saveConsent(consent: UserConsent): Promise<void> {
    try {
      await this.encryptionService.secureStore('userConsent', consent);
    } catch (error) {
      console.error('Error saving consent:', error);
      throw new Error('Failed to save consent preferences');
    }
  }

  async revokeConsent(): Promise<void> {
    try {
      await this.encryptionService.clearAllData();
    } catch (error) {
      console.error('Error revoking consent:', error);
      throw new Error('Failed to revoke consent');
    }
  }

  async getDataRetentionSettings(): Promise<DataRetentionSettings> {
    try {
      const settings = await this.encryptionService.secureRetrieve('dataRetention');
      return settings || {
        retentionDays: this.DEFAULT_RETENTION_DAYS,
        autoDelete: true,
        lastCleanup: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting retention settings:', error);
      return {
        retentionDays: this.DEFAULT_RETENTION_DAYS,
        autoDelete: true,
        lastCleanup: new Date().toISOString()
      };
    }
  }

  async cleanupExpiredData(): Promise<void> {
    try {
      const settings = await this.getDataRetentionSettings();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);

      // Get all stored analysis results
      const results = await this.encryptionService.secureRetrieve('analysisResults') || {};
      const cleanedResults: Record<string, any> = {};

      // Keep only recent results
      for (const [key, result] of Object.entries(results)) {
        if (result.retrievedAt && new Date(result.retrievedAt) > cutoffDate) {
          cleanedResults[key] = result;
        }
      }

      // Save cleaned results
      await this.encryptionService.secureStore('analysisResults', cleanedResults);
      
      // Update last cleanup time
      settings.lastCleanup = new Date().toISOString();
      await this.encryptionService.secureStore('dataRetention', settings);
      
      console.log(`Cleaned up expired data. Kept ${Object.keys(cleanedResults).length} recent results.`);
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  }

  async exportUserData(): Promise<string> {
    try {
      const consent = await this.getConsent();
      const results = await this.encryptionService.secureRetrieve('analysisResults') || {};
      const settings = await this.getDataRetentionSettings();

      const exportData = {
        consent,
        analysisResults: results,
        dataRetentionSettings: settings,
        exportDate: new Date().toISOString(),
        version: this.CONSENT_VERSION
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }
}