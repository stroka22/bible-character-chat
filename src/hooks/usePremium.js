import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getActiveSubscription } from '../services/stripe';

/**
 * Hook to determine if the current user has premium status
 * 
 * @returns {Object} Object containing premium status information
 * @property {boolean} isPremium - Whether the user has an active premium subscription
 * @property {boolean} loading - Whether subscription status is being fetched
 * @property {string|null} error - Error message if subscription check failed
 */
export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheckedUserId, setLastCheckedUserId] = useState(null);

  useEffect(() => {
    // Reset state when user changes
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      setError(null);
      setLastCheckedUserId(null);
      return;
    }

    // Skip if we've already checked this user's premium status
    if (lastCheckedUserId === user.id) {
      return;
    }

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

    checkPremiumStatus();
  }, [user, lastCheckedUserId]);

  return { isPremium, loading, error };
}

export default usePremium;
