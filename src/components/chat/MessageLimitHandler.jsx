import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UpgradeModal from '../modals/UpgradeModal';

/**
 * MessageLimitHandler Component
 * 
 * Monitors message count in a conversation and shows upgrade modal
 * when free users reach their message limit.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {number} props.messageCount - Current number of messages in the conversation
 * @param {string} props.conversationId - ID of the current conversation
 * @param {function} props.onContinue - Optional callback when user dismisses modal but wants to continue
 */
const MessageLimitHandler = ({ 
  children, 
  messageCount = 0, 
  conversationId,
  onContinue
}) => {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [messageLimit, setMessageLimit] = useState(5); // Default limit
  const [hasShownModalForConversation, setHasShownModalForConversation] = useState(false);
  
  // Load message limit from account tier settings
  useEffect(() => {
    try {
      const settingsJson = localStorage.getItem('accountTierSettings');
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        if (settings.freeMessageLimit) {
          setMessageLimit(settings.freeMessageLimit);
        }
      }
      
      // Check if we've already shown the modal for this conversation
      if (conversationId) {
        const shownModals = JSON.parse(localStorage.getItem('shownUpgradeModals') || '{}');
        if (shownModals[conversationId]) {
          setHasShownModalForConversation(true);
        }
      }
    } catch (error) {
      console.error('Error loading message limit settings:', error);
    }
  }, [conversationId]);
  
  // Check if user has premium access
  const hasPremiumAccess = () => {
    // This would typically check a subscription status from your auth system
    // For now, we'll assume admin users have premium access
    return user?.is_admin === true;
  };
  
  // Check if message limit is reached
  useEffect(() => {
    if (
      messageCount >= messageLimit && // Has reached or exceeded the limit
      !hasPremiumAccess() && // Is not a premium user
      !hasShownModalForConversation && // Hasn't seen the modal for this conversation
      conversationId // Has a valid conversation ID
    ) {
      setShowUpgradeModal(true);
      
      // Mark this conversation as having shown the modal
      try {
        const shownModals = JSON.parse(localStorage.getItem('shownUpgradeModals') || '{}');
        shownModals[conversationId] = true;
        localStorage.setItem('shownUpgradeModals', JSON.stringify(shownModals));
        setHasShownModalForConversation(true);
      } catch (error) {
        console.error('Error saving modal shown state:', error);
      }
    }
  }, [messageCount, messageLimit, conversationId, hasShownModalForConversation]);
  
  // Handle modal close
  const handleCloseModal = () => {
    setShowUpgradeModal(false);
    if (typeof onContinue === 'function') {
      onContinue();
    }
  };
  
  return (
    <>
      {children}
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleCloseModal}
        limitType="message"
        messageCount={messageCount}
        messageLimit={messageLimit}
      />
    </>
  );
};

export default MessageLimitHandler;
