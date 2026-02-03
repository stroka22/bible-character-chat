import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  width?: number; // px
  variant?: 'stacked' | 'iconOnly' | 'inline';
};

// Colors per brand spec - amber theme
const MAIN_COLOR = '#92400e'; // amber-800 - FaithTalk + bubble (matches muted text)
const GOLD = '#d97706'; // amber-600 - AI + cross (matches primary)

export default function Wordmark({ width = 200, variant = 'inline' }: Props) {
  // Bubble geometry helpers
  const bubbleSize = Math.max(28, Math.min(80, Math.round(width * 0.22)));
  const borderRadius = bubbleSize * 0.25;
  const stroke = Math.max(2, Math.round(bubbleSize * 0.08));
  const crossThickness = Math.max(3, Math.round(bubbleSize * 0.16));
  const crossLen = Math.round(bubbleSize * 0.5);
  const tailSize = Math.max(6, Math.round(bubbleSize * 0.24));

  const Bubble = (
    <View style={{ width: bubbleSize, height: bubbleSize + tailSize, justifyContent: 'flex-start', alignItems: 'center' }}>
      {/* Bubble outline */}
      <View style={{ width: bubbleSize, height: bubbleSize, borderRadius, borderWidth: stroke, borderColor: MAIN_COLOR, backgroundColor: 'transparent' }} />
      {/* Tail */}
      <View style={{ width: 0, height: 0, borderTopWidth: tailSize, borderTopColor: MAIN_COLOR, borderLeftWidth: tailSize, borderLeftColor: 'transparent', alignSelf: 'flex-start', marginLeft: bubbleSize * 0.18, marginTop: -stroke }} />
      {/* Cross centered */}
      <View style={{ position: 'absolute', top: (bubbleSize - crossLen) / 2 + Math.round(bubbleSize * 0.08), left: (bubbleSize - crossLen) / 2 }}>
        <View style={{ width: crossLen, height: crossThickness, backgroundColor: GOLD }} />
        <View style={{ position: 'absolute', left: (crossLen - crossThickness) / 2, top: -(crossLen - crossThickness) / 2, width: crossThickness, height: crossLen, backgroundColor: GOLD }} />
      </View>
    </View>
  );

  if (variant === 'iconOnly') {
    return (
      <View style={{ width: bubbleSize, height: bubbleSize + tailSize, alignItems: 'center', justifyContent: 'center' }}>
        {Bubble}
      </View>
    );
  }

  if (variant === 'stacked') {
    // Two-line stacked: FaithTalk (gray) + AI (gold)
    // Width drives font size heuristically
    const fontSize = Math.max(24, Math.min(64, Math.floor(width / 7)));
    return (
      <View style={{ width, alignItems: 'center' }}>
        {Bubble}
        <View style={{ height: Math.max(6, Math.round(width * 0.02)) }} />
        <Text style={{ color: MAIN_COLOR, fontFamily: 'Inter_700Bold', fontSize, includeFontPadding: false }}>FaithTalk</Text>
        <Text style={{ color: GOLD, fontFamily: 'Inter_700Bold', fontSize: fontSize * 0.9, includeFontPadding: false }}>AI</Text>
      </View>
    );
  }

  // inline variant: FaithTalk (gray) + AI (gold) in one row
  const fontSize = Math.max(16, Math.min(48, Math.floor(width / 9)));
  return (
    <View style={{ width, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
      <Text style={{ color: MAIN_COLOR, fontFamily: 'Inter_700Bold', fontSize, includeFontPadding: false }}>FaithTalk</Text>
      <Text style={{ color: GOLD, fontFamily: 'Inter_700Bold', fontSize: fontSize * 0.92, marginLeft: 4, includeFontPadding: false }}>AI</Text>
    </View>
  );
}
