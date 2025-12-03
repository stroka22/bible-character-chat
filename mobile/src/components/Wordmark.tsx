import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  width: number;
};

// Aspect ratio target: 300:84 (~3.57:1)
export default function Wordmark({ width }: Props) {
  const aspect = 300 / 84;
  const height = width / aspect;

  // Sizes derived from width
  const bubbleSize = Math.max(40, Math.min(80, height * 0.5));
  const borderRadius = bubbleSize * 0.25;
  const stroke = Math.max(2, Math.round(bubbleSize * 0.06));
  const crossThickness = Math.max(3, Math.round(bubbleSize * 0.14));
  const crossLen = Math.round(bubbleSize * 0.45);
  const tailSize = Math.max(6, Math.round(bubbleSize * 0.22));
  const gap = Math.max(8, Math.round(width * 0.03));
  const fontSize = Math.max(24, Math.min(64, height * 0.42));

  const gray = '#9ca3af';
  const gold = '#facc15';

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Chat bubble with cross */}
        <View style={{ width: bubbleSize, height: bubbleSize + tailSize, justifyContent: 'flex-start', alignItems: 'center' }}>
          {/* Rounded rectangle */}
          <View style={{ width: bubbleSize, height: bubbleSize, borderRadius, borderWidth: stroke, borderColor: gray, backgroundColor: 'transparent' }} />
          {/* Tail */}
          <View style={{ width: 0, height: 0, borderTopWidth: tailSize, borderTopColor: gray, borderLeftWidth: tailSize, borderLeftColor: 'transparent', borderRightWidth: 0, borderRightColor: 'transparent', alignSelf: 'flex-start', marginLeft: bubbleSize * 0.18, marginTop: -stroke }} />
          {/* Cross (absolute in bubble) */}
          <View style={{ position: 'absolute', top: (bubbleSize - crossLen) / 2 + Math.round(bubbleSize * 0.06), left: (bubbleSize - crossLen) / 2 }}>
            <View style={{ width: crossLen, height: crossThickness, backgroundColor: gold }} />
            <View style={{ position: 'absolute', left: (crossLen - crossThickness) / 2, top: -(crossLen - crossThickness) / 2, width: crossThickness, height: crossLen, backgroundColor: gold }} />
          </View>
        </View>

        <View style={{ width: gap }} />

        {/* Wordmark */}
        <Text
          numberOfLines={1}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize,
            color: gray,
          }}>
          FaithTalk
          <Text style={{ color: gold }}>AI</Text>
        </Text>
      </View>
    </View>
  );
}
