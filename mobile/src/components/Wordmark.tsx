import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  width: number;
  variant?: 'inline' | 'stacked' | 'iconOnly';
};

// Aspect ratio target: 300:84 (~3.57:1) for inline; stacked adjusts height automatically
export default function Wordmark({ width, variant = 'inline' }: Props) {
  const aspectInline = 300 / 84;
  const heightInline = width / aspectInline;

  // Base sizes derived from width
  const bubbleSize = Math.max(28, Math.min(80, (variant === 'iconOnly' ? width : heightInline * 0.5)));
  const borderRadius = bubbleSize * 0.25;
  const stroke = Math.max(2, Math.round(bubbleSize * 0.06));
  const crossThickness = Math.max(3, Math.round(bubbleSize * 0.14));
  const crossLen = Math.round(bubbleSize * 0.45);
  const tailSize = Math.max(6, Math.round(bubbleSize * 0.22));
  const gap = Math.max(8, Math.round(width * 0.03));
  const fontSize = Math.max(20, Math.min(64, heightInline * 0.42));

  const gray = '#9ca3af';
  const gold = '#facc15';

  const Bubble = (
    <View style={{ width: bubbleSize, height: bubbleSize + tailSize, justifyContent: 'flex-start', alignItems: 'center' }}>
      {/* Rounded rectangle */}
      <View style={{ width: bubbleSize, height: bubbleSize, borderRadius, borderWidth: stroke, borderColor: gray, backgroundColor: 'transparent' }} />
      {/* Tail */}
      <View style={{ width: 0, height: 0, borderTopWidth: tailSize, borderTopColor: gray, borderLeftWidth: tailSize, borderLeftColor: 'transparent', borderRightWidth: 0, borderRightColor: 'transparent', alignSelf: 'flex-start', marginLeft: bubbleSize * 0.18, marginTop: -stroke }} />
      {/* Cross (absolute in bubble) - lowered a bit more for optical centering */}
      <View style={{ position: 'absolute', top: (bubbleSize - crossLen) / 2 + Math.round(bubbleSize * 0.10), left: (bubbleSize - crossLen) / 2 }}>
        <View style={{ width: crossLen, height: crossThickness, backgroundColor: gold }} />
        <View style={{ position: 'absolute', left: (crossLen - crossThickness) / 2, top: -(crossLen - crossThickness) / 2, width: crossThickness, height: crossLen, backgroundColor: gold }} />
      </View>
    </View>
  );

  if (variant === 'iconOnly') {
    return (
      <View style={{ width, height: bubbleSize + tailSize, alignItems: 'center', justifyContent: 'center' }}>
        {Bubble}
      </View>
    );
  }

  if (variant === 'stacked') {
    const totalHeight = (bubbleSize + tailSize) + Math.max(6, Math.round(width * 0.015)) + fontSize;
    return (
      <View style={{ width, height: totalHeight, alignItems: 'center', justifyContent: 'center' }}>
        {Bubble}
        <View style={{ height: Math.max(6, Math.round(width * 0.015)) }} />
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize, color: gray }}>
          FaithTalk
          <Text style={{ color: gold }}>AI</Text>
        </Text>
      </View>
    );
  }

  // inline
  return (
    <View style={{ width, height: heightInline, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {Bubble}
        <View style={{ width: gap }} />
        <Text numberOfLines={1} style={{ fontFamily: 'Inter_700Bold', fontSize, color: gray }}>
          FaithTalk
          <Text style={{ color: gold }}>AI</Text>
        </Text>
      </View>
    </View>
  );
}
