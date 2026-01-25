import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import {
  ReadingPlan,
  PlanDay,
  UserPlanProgress,
  getPlanBySlug,
  getPlanDays,
  getUserProgress,
  startPlan,
  completeDay,
} from '../lib/readingPlans';

interface RouteParams {
  planId?: string;
  slug?: string;
}

export default function ReadingPlanDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;
  const { user } = useAuth();

  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [days, setDays] = useState<PlanDay[]>([]);
  const [progress, setProgress] = useState<UserPlanProgress | null>(null);
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const planData = await getPlanBySlug(params.slug!);
      if (!planData) {
        setError('Plan not found');
        return;
      }
      setPlan(planData);

      const [daysData, progressData] = await Promise.all([
        getPlanDays(planData.id),
        user ? getUserProgress(user.id, planData.id) : null,
      ]);

      setDays(daysData);
      setProgress(progressData);

      // Auto-select current day if user has progress
      if (progressData && !selectedDay) {
        const currentDayData = daysData.find(d => d.day_number === progressData.current_day);
        if (currentDayData) {
          setSelectedDay(currentDayData);
        }
      }
    } catch (e: any) {
      console.error('Error loading plan:', e);
      setError('Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (params.slug) {
        loadData();
      }
    }, [params.slug, user])
  );

  const handleStartPlan = async () => {
    if (!user || !plan) return;
    try {
      const newProgress = await startPlan(user.id, plan.id);
      setProgress(newProgress);
      const firstDay = days.find(d => d.day_number === 1);
      if (firstDay) setSelectedDay(firstDay);
    } catch (e: any) {
      console.error('Error starting plan:', e);
      Alert.alert('Error', 'Failed to start plan');
    }
  };

  const handleCompleteDay = async () => {
    if (!user || !plan || !progress || !selectedDay) return;
    try {
      const updatedProgress = await completeDay(
        user.id,
        plan.id,
        selectedDay.day_number,
        plan.duration_days
      );
      setProgress(updatedProgress);

      // Move to next day or back to overview
      const nextDay = days.find(d => d.day_number === selectedDay.day_number + 1);
      if (nextDay) {
        setSelectedDay(nextDay);
      } else {
        setSelectedDay(null);
        Alert.alert('Congratulations!', 'You\'ve completed this reading plan!');
      }
    } catch (e: any) {
      console.error('Error completing day:', e);
      Alert.alert('Error', 'Failed to mark day complete');
    }
  };

  const openReading = (reading: { book: string; chapter: number; verses?: string }) => {
    navigation.navigate('Bible', {
      translation: 'KJV',
      book: reading.book,
      chapter: reading.chapter,
    });
  };

  const completedDays = new Set(progress?.completed_days || []);
  const progressPercent = progress && plan
    ? Math.round((completedDays.size / plan.duration_days) * 100)
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !plan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
        <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ color: '#991b1b' }}>{error || 'Plan not found'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Day Detail View
  if (selectedDay) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <TouchableOpacity 
            onPress={() => setSelectedDay(null)}
            style={{ marginBottom: 16 }}
          >
            <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← Back to Plan</Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
              Day {selectedDay.day_number} of {plan.duration_days}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
              {selectedDay.title || `Day ${selectedDay.day_number}`}
            </Text>

            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              Today's Reading
            </Text>
            
            {selectedDay.readings?.map((reading, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => openReading(reading)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surface,
                  padding: 14,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '500' }}>
                  {reading.book} {reading.chapter}
                  {reading.verses && `:${reading.verses}`}
                </Text>
                <Text style={{ color: theme.colors.primary }}>Read →</Text>
              </TouchableOpacity>
            ))}

            {selectedDay.reflection_prompt && (
              <View style={{ 
                backgroundColor: '#fef3c7', 
                padding: 14, 
                borderRadius: 8, 
                marginTop: 16,
                borderWidth: 1,
                borderColor: '#fcd34d',
              }}>
                <Text style={{ color: '#92400e', fontWeight: '600', marginBottom: 4 }}>
                  Reflection Question
                </Text>
                <Text style={{ color: '#78350f' }}>{selectedDay.reflection_prompt}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    const readingsStr = selectedDay.readings?.map(r => `${r.book} ${r.chapter}${r.verses ? ':' + r.verses : ''}`).join(', ') || '';
                    navigation.navigate('Chat', {
                      screen: 'ChatNew',
                      params: {
                        initialMessage: `I'm reading "${selectedDay.title || `Day ${selectedDay.day_number}`}" from the "${plan.title}" reading plan. Today's passages: ${readingsStr}. ${selectedDay.reflection_prompt}`,
                      },
                    });
                  }}
                  style={{ marginTop: 12 }}
                >
                  <Text style={{ color: '#1d4ed8', fontWeight: '600', fontSize: 14 }}>
                    Discuss this with a Bible character →
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={handleCompleteDay}
                style={{
                  backgroundColor: '#16a34a',
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Mark Complete ✓</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  const readingsStr = selectedDay.readings?.map(r => `${r.book} ${r.chapter}${r.verses ? ':' + r.verses : ''}`).join(', ') || '';
                  navigation.navigate('Chat', {
                    screen: 'ChatNew',
                    params: {
                      initialMessage: `I'd like to discuss today's reading: ${readingsStr} from "${plan.title}"`,
                    },
                  });
                }}
                style={{
                  backgroundColor: '#9333ea',
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Chat About This</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Plan Overview
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 16 }}
        >
          <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← All Plans</Text>
        </TouchableOpacity>

        <Text style={{ color: theme.colors.accent, fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
          {plan.title}
        </Text>
        <Text style={{ color: theme.colors.muted, marginBottom: 12 }}>{plan.description}</Text>
        
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 13 }}>{plan.duration_days} days</Text>
          <Text style={{ color: theme.colors.muted }}>•</Text>
          <Text style={{ color: theme.colors.muted, fontSize: 13, textTransform: 'capitalize' }}>{plan.difficulty}</Text>
        </View>

        {/* Progress Bar */}
        {progress && (
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 10, 
            padding: 14, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: theme.colors.muted, fontSize: 13 }}>Your Progress</Text>
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>
                {completedDays.size} of {plan.duration_days} days ({progressPercent}%)
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: theme.colors.surface, borderRadius: 4 }}>
              <View style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                backgroundColor: theme.colors.primary, 
                borderRadius: 4 
              }} />
            </View>
          </View>
        )}

        {/* Start Button */}
        {!progress && (
          <TouchableOpacity
            onPress={handleStartPlan}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 }}>Start This Plan</Text>
          </TouchableOpacity>
        )}

        {/* Days Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {days.map(day => {
            const isCompleted = completedDays.has(day.day_number);
            const isCurrent = progress?.current_day === day.day_number;
            
            return (
              <TouchableOpacity
                key={day.id}
                onPress={() => setSelectedDay(day)}
                style={{
                  width: '18%',
                  aspectRatio: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: isCompleted 
                    ? '#dcfce7' 
                    : isCurrent 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                  borderRadius: 8,
                  borderWidth: isCurrent ? 0 : 1,
                  borderColor: isCompleted ? '#86efac' : theme.colors.border,
                }}
              >
                <Text style={{ 
                  color: isCompleted 
                    ? '#166534' 
                    : isCurrent 
                      ? theme.colors.primaryText 
                      : theme.colors.text,
                  fontWeight: isCurrent ? '700' : '500',
                  fontSize: 14,
                }}>
                  {day.day_number}
                </Text>
                {isCompleted && (
                  <Text style={{ fontSize: 10, color: '#166534' }}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {progress?.is_completed && (
          <View style={{ 
            marginTop: 24, 
            padding: 20, 
            backgroundColor: '#dcfce7', 
            borderRadius: 12,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>🎉</Text>
            <Text style={{ color: '#166534', fontWeight: '700', fontSize: 18 }}>Congratulations!</Text>
            <Text style={{ color: '#166534', marginTop: 4 }}>You've completed this reading plan!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
