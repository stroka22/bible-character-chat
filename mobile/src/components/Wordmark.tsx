import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  width?: number; // px
  variant?: 'stacked' | 'iconOnly' | 'inline';
};

// Colors per brand spec
const GRAY = '#9ca3af'; // FaithTalk + bubble
const GOLD = '#facc15'; // AI + cross

export default function Wordmark({ width = 200, variant = 'inline' }: Props) {
  if (variant === 'iconOnly') {
    // Render the chat bubble with cross mark as a stylized "FT" icon
    const size = Math.max(24, Math.min(width, 64));
    const dot = Math.round(size * 0.18);
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size, height: size, borderRadius: size * 0.22, backgroundColor: GRAY, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: GOLD, fontWeight: '900', fontSize: dot * 1.3, lineHeight: dot * 1.3 }}>✝</Text>
        </View>
      </View>
    );
  }

  if (variant === 'stacked') {
    // Two-line stacked: FaithTalk (gray) + AI (gold)
    // Width drives font size heuristically
    const fontSize = Math.max(24, Math.min(64, Math.floor(width / 7)));
    return (
      <View style={{ width, alignItems: 'center' }}>
        <Text style={{ color: GRAY, fontFamily: 'Inter_700Bold', fontSize, includeFontPadding: false }}>FaithTalk</Text>
        <Text style={{ color: GOLD, fontFamily: 'Inter_700Bold', fontSize: fontSize * 0.9, includeFontPadding: false }}>AI</Text>
      </View>
    );
  }

  // inline variant: FaithTalk (gray) + AI (gold) in one row
  const fontSize = Math.max(16, Math.min(48, Math.floor(width / 9)));
  return (
    <View style={{ width, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
      <Text style={{ color: GRAY, fontFamily: 'Inter_700Bold', fontSize, includeFontPadding: false }}>FaithTalk</Text>
      <Text style={{ color: GOLD, fontFamily: 'Inter_700Bold', fontSize: fontSize * 0.92, marginLeft: 4, includeFontPadding: false }}>AI</Text>
    </View>
  );
}
