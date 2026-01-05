import { firebaseService } from './firebaseService';

export interface ApiKey {
  keyId: string;
  clientId: string;
  clientSecret: string;
  idIglesia: number;
  description?: string;
  createdAt: number;
  isActive: boolean;
  permissions?: string[];
  usageCount: number;
  lastUsed?: number;
}

class ApiKeyService {
  private readonly basePath = 'apiKeys';

  /**
   * Generate a random secure string for secrets
   */
  private generateRandomSecret(length: number = 64): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate new API credentials for a church
   * Stores in Firebase: /apiKeys/{idIglesia}/{keyId}
   */
  async generateApiKey(idIglesia: number, description?: string): Promise<ApiKey> {
    try {
      console.log('Generating API key for iglesia:', idIglesia);
      
      const timestamp = Date.now();
      const keyId = `key_${timestamp}`;
      const clientId = `igtech_${idIglesia}_${timestamp}`;
      const clientSecret = this.generateRandomSecret(64);

      const apiKey: ApiKey = {
        keyId,
        clientId,
        clientSecret,
        idIglesia,
        description,
        createdAt: timestamp,
        isActive: true,
        permissions: ['read', 'write', 'sync'],
        usageCount: 0,
      };

      // Store in Firebase at /apiKeys/{idIglesia}/{keyId}
      await firebaseService.setData(`${this.basePath}/${idIglesia}/${keyId}`, apiKey);
      
      console.log('API key generated and stored in Firebase:', keyId);
      return apiKey;
    } catch (error: any) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  /**
   * Get all API keys for a specific church
   */
  async getApiKeys(idIglesia: number): Promise<ApiKey[]> {
    try {
      console.log('Fetching API keys for iglesia:', idIglesia);
      const data = await firebaseService.getData(`${this.basePath}/${idIglesia}`);
      
      if (!data) {
        return [];
      }

      // Convert object to array
      const keys = Object.values(data) as ApiKey[];
      return keys.filter(key => key.isActive);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  }

  /**
   * Revoke/Deactivate an API key
   */
  async revokeApiKey(keyId: string, idIglesia: number): Promise<void> {
    try {
      console.log('Revoking API key:', keyId);
      await firebaseService.updateData(`${this.basePath}/${idIglesia}/${keyId}`, {
        isActive: false,
        revokedAt: Date.now(),
      });
      console.log('API key revoked successfully');
    } catch (error: any) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  }

  /**
   * Validate API credentials (called by external system)
   * This searches all churches for matching credentials
   */
  async validateCredentials(clientId: string, clientSecret: string): Promise<{ valid: boolean; idIglesia?: number; permissions?: string[] }> {
    try {
      console.log('Validating credentials for clientId:', clientId);
      
      // Extract idIglesia from clientId (format: igtech_{idIglesia}_{timestamp})
      const parts = clientId.split('_');
      if (parts.length !== 3 || parts[0] !== 'igtech') {
        return { valid: false };
      }

      const idIglesia = parseInt(parts[1]);
      const keys = await this.getApiKeys(idIglesia);
      
      const matchingKey = keys.find(
        key => key.clientId === clientId && key.clientSecret === clientSecret && key.isActive
      );

      if (matchingKey) {
        // Update usage count
        await firebaseService.updateData(`${this.basePath}/${idIglesia}/${matchingKey.keyId}`, {
          usageCount: (matchingKey.usageCount || 0) + 1,
          lastUsed: Date.now(),
        });

        return {
          valid: true,
          idIglesia,
          permissions: matchingKey.permissions,
        };
      }

      return { valid: false };
    } catch (error: any) {
      console.error('Error validating credentials:', error);
      return { valid: false };
    }
  }

  /**
   * Get API key usage statistics
   */
  async getKeyUsage(idIglesia: number, keyId?: string): Promise<any> {
    try {
      if (keyId) {
        const key = await firebaseService.getData(`${this.basePath}/${idIglesia}/${keyId}`);
        return key ? { [keyId]: key } : null;
      } else {
        return await firebaseService.getData(`${this.basePath}/${idIglesia}`);
      }
    } catch (error: any) {
      console.error('Error fetching key usage:', error);
      throw error;
    }
  }

  /**
   * Update API key permissions
   */
  async updateKeyPermissions(keyId: string, idIglesia: number, permissions: string[]): Promise<void> {
    try {
      console.log('Updating permissions for key:', keyId);
      await firebaseService.updateData(`${this.basePath}/${idIglesia}/${keyId}`, {
        permissions,
      });
      console.log('Permissions updated successfully');
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  }

  /**
   * External API - Sync data (used by external systems with API key)
   * Stores sync history in Firebase
   */
  async syncData(clientId: string, clientSecret: string, operation: 'pull' | 'push' | 'sync', data?: any): Promise<any> {
    try {
      console.log('Executing sync operation:', operation);
      
      // First validate credentials
      const validation = await this.validateCredentials(clientId, clientSecret);
      if (!validation.valid || !validation.idIglesia) {
        throw new Error('Invalid credentials');
      }

      const idIglesia = validation.idIglesia;
      const syncId = `sync_${Date.now()}`;
      const startTime = Date.now();

      // Record sync start
      const syncRecord: SyncHistory = {
        syncId,
        idIglesia,
        operation,
        status: 'success',
        recordsAffected: 0,
        timestamp: startTime,
        duration: 0,
      };

      try {
        // TODO: Implement actual sync logic based on operation
        // This is where you'd interact with your database
        
        syncRecord.duration = Date.now() - startTime;
        syncRecord.recordsAffected = data?.length || 0;
        
        // Store sync history
        await firebaseService.setData(`syncHistory/${idIglesia}/${syncId}`, syncRecord);
        
        return { success: true, syncId, recordsAffected: syncRecord.recordsAffected };
      } catch (syncError: any) {
        syncRecord.status = 'error';
        syncRecord.errorMessage = syncError.message;
        syncRecord.duration = Date.now() - startTime;
        
        await firebaseService.setData(`syncHistory/${idIglesia}/${syncId}`, syncRecord);
        throw syncError;
      }
    } catch (error: any) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }

  /**
   * Get sync history for a church
   */
  async getSyncHistory(idIglesia: number, limit: number = 50): Promise<SyncHistory[]> {
    try {
      console.log('Fetching sync history for iglesia:', idIglesia);
      const data = await firebaseService.getData(`syncHistory/${idIglesia}`);
      
      if (!data) {
        return [];
      }

      // Convert object to array and sort by timestamp
      const history = Object.values(data) as SyncHistory[];
      return history
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error: any) {
      console.error('Error fetching sync history:', error);
      throw error;
    }
  }
}

export const apiKeyService = new ApiKeyService();

// Additional types
export interface ApiKeyUsage {
  date: string;
  requests: number;
  operations: {
    pull: number;
    push: number;
    sync: number;
  };
}

export interface SyncHistory {
  syncId: string;
  idIglesia: number;
  operation: 'pull' | 'push' | 'sync';
  status: 'success' | 'error' | 'partial';
  recordsAffected: number;
  timestamp: number;
  duration: number; // in ms
  errorMessage?: string;
}
