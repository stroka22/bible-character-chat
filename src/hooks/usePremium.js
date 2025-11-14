import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getActiveSubscription } from '../services/stripe-safe';

/**
 * Hook to determine if the current user has premium status
 * 
 * @returns {Object} Object containing premium status information
 * @property {boolean} isPremium - Whether the user has an active premium subscription
 * @property {boolean} loading - Whether subscription status is being fetched
 * @property {string|null} error - Error message if subscription check failed
 */
export function usePremium() {
  const { user, profile } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheckedUserId, setLastCheckedUserId] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    // Reset state when user changes
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      setError(null);
      setLastCheckedUserId(null);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const params = new URLSearchParams(window.location.search || '');
    const isCheckoutSuccess = params.get('checkout') === 'success';
    const forceRefresh = isCheckoutSuccess || lastCheckedUserId !== user.id;

    async function checkPremiumStatus() {
      setLoading(true);
      setError(null);

      try {
        const subscription = await getActiveSubscription(user.id);
        
        // Check if subscription exists and is active
        const isActive = subscription && 
          ['active', 'trialing'].includes(subscription.status) && 
          !subscription.cancelAtPeriodEnd;
        
        setIsPremium(isActive);
        setLastCheckedUserId(user.id);
        if (isActive) {
          try {
            // Cross-tab/tab-local signal that subscription updated
            localStorage.setItem('subscription:refresh', String(Date.now()));
            window.dispatchEvent(new Event('subscriptionUpdated'));
          } catch {}
        }
      } catch (err) {
        console.error('Error checking premium status:', err);
        
        // Handle Stripe configuration errors gracefully
        if (err.name === 'StripeConfigurationError') {
          console.warn('Stripe is not configured, defaulting to non-premium status');
          setIsPremium(false);
        } else {
          setError(err.message || 'Failed to check premium status');
          setIsPremium(false);
        }
      } finally {
        setLoading(false);
      }
    }

    // If admin has granted manual premium override, short-circuit to premium
    if (profile?.premium_override) {
      setIsPremium(true);
      setLastCheckedUserId(user.id);
      setLoading(false);
      return;
    }

    if (forceRefresh) {
      checkPremiumStatus();
    }

    // If we just returned from checkout success, poll briefly to catch webhook delay
    if (isCheckoutSuccess && !pollingRef.current) {
      let attempts = 0;
      pollingRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const subscription = await getActiveSubscription(user.id);
          const isActive = subscription && ['active', 'trialing'].includes(subscription.status) && !subscription.cancelAtPeriodEnd;
          if (isActive) {
            setIsPremium(true);
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            try {
              localStorage.setItem('subscription:refresh', String(Date.now()));
              window.dispatchEvent(new Event('subscriptionUpdated'));
            } catch {}
          }
        } catch {}
        if (attempts >= 10 && pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [user, lastCheckedUserId, profile?.premium_override]);

  // React to cross-tab and focus events to refresh status
  useEffect(() => {
    const triggerRefresh = () => {
      if (user) setLastCheckedUserId(null);
    };
    const onStorage = (ev) => {
      if (ev.key === 'subscription:refresh') triggerRefresh();
    };
    const onCustom = () => triggerRefresh();
    const onFocus = () => triggerRefresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('subscriptionUpdated', onCustom);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') triggerRefresh();
    });
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('subscriptionUpdated', onCustom);
      window.removeEventListener('focus', onFocus);
    };
  }, [user]);

  return { isPremium, loading, error };
}

export default usePremium;
