/**
 * Bible Character Chat - Service Worker Cleanup
 * 
 * This script detects and unregisters all service workers to prevent
 * redirection issues caused by outdated service workers.
 * 
 * IMPORTANT: This script should be loaded early in the page lifecycle
 * to ensure service workers are cleaned up before they can intercept requests.
 */

(function() {
  // Configuration
  const DEBUG = true; // Set to true for verbose console logging
  
  // Statistics for reporting
  const stats = {
    detected: 0,
    unregistered: 0,
    failed: 0,
    errors: []
  };
  
  /**
   * Logs a message to the console if debugging is enabled
   */
  function log(message, type = 'info', data = null) {
    if (!DEBUG) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[SW Cleanup ${timestamp}]`;
    
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
      stats.detected = registrations.length;
      
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
              stats.unregistered++;
              log(`Successfully unregistered Service Worker for: ${registration.scope}`, 'success');
            } else {
              stats.failed++;
              const error = `Failed to unregister Service Worker for: ${registration.scope}`;
              log(error, 'error');
              stats.errors.push(error);
            }
            return { success, scope: registration.scope };
          } catch (err) {
            stats.failed++;
            const error = `Error unregistering Service Worker for: ${registration.scope}`;
            log(error, 'error', err);
            stats.errors.push(`${error}: ${err.message}`);
            return { success: false, scope: registration.scope, error: err };
          }
        })
      );
      
      // Report results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = stats.detected - successful;
      
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
    if (!('caches' in window)) {
      log('Cache API is not supported in this browser.', 'warn');
      return false;
    }
    
    try {
      const cacheNames = await window.caches.keys();
      
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
              log(`Successfully cleared cache: ${cacheName}`, 'success');
            } else {
              log(`Failed to clear cache: ${cacheName}`, 'error');
            }
            return { success, cacheName };
          } catch (err) {
            log(`Error clearing cache: ${cacheName}`, 'error', err);
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
      return false;
    }
  }
  
  /**
   * Creates a UI notification to inform the user of the cleanup
   */
  function showNotification(success) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.fontFamily = 'Arial, sans-serif';
    notification.style.fontSize = '14px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.transition = 'opacity 0.5s ease-in-out';
    
    if (success) {
      notification.style.backgroundColor = '#4CAF50';
      notification.style.color = 'white';
      notification.textContent = `✓ Service workers cleaned up (${stats.unregistered}/${stats.detected})`;
    } else {
      notification.style.backgroundColor = '#FFC107';
      notification.style.color = 'black';
      notification.textContent = `⚠ Service worker cleanup incomplete (${stats.unregistered}/${stats.detected})`;
    }
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.textContent = '×';
    closeButton.style.marginLeft = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.fontSize = '18px';
    closeButton.onclick = function() {
      document.body.removeChild(notification);
    };
    notification.appendChild(closeButton);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }
  
  /**
   * Performs the complete cleanup process
   */
  async function performCleanup() {
    log('Starting Service Worker cleanup...', 'info');
    
    // Unregister service workers
    const swResult = await unregisterAllServiceWorkers();
    
    // Clear caches
    const cacheResult = await clearAllCaches();
    
    // UI notification disabled to prevent user confusion
    // showNotification(swResult);
    
    // Expose stats for debugging
    window.__swCleanup = {
      stats,
      getStats: function() {
        return { ...stats };
      },
      rerun: performCleanup
    };
    
    return swResult || cacheResult;
  }
  
  // Start the cleanup process
  performCleanup().then(result => {
    log(`Service Worker cleanup ${result ? 'completed' : 'failed'}`, result ? 'success' : 'warn');
  });
})();
