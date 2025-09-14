// shared/QBOSync.jsx - QuickBooks Online Sync Status Component
import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, CheckCircle, AlertTriangle, 
  XCircle, Clock, Wifi, WifiOff, Activity, 
  TrendingUp, ChevronDown, ChevronUp, Link2
} from 'lucide-react';

const QBOSync = ({ 
  position = 'fixed', // 'fixed', 'relative', 'inline'
  showDetails = true,
  onSync = null,
  autoSync = false,
  syncInterval = 300000, // 5 minutes default
  compact = false
}) => {
  const [syncStatus, setSyncStatus] = useState('checking'); // checking, connected, syncing, error, disconnected
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStats, setSyncStats] = useState({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    lastError: null,
    recordsSynced: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [nextSyncIn, setNextSyncIn] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState({
    companyName: null,
    realmId: null,
    tokenExpiry: null,
    environment: 'sandbox'
  });

  // Check QBO connection status on mount
  useEffect(() => {
    checkConnectionStatus();
    loadSyncHistory();
    
    // Set up auto-sync if enabled
    if (autoSync) {
      const interval = setInterval(() => {
        handleSync();
      }, syncInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoSync, syncInterval]);

  // Update countdown timer for next sync
  useEffect(() => {
    if (autoSync && lastSyncTime) {
      const updateCountdown = setInterval(() => {
        const nextSync = new Date(lastSyncTime).getTime() + syncInterval;
        const now = new Date().getTime();
        const timeLeft = Math.max(0, nextSync - now);
        setNextSyncIn(Math.floor(timeLeft / 1000));
      }, 1000);
      
      return () => clearInterval(updateCountdown);
    }
  }, [autoSync, lastSyncTime, syncInterval]);

  const checkConnectionStatus = async () => {
    try {
      // Check localStorage for connection info
      const qboToken = localStorage.getItem('qbo_access_token');
      const qboRealm = localStorage.getItem('qbo_realm_id');
      const tokenExpiry = localStorage.getItem('qbo_token_expiry');
      
      if (qboToken && qboRealm) {
        const expiryTime = parseInt(tokenExpiry);
        const isExpired = new Date().getTime() > expiryTime;
        
        if (isExpired) {
          setSyncStatus('error');
          setSyncStats(prev => ({
            ...prev,
            lastError: 'Token expired. Please reconnect.'
          }));
        } else {
          setSyncStatus('connected');
          setConnectionDetails({
            companyName: localStorage.getItem('qbo_company_name') || 'QuickBooks Company',
            realmId: qboRealm,
            tokenExpiry: new Date(expiryTime),
            environment: localStorage.getItem('qbo_environment') || 'sandbox'
          });
        }
      } else {
        setSyncStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking QBO status:', error);
      setSyncStatus('error');
    }
  };

  const loadSyncHistory = () => {
    const history = JSON.parse(localStorage.getItem('qbo_sync_log') || '[]');
    const lastSync = history[history.length - 1];
    
    if (lastSync) {
      setLastSyncTime(new Date(lastSync.syncDate));
      setSyncStats({
        totalSyncs: history.length,
        successfulSyncs: history.filter(s => s.status === 'success').length,
        failedSyncs: history.filter(s => s.status === 'failed').length,
        lastError: history.filter(s => s.status === 'failed')[0]?.errorMessage || null,
        recordsSynced: history.reduce((sum, s) => sum + (s.recordsSynced || 0), 0)
      });
    }
  };

  const handleSync = async () => {
    if (syncStatus === 'disconnected' || syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    setSyncProgress(0);
    
    try {
      // Simulate sync progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Call the onSync callback if provided
      if (onSync) {
        await onSync();
      } else {
        // Default sync simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      // Update sync log
      const syncLog = JSON.parse(localStorage.getItem('qbo_sync_log') || '[]');
      const newSyncEntry = {
        id: Date.now().toString(),
        syncDate: new Date().toISOString(),
        syncType: 'manual',
        status: 'success',
        recordsSynced: Math.floor(Math.random() * 50) + 10, // Mock data
        syncDurationMs: 2000
      };
      syncLog.push(newSyncEntry);
      localStorage.setItem('qbo_sync_log', JSON.stringify(syncLog));
      
      setSyncStatus('connected');
      setLastSyncTime(new Date());
      loadSyncHistory();
      
      setTimeout(() => setSyncProgress(0), 500);
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setSyncStats(prev => ({
        ...prev,
        lastError: error.message || 'Sync failed',
        failedSyncs: prev.failedSyncs + 1
      }));
      setSyncProgress(0);
    }
  };

  const handleConnect = () => {
    // In real implementation, this would initiate OAuth flow
    window.location.href = '/api/qbo/auth';
  };

  const handleDisconnect = () => {
    localStorage.removeItem('qbo_access_token');
    localStorage.removeItem('qbo_refresh_token');
    localStorage.removeItem('qbo_realm_id');
    localStorage.removeItem('qbo_company_name');
    setSyncStatus('disconnected');
    setConnectionDetails({
      companyName: null,
      realmId: null,
      tokenExpiry: null,
      environment: 'sandbox'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected': return 'text-green-400 bg-green-900/30 border-green-800';
      case 'syncing': return 'text-blue-400 bg-blue-900/30 border-blue-800';
      case 'error': return 'text-red-400 bg-red-900/30 border-red-800';
      case 'disconnected': return 'text-gray-400 bg-gray-900/30 border-gray-800';
      default: return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'connected': return 'Connected';
      case 'syncing': return `Syncing... ${syncProgress}%`;
      case 'error': return 'Error';
      case 'disconnected': return 'Disconnected';
      default: return 'Checking...';
    }
  };

  // Compact inline version
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </div>
        {syncStatus === 'connected' && (
          <button
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <RefreshCw className={`w-3 h-3 text-gray-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  // Full widget version
  const widgetContent = (
    <div className={`bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl shadow-xl overflow-hidden ${
      position === 'fixed' ? 'w-80' : 'w-full'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b border-slate-700 ${getStatusColor().replace('text-', 'bg-').replace('/30', '/20')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <span className="font-medium">QuickBooks Sync</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor().split(' ')[0]}`}>
              {getStatusText()}
            </span>
          </div>
          {syncStatus === 'connected' && (
            <button
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              Sync Now
            </button>
          )}
          {syncStatus === 'disconnected' && (
            <button
              onClick={handleConnect}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <Link2 className="w-3 h-3" />
              Connect
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {syncStatus === 'syncing' && (
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        )}

        {/* Last Sync Info */}
        {lastSyncTime && (
          <div className="text-xs text-gray-400 mt-2">
            Last sync: {lastSyncTime.toLocaleTimeString()}
            {autoSync && nextSyncIn !== null && (
              <span className="ml-2">• Next in: {formatTime(nextSyncIn)}</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="px-4 py-3 space-y-3">
          {/* Connection Info */}
          {syncStatus === 'connected' && connectionDetails.companyName && (
            <div className="space-y-2 pb-3 border-b border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Company:</span>
                <span className="text-gray-200">{connectionDetails.companyName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Environment:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  connectionDetails.environment === 'production' 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {connectionDetails.environment}
                </span>
              </div>
              {connectionDetails.tokenExpiry && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Token Expires:</span>
                  <span className="text-gray-200">
                    {connectionDetails.tokenExpiry.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sync Statistics */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Sync Statistics</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/50 rounded-lg p-2">
                <div className="text-xs text-gray-500">Total Syncs</div>
                <div className="text-lg font-bold text-gray-200">{syncStats.totalSyncs}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2">
                <div className="text-xs text-gray-500">Records</div>
                <div className="text-lg font-bold text-gray-200">{syncStats.recordsSynced}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2">
                <div className="text-xs text-gray-500">Success Rate</div>
                <div className="text-lg font-bold text-green-400">
                  {syncStats.totalSyncs > 0 
                    ? `${Math.round((syncStats.successfulSyncs / syncStats.totalSyncs) * 100)}%`
                    : '0%'
                  }
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2">
                <div className="text-xs text-gray-500">Failed</div>
                <div className="text-lg font-bold text-red-400">{syncStats.failedSyncs}</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {syncStats.lastError && (
            <div className="p-2 bg-red-900/20 border border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-red-400">Last Error</div>
                  <div className="text-xs text-red-300 mt-1">{syncStats.lastError}</div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Sync Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <span className="text-sm text-gray-400">Auto-sync</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoSync}
                onChange={() => {}} // Controlled by parent
                className="sr-only peer"
              />
              <div className={`w-9 h-5 rounded-full peer ${
                autoSync 
                  ? 'bg-blue-600' 
                  : 'bg-gray-600'
              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
            </label>
          </div>

          {/* Actions */}
          {syncStatus === 'connected' && (
            <div className="pt-2">
              <button
                onClick={handleDisconnect}
                className="w-full px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 text-sm rounded-lg transition-colors"
              >
                Disconnect QuickBooks
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Position variants
  if (position === 'fixed') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {widgetContent}
      </div>
    );
  }

  return widgetContent;
};

export default QBOSync;
