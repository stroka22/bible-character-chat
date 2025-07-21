/**
 * Bible Character Chat - Browser Cache & Service Worker Fix
 * 
 * This script helps users resolve issues caused by stale browser caches
 * and problematic service workers. It will:
 * 
 * 1. Detect and unregister all service workers
 * 2. Clear browser caches when possible
 * 3. Show a user-friendly notification
 * 4. Provide a button to reload the page
 * 
 * Usage: Include this script in your HTML or load it dynamically
 * <script src="/fix-browser-cache.js"></script>
 */

(function() {
  // Configuration
  const config = {
    debug: true,                  // Enable console logging
    autoUnregister: true,         // Auto-unregister service workers
    autoClearCache: true,         // Auto-clear caches
    showNotification: true,       // Show UI notification
    notificationDuration: 10000,  // How long to show notification (ms)
    reloadAfterClearing: false    // Auto-reload page after clearing
  };

  // Statistics for reporting
  const stats = {
    serviceWorkers: {
      detected: 0,
      unregistered: 0,
      failed: 0
    },
    caches: {
      detected: 0,
      cleared: 0,
      failed: 0
    },
    errors: []
  };

  /**
   * Logs a message to the console if debugging is enabled
   */
  function log(message, type = 'info', data = null) {
    if (!config.debug) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[Cache Fix ${timestamp}]`;
    
    switch (type) {
      case 'error':
        console.error(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'success':
        console.log(`%c${prefix} ${message}`, 'color: green; font-weight: bold;', data || '');
        break;
      default:
        console.log(prefix, message, data || '');
    }
  }
  
  /**
   * Checks if service workers are supported
   */
  function isServiceWorkerSupported() {
    return 'serviceWorker' in navigator;
  }
  
  /**
   * Checks if Cache API is supported
   */
  function isCacheApiSupported() {
    return 'caches' in window;
  }

  /**
   * Unregisters all service workers
   */
  async function unregisterAllServiceWorkers() {
    if (!isServiceWorkerSupported()) {
      log('Service Workers are not supported in this browser.', 'warn');
      return false;
    }
    
    try {
      // Get all service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      stats.serviceWorkers.detected = registrations.length;
      
      if (registrations.length === 0) {
        log('No Service Workers detected.', 'success');
        return true;
      }
      
      log(`Found ${registrations.length} Service Worker registrations. Unregistering...`, 'info');
      
      // Unregister each service worker
      const results = await Promise.allSettled(
        registrations.map(async registration => {
          try {
            const success = await registration.unregister();
            if (success) {
              stats.serviceWorkers.unregistered++;
              log(`Successfully unregistered Service Worker for: ${registration.scope}`, 'success');
            } else {
              stats.serviceWorkers.failed++;
              const error = `Failed to unregister Service Worker for: ${registration.scope}`;
              log(error, 'error');
              stats.errors.push(error);
            }
            return { success, scope: registration.scope };
          } catch (err) {
            stats.serviceWorkers.failed++;
            const error = `Error unregistering Service Worker for: ${registration.scope}`;
            log(error, 'error', err);
            stats.errors.push(`${error}: ${err.message}`);
            return { success: false, scope: registration.scope, error: err };
          }
        })
      );
      
      // Report results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = stats.serviceWorkers.detected - successful;
      
      if (failed === 0) {
        log(`Successfully unregistered all ${successful} Service Workers.`, 'success');
      } else {
        log(`Unregistered ${successful} Service Workers, but ${failed} failed.`, 'warn');
      }
      
      return successful > 0;
    } catch (err) {
      log('Error accessing Service Worker registrations', 'error', err);
      stats.errors.push(`Error accessing Service Worker registrations: ${err.message}`);
      return false;
    }
  }
  
  /**
   * Clears all caches
   */
  async function clearAllCaches() {
    if (!isCacheApiSupported()) {
      log('Cache API is not supported in this browser.', 'warn');
      return false;
    }
    
    try {
      const cacheNames = await window.caches.keys();
      stats.caches.detected = cacheNames.length;
      
      if (cacheNames.length === 0) {
        log('No caches detected.', 'success');
        return true;
      }
      
      log(`Found ${cacheNames.length} caches. Clearing...`, 'info');
      
      // Delete each cache
      const results = await Promise.allSettled(
        cacheNames.map(async cacheName => {
          try {
            const success = await window.caches.delete(cacheName);
            if (success) {
              stats.caches.cleared++;
              log(`Successfully cleared cache: ${cacheName}`, 'success');
            } else {
              stats.caches.failed++;
              const error = `Failed to clear cache: ${cacheName}`;
              log(error, 'error');
              stats.errors.push(error);
            }
            return { success, cacheName };
          } catch (err) {
            stats.caches.failed++;
            const error = `Error clearing cache: ${cacheName}`;
            log(error, 'error', err);
            stats.errors.push(`${error}: ${err.message}`);
            return { success: false, cacheName, error: err };
          }
        })
      );
      
      // Report results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = cacheNames.length - successful;
      
      if (failed === 0) {
        log(`Successfully cleared all ${successful} caches.`, 'success');
      } else {
        log(`Cleared ${successful} caches, but ${failed} failed.`, 'warn');
      }
      
      return successful > 0;
    } catch (err) {
      log('Error accessing caches', 'error', err);
      stats.errors.push(`Error accessing caches: ${err.message}`);
      return false;
    }
  }

  /**
   * Attempts to clear local storage and session storage
   */
  function clearStorages() {
    try {
      if (window.localStorage) {
        log('Clearing localStorage...', 'info');
        window.localStorage.clear();
        log('localStorage cleared successfully', 'success');
      }
      
      if (window.sessionStorage) {
        log('Clearing sessionStorage...', 'info');
        window.sessionStorage.clear();
        log('sessionStorage cleared successfully', 'success');
      }
      
      return true;
    } catch (err) {
      log('Error clearing storages', 'error', err);
      stats.errors.push(`Error clearing storages: ${err.message}`);
      return false;
    }
  }
  
  /**
   * Creates a UI notification to inform the user of the cleanup
   */
  function showNotification(success) {
    if (!config.showNotification) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'cache-fix-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.fontFamily = 'Arial, sans-serif';
    notification.style.fontSize = '14px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.transition = 'opacity 0.5s ease-in-out';
    notification.style.maxWidth = '350px';
    
    if (success) {
      notification.style.backgroundColor = '#4CAF50';
      notification.style.color = 'white';
      notification.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">✓ Browser Cache Cleared</div>
        <div style="margin-bottom: 10px; font-size: 12px;">
          Service workers: ${stats.serviceWorkers.unregistered}/${stats.serviceWorkers.detected} unregistered<br>
          Caches: ${stats.caches.cleared}/${stats.caches.detected} cleared
        </div>
      `;
    } else {
      notification.style.backgroundColor = '#FFC107';
      notification.style.color = 'black';
      notification.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">⚠ Cache cleanup incomplete</div>
        <div style="margin-bottom: 10px; font-size: 12px;">
          Some items could not be cleared. Try using browser settings to clear cache.
        </div>
      `;
    }
    
    // Add reload button
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Reload Page';
    reloadButton.style.backgroundColor = success ? '#388E3C' : '#F57F17';
    reloadButton.style.color = success ? 'white' : 'black';
    reloadButton.style.border = 'none';
    reloadButton.style.padding = '8px 12px';
    reloadButton.style.borderRadius = '3px';
    reloadButton.style.cursor = 'pointer';
    reloadButton.style.marginRight = '10px';
    reloadButton.onclick = function() {
      window.location.reload(true); // true = force reload from server
    };
    notification.appendChild(reloadButton);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Dismiss';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = success ? '1px solid white' : '1px solid black';
    closeButton.style.color = success ? 'white' : 'black';
    closeButton.style.padding = '8px 12px';
    closeButton.style.borderRadius = '3px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function() {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 500);
      }
    };
    notification.appendChild(closeButton);
    
    // Remove any existing notification
    const existingNotification = document.getElementById('cache-fix-notification');
    if (existingNotification && existingNotification.parentNode) {
      existingNotification.parentNode.removeChild(existingNotification);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-hide after specified duration
    if (config.notificationDuration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
          }, 500);
        }
      }, config.notificationDuration);
    }
  }
  
  /**
   * Performs the complete cleanup process
   */
  async function performCleanup() {
    log('Starting browser cache and Service Worker cleanup...', 'info');
    
    // Unregister service workers
    let swResult = false;
    if (config.autoUnregister) {
      swResult = await unregisterAllServiceWorkers();
    } else {
      log('Service Worker unregistration skipped (disabled in config)', 'info');
    }
    
    // Clear caches
    let cacheResult = false;
    if (config.autoClearCache) {
      cacheResult = await clearAllCaches();
      clearStorages();
    } else {
      log('Cache clearing skipped (disabled in config)', 'info');
    }
    
    // Show notification once DOM is ready
    const showNotificationWhenReady = () => {
      showNotification(swResult || cacheResult);
      
      // Auto-reload if configured
      if (config.reloadAfterClearing) {
        log('Auto-reloading page...', 'info');
        setTimeout(() => window.location.reload(true), 1000);
      }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showNotificationWhenReady);
    } else {
      showNotificationWhenReady();
    }
    
    // Expose stats and methods for debugging and manual triggering
    window.cacheFix = {
      stats: { ...stats },
      getStats: function() {
        return { ...stats };
      },
      clearCaches: clearAllCaches,
      unregisterServiceWorkers: unregisterAllServiceWorkers,
      reload: function() {
        window.location.reload(true);
      },
      rerun: performCleanup
    };
    
    return swResult || cacheResult;
  }
  
  // Start the cleanup process
  performCleanup().then(result => {
    log(`Cache and Service Worker cleanup ${result ? 'completed' : 'failed'}`, result ? 'success' : 'warn');
  });
  
  // Add a global function to manually trigger cleanup
  window.fixBrowserCache = performCleanup;
})();
