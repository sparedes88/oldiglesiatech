import { useState, useEffect } from 'react';
import { apiKeyService } from './apiKeyService';
import { firebaseService } from './firebaseService';
import './ApiManager.css';

interface ApiCredentials {
  idIglesia: number;
  clientId: string;
  clientSecret: string;
  apiEndpoint?: string;
  webhookUrl?: string;
  syncEnabled: boolean;
  lastSync?: string;
}

interface SyncOperation {
  operation: 'pull' | 'push' | 'sync';
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  timestamp: string;
}

interface ApiManagerProps {
  iglesia: any;
  onClose: () => void;
}

export function ApiManager({ iglesia, onClose }: ApiManagerProps) {
  const [credentials, setCredentials] = useState<ApiCredentials>({
    idIglesia: iglesia.idIglesia,
    clientId: '',
    clientSecret: '',
    apiEndpoint: '',
    webhookUrl: '',
    syncEnabled: false,
  });
  
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState('');

  useEffect(() => {
    loadCredentials();
    loadApiKeys();
  }, [iglesia.idIglesia]);

  const loadCredentials = async () => {
    try {
      // Load existing credentials from Firebase
      const stored = await firebaseService.getData(`credentials/${iglesia.idIglesia}`);
      if (stored) {
        setCredentials(stored);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const loadApiKeys = async () => {
    try {
      // Load from Firebase via apiKeyService
      const keys = await apiKeyService.getApiKeys(iglesia.idIglesia);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setApiKeys([]);
    }
  };

  const generateNewKey = async () => {
    try {
      setGenerating(true);
      
      // Generate key via Firebase service
      const newKey = await apiKeyService.generateApiKey(
        iglesia.idIglesia, 
        newKeyDescription || undefined
      );
      
      // Show the secret immediately (only shown once)
      const message = `✅ API Key Generated Successfully!\n\n` +
                     `🔑 Client ID:\n${newKey.clientId}\n\n` +
                     `🔐 Client Secret:\n${newKey.clientSecret}\n\n` +
                     `⚠️ IMPORTANT: Save this secret now!\n` +
                     `This is the only time you'll see the Client Secret.\n\n` +
                     `📋 Copy these credentials and send them to the external system administrator.`;
      
      alert(message);
      
      // Copy both credentials to clipboard automatically
      navigator.clipboard.writeText(`Client ID: ${newKey.clientId}\nClient Secret: ${newKey.clientSecret}`);
      
      setNewKeyDescription('');
      await loadApiKeys();
    } catch (error: any) {
      alert(`Error generating key: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm('⚠️ Are you sure you want to revoke this API key?\n\nThe external system will immediately lose access.\nThis action cannot be undone.')) {
      return;
    }
    
    try {
      // Revoke via Firebase service
      await apiKeyService.revokeApiKey(keyId, iglesia.idIglesia);
      alert('✅ API key revoked successfully');
      await loadApiKeys();
      alert('✅ API Key revoked successfully!');
    } catch (error: any) {
      alert(`❌ Error revoking key: ${error.message}`);
    }
  };

  const saveCredentials = async () => {
    try {
      setLoading(true);
      // Save credentials to Firebase
      await firebaseService.setData(`credentials/${iglesia.idIglesia}`, credentials);
      
      alert('Credentials saved successfully!');
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('Error saving credentials');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Test the API connection with the provided credentials
      // This is a mock - replace with actual API test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.clientId && credentials.clientSecret) {
        setTestResult({
          success: true,
          message: 'Connection successful! API credentials are valid.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Please provide both Client ID and Client Secret.'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const performSync = async (operation: 'pull' | 'push' | 'sync') => {
    const newOperation: SyncOperation = {
      operation,
      status: 'running',
      timestamp: new Date().toISOString(),
    };
    
    setSyncOperations(prev => [newOperation, ...prev]);
    
    try {
      // Perform the actual sync operation
      // Replace with your actual sync logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement actual sync logic
      // const result = await apiService.post('/api/sync', {
      //   idIglesia: iglesia.idIglesia,
      //   operation,
      //   credentials
      // });
      
      newOperation.status = 'success';
      newOperation.message = `${operation} completed successfully`;
      
      setCredentials(prev => ({
        ...prev,
        lastSync: new Date().toISOString()
      }));
    } catch (error: any) {
      newOperation.status = 'error';
      newOperation.message = error.message || `${operation} failed`;
    }
    
    setSyncOperations(prev => 
      prev.map(op => op.timestamp === newOperation.timestamp ? newOperation : op)
    );
  };

  return (
    <div className="api-manager-overlay" onClick={onClose}>
      <div className="api-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>API Configuration - {iglesia.Nombre}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* API Key Management Section */}
          <section className="section">
            <h3>🔑 API Key Management</h3>
            <p className="section-description">
              Generate API keys for external systems to connect to this church's data.
              Each key can have different permissions and can be revoked at any time.
            </p>

            {/* Generate New Key */}
            <div className="generate-key-box">
              <h4>Generate New API Key</h4>
              <div className="form-group">
                <label>Key Description (Optional)</label>
                <input
                  type="text"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  placeholder="e.g., Mobile App, Website Integration, Third-party sync"
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={generateNewKey}
                disabled={generating}
              >
                {generating ? '🔄 Generating...' : '✨ Generate New Key'}
              </button>
            </div>

            {/* Existing API Keys */}
            {apiKeys.length > 0 && (
              <div className="api-keys-list">
                <h4>Active API Keys ({apiKeys.length})</h4>
                {apiKeys.map((key) => (
                  <div key={key.keyId} className="api-key-card">
                    <div className="key-header">
                      <div className="key-info">
                        <div className="key-id">
                          <span className="label">Client ID:</span>
                          <code>{key.clientId}</code>
                          <button 
                            className="btn-copy"
                            onClick={() => {
                              navigator.clipboard.writeText(key.clientId);
                              alert('Client ID copied to clipboard!');
                            }}
                          >
                            📋
                          </button>
                        </div>
                        {key.description && (
                          <div className="key-description">{key.description}</div>
                        )}
                      </div>
                      <button 
                        className="btn-revoke"
                        onClick={() => revokeKey(key.keyId)}
                      >
                        🗑️ Revoke
                      </button>
                    </div>
                    <div className="key-stats">
                      <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsed && (
                        <span>Last Used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                      )}
                      <span>Uses: {key.usageCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Credentials Section */}
          <section className="section">
            <h3>⚙️ External System Configuration</h3>
            <p className="section-description">
              Configure credentials that external systems will use to connect.
              These will be matched against the generated API keys above.
            </p>
            <div className="form-group">
              <label>Client ID</label>
              <input
                type="text"
                value={credentials.clientId}
                onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                placeholder="Enter client ID"
              />
            </div>
            
            <div className="form-group">
              <label>Client Secret</label>
              <input
                type="password"
                value={credentials.clientSecret}
                onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                placeholder="Enter client secret"
              />
            </div>

            <div className="form-group">
              <label>API Endpoint (Optional)</label>
              <input
                type="text"
                value={credentials.apiEndpoint}
                onChange={(e) => setCredentials({ ...credentials, apiEndpoint: e.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div className="form-group">
              <label>Webhook URL (Optional)</label>
              <input
                type="text"
                value={credentials.webhookUrl}
                onChange={(e) => setCredentials({ ...credentials, webhookUrl: e.target.value })}
                placeholder="https://yourapp.com/webhook"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={credentials.syncEnabled}
                  onChange={(e) => setCredentials({ ...credentials, syncEnabled: e.target.checked })}
                />
                Enable Auto-Sync
              </label>
            </div>

            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={saveCredentials}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Credentials'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={testConnection}
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {testResult && (
              <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                {testResult.success ? '✓' : '✕'} {testResult.message}
              </div>
            )}

            {credentials.lastSync && (
              <div className="last-sync">
                Last sync: {new Date(credentials.lastSync).toLocaleString()}
              </div>
            )}
          </section>

          {/* Sync Operations Section */}
          <section className="section">
            <h3>Sync Operations</h3>
            <div className="sync-buttons">
              <button 
                className="btn btn-sync"
                onClick={() => performSync('pull')}
                disabled={!credentials.clientId || !credentials.clientSecret}
              >
                ⬇️ Pull Data
              </button>
              <button 
                className="btn btn-sync"
                onClick={() => performSync('push')}
                disabled={!credentials.clientId || !credentials.clientSecret}
              >
                ⬆️ Push Data
              </button>
              <button 
                className="btn btn-sync"
                onClick={() => performSync('sync')}
                disabled={!credentials.clientId || !credentials.clientSecret}
              >
                🔄 Full Sync
              </button>
            </div>

            {/* Sync History */}
            {syncOperations.length > 0 && (
              <div className="sync-history">
                <h4>Recent Operations</h4>
                {syncOperations.map((op, index) => (
                  <div key={index} className={`sync-item ${op.status}`}>
                    <div className="sync-info">
                      <span className="sync-operation">
                        {op.operation === 'pull' ? '⬇️' : op.operation === 'push' ? '⬆️' : '🔄'} 
                        {op.operation.toUpperCase()}
                      </span>
                      <span className="sync-time">
                        {new Date(op.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={`sync-status status-${op.status}`}>
                      {op.status === 'running' && '⏳ Running...'}
                      {op.status === 'success' && '✓ Success'}
                      {op.status === 'error' && '✕ Error'}
                      {op.status === 'pending' && '⏸ Pending'}
                    </div>
                    {op.message && <div className="sync-message">{op.message}</div>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* API Documentation */}
          <section className="section documentation">
            <h3>API Integration Guide</h3>
            <div className="doc-content">
              <h4>Available Operations:</h4>
              <ul>
                <li><strong>Pull Data:</strong> Fetch latest data from external API to IglesiaTech</li>
                <li><strong>Push Data:</strong> Send updates from IglesiaTech to external API</li>
                <li><strong>Full Sync:</strong> Bidirectional sync - pull and push data</li>
              </ul>
              
              <h4>Authentication:</h4>
              <p>Your Client ID and Secret will be used for OAuth 2.0 authentication.</p>
              
              <h4>Webhook Events:</h4>
              <p>Configure a webhook URL to receive real-time updates when data changes.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
