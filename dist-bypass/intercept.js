/**
 * Bible Character Chat - Network Request Interceptor
 * 
 * This script intercepts and blocks all requests to example.com domains
 * to prevent 404 errors and improve application performance.
 * 
 * IMPORTANT: This script must be loaded in the <head> before any other scripts
 * to ensure it can intercept all requests.
 *
 * NOTE (2024-06-XX): This modified version NO LONGER blocks the Vite development
 * server running on localhost:5173 so that local development can proceed
 * without being redirected.
 */

(function() {
  // Configuration
  const DEBUG = true; // Set to false to disable console logging
  const BLOCKED_DOMAINS = [
    'example.com',
    '.example.com'
  ];
  
  // Statistics for debugging
  const stats = {
    totalBlocked: 0,
    byType: {
      fetch: 0,
      xhr: 0,
      image: 0,
      script: 0,
      link: 0,
      other: 0
    },
    blockedUrls: []
  };
  
  /**
   * Logs a message to the console if debugging is enabled
   */
  function log(message, type = 'info', data = null) {
    if (!DEBUG) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[Interceptor ${timestamp}]`;
    
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
      case 'block':
        console.log(`%c${prefix} ${message}`, 'color: red; font-weight: bold;', data || '');
        break;
      default:
        console.log(prefix, message, data || '');
    }
  }
  
  /**
   * Checks if a URL should be blocked
   */
  function shouldBlockUrl(url) {
    try {
      // Handle relative URLs by prepending the origin
      const fullUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href;
      const urlObj = new URL(fullUrl);
      
      // Check if the hostname matches any blocked domain
      return BLOCKED_DOMAINS.some(domain => {
        if (domain.startsWith('.')) {
          // Handle subdomains with wildcard notation (.example.com)
          return urlObj.hostname.endsWith(domain);
        }
        return urlObj.hostname === domain;
      });
    } catch (e) {
      // If URL parsing fails, log the error and allow the request
      log(`Error parsing URL: ${url}`, 'error', e);
      return false;
    }
  }
  
  /**
   * Tracks a blocked request in our stats
   */
  function trackBlockedRequest(url, type) {
    stats.totalBlocked++;
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    // Store the URL and stack trace for debugging
    const stack = new Error().stack;
    stats.blockedUrls.push({
      timestamp: new Date().toISOString(),
      url,
      type,
      stack: stack ? stack.split('\n').slice(2).join('\n') : 'No stack trace'
    });
    
    // Log the blocked request
    log(`Blocked ${type} request to: ${url}`, 'block');
    
    // Keep only the last 100 URLs to avoid memory leaks
    if (stats.blockedUrls.length > 100) {
      stats.blockedUrls.shift();
    }
  }
  
  /**
   * Generates a fallback avatar URL
   */
  function generateFallbackAvatar(name = 'User') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }
  
  // -------------------------------------------------------------------------
  // Patch browser APIs to intercept network requests
  // -------------------------------------------------------------------------
  
  // 1. Patch the fetch API
  log('Patching fetch API...', 'info');
  const originalFetch = window.fetch;
  window.fetch = function(resource, options) {
    const url = resource instanceof Request ? resource.url : resource;
    
    if (shouldBlockUrl(url)) {
      trackBlockedRequest(url, 'fetch');
      return Promise.reject(new Error(`Blocked fetch request to: ${url}`));
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  // 2. Patch XMLHttpRequest
  log('Patching XMLHttpRequest...', 'info');
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (shouldBlockUrl(url)) {
      trackBlockedRequest(url, 'xhr');
      this._blockedUrl = url;
      
      // We'll let the open call proceed but make send a no-op for this request
      this.send = function() {
        this.abort();
        if (typeof this.onerror === 'function') {
          const error = new ErrorEvent('error', {
            message: `Blocked XHR request to: ${url}`
          });
          this.onerror(error);
        }
      };
      
      return originalXhrOpen.apply(this, [method, 'about:blank', ...rest]);
    }
    
    return originalXhrOpen.apply(this, arguments);
  };
  
  // 3. Patch Image.prototype.src
  log('Patching Image.prototype.src...', 'info');
  const originalImageSrcDescriptor = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
  
  Object.defineProperty(Image.prototype, 'src', {
    get: function() {
      return originalImageSrcDescriptor.get.call(this);
    },
    set: function(url) {
      if (shouldBlockUrl(url)) {
        trackBlockedRequest(url, 'image');
        
        // Generate a fallback avatar using the alt text or a default name
        const fallbackUrl = generateFallbackAvatar(this.alt || 'User');
        log(`Using fallback for blocked image: ${fallbackUrl}`, 'info');
        
        // Set the fallback URL instead
        return originalImageSrcDescriptor.set.call(this, fallbackUrl);
      }
      
      return originalImageSrcDescriptor.set.call(this, url);
    },
    configurable: true
  });
  
  // 4. Patch createElement to intercept script and link tags
  log('Patching document.createElement...', 'info');
  const originalCreateElement = document.createElement;
  
  document.createElement = function(tagName, options) {
    const element = originalCreateElement.call(document, tagName, options);
    
    if (tagName.toLowerCase() === 'script') {
      // Watch for script src changes
      const originalScriptSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      
      Object.defineProperty(element, 'src', {
        get: function() {
          return originalScriptSrcDescriptor.get.call(this);
        },
        set: function(url) {
          if (shouldBlockUrl(url)) {
            trackBlockedRequest(url, 'script');
            return; // Don't set the src
          }
          
          return originalScriptSrcDescriptor.set.call(this, url);
        },
        configurable: true
      });
    } else if (tagName.toLowerCase() === 'link') {
      // Watch for link href changes
      const originalLinkHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
      
      Object.defineProperty(element, 'href', {
        get: function() {
          return originalLinkHrefDescriptor.get.call(this);
        },
        set: function(url) {
          if (shouldBlockUrl(url)) {
            trackBlockedRequest(url, 'link');
            return; // Don't set the href
          }
          
          return originalLinkHrefDescriptor.set.call(this, url);
        },
        configurable: true
      });
    }
    
    return element;
  };
  
  // 5. Add a global error handler to catch any network errors
  window.addEventListener('error', function(event) {
    // Only handle network errors
    if (event && event.target && (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT')) {
      const url = event.target.src || event.target.href;
      
      if (url && shouldBlockUrl(url)) {
        // Prevent the error from propagating
        event.preventDefault();
        event.stopPropagation();
        
        trackBlockedRequest(url, 'other');
        
        // If it's an image, try to set a fallback
        if (event.target.tagName === 'IMG') {
          event.target.src = generateFallbackAvatar(event.target.alt || 'User');
        }
        
        return true;
      }
    }
  }, true);
  
  // 6. Expose stats and utilities for debugging
  window.__interceptor = {
    stats,
    getStats: function() {
      return {
        ...stats,
        blockedUrls: [...stats.blockedUrls]
      };
    },
    getBlockedUrls: function() {
      return [...stats.blockedUrls];
    },
    clearStats: function() {
      stats.totalBlocked = 0;
      Object.keys(stats.byType).forEach(key => {
        stats.byType[key] = 0;
      });
      stats.blockedUrls = [];
      log('Interceptor stats cleared', 'success');
    }
  };
  
  log('Network interceptor initialized successfully', 'success');
})();
