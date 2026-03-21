import React, { useState, useEffect, useRef } from 'react';
import { usePremium } from '../../hooks/usePremium';
import { getSettings as getTierSettings } from '../../services/tierSettingsService';
import UpgradeModal from '../modals/UpgradeModal';

/**
 * MessageLimitHandler Component
 * 
 * Monitors message count in a conversation and shows upgrade modal
 * when free users reach their message limit. Shows every X messages
 * (similar to signup prompt behavior).
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {number} props.messageCount - Current number of user messages in the conversation
 * @param {function} props.onContinue - Optional callback when user dismisses modal
 */
const MessageLimitHandler = ({ 
  children, 
  messageCount = 0, 
  onContinue
}) => {
  const { isPremium } = usePremium();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [messageLimit, setMessageLimit] = useState(50);
  const [limitEnabled, setLimitEnabled] = useState(false);
  const lastPromptCountRef = useRef(0);
  
  // Load message limit settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getTierSettings();
        if (settings) {
          setLimitEnabled(settings.messageLimitEnabled === true);
          setMessageLimit(settings.freeMessageLimit || 50);
        }
      } catch (error) {
        console.error('Error loading message limit settings:', error);
      }
    };
    loadSettings();
  }, []);
  
  // Check if message limit is reached - show every X messages
  useEffect(() => {
    if (!limitEnabled || isPremium) return;
    
    // Show prompt at messageLimit, messageLimit*2, messageLimit*3, etc.
    if (
      messageCount >= messageLimit && 
      messageCount % messageLimit === 0 && 
      messageCount > lastPromptCountRef.current
    ) {
      setShowUpgradeModal(true);
      lastPromptCountRef.current = messageCount;
    }
  }, [messageCount, messageLimit, limitEnabled, isPremium]);
  
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
