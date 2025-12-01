import React from 'react';
import { View, Text, ScrollView } from 'react-native';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1, backgroundColor: '#111827' }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#fecaca', fontWeight: '800', fontSize: 18, marginBottom: 8 }}>Something went wrong</Text>
            <Text selectable style={{ color: '#fff' }}>{String(error?.message || error)}</Text>
          </View>
        </ScrollView>
      );
    }
    return this.props.children as any;
  }
}
