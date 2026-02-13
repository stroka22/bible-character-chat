import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { theme } from '../theme';

interface AIConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function AIConsentModal({ visible, onAccept, onDecline }: AIConsentModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>AI Data Usage Consent</Text>
            
            <Text style={styles.intro}>
              FaithTalkAI uses artificial intelligence to create conversations with biblical characters. Before you begin, please review how your data is used:
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📤 What Data Is Sent</Text>
              <Text style={styles.sectionText}>
                When you send a message, the following is transmitted to our AI service:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bullet}>• Your message text</Text>
                <Text style={styles.bullet}>• Recent conversation history (for context)</Text>
                <Text style={styles.bullet}>• The character's persona information</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏢 Who Receives Your Data</Text>
              <Text style={styles.sectionText}>
                Your messages are processed by <Text style={styles.bold}>OpenAI</Text>, a third-party AI service provider. OpenAI processes your data according to their API data usage policies.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔒 How Your Data Is Protected</Text>
              <View style={styles.bulletList}>
                <Text style={styles.bullet}>• Messages are sent over encrypted connections</Text>
                <Text style={styles.bullet}>• We do not sell your personal data</Text>
                <Text style={styles.bullet}>• Conversations are stored securely in your account</Text>
                <Text style={styles.bullet}>• You can delete your data at any time</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Privacy Policy</Text>
              <Text style={styles.sectionText}>
                For complete details about our data practices, please review our{' '}
                <Text 
                  style={styles.link}
                  onPress={() => Linking.openURL('https://faithtalkai.com/privacy')}
                >
                  Privacy Policy
                </Text>.
              </Text>
            </View>

            <Text style={styles.consentText}>
              By tapping "I Agree", you consent to having your messages processed by OpenAI's AI service as described above.
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptText}>I Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FEF7ED',
    borderRadius: 16,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#78350F',
    textAlign: 'center',
    marginBottom: 16,
  },
  intro: {
    fontSize: 15,
    color: '#92400E',
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  bulletList: {
    marginTop: 6,
    marginLeft: 4,
  },
  bullet: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
  link: {
    color: '#B45309',
    textDecorationLine: 'underline',
  },
  consentText: {
    fontSize: 14,
    color: '#78350F',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 10,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5D4C0',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5D4C0',
  },
  declineText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '500',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#D97706',
  },
  acceptText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
