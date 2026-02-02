import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import {
  ReadingPlan,
  UserPlanProgress,
  getReadingPlans,
  getUserPlans,
  startPlan,
} from '../lib/readingPlans';

// Category definitions with icons
const CATEGORIES = [
  { key: 'all', label: 'All Plans', icon: '📚' },
  { key: 'active', label: 'My Active', icon: '▶️' },
  { key: 'foundational', label: 'Foundational', icon: '🏛️' },
  { key: 'book', label: 'Book Studies', icon: '📖' },
  { key: 'topical', label: 'Topical', icon: '💡' },
  { key: 'character', label: 'Character', icon: '👤' },
  { key: 'life', label: 'Life & Growth', icon: '🌱' },
  { key: 'seasonal', label: 'Seasonal', icon: '🗓️' },
  { key: 'quick', label: 'Quick (≤7 days)', icon: '⚡' },
  { key: 'deep', label: 'Deep Dive (30+)', icon: '🔍' },
];

function PlanCard({ 
  plan, 
  progress,
  onStart,
  onContinue,
}: { 
  plan: ReadingPlan; 
  progress?: UserPlanProgress;
  onStart: () => void;
  onContinue: () => void;
}) {
  const progressPercent = progress 
    ? Math.round((progress.completed_days?.length || 0) / plan.duration_days * 100)
    : 0;
  
  const difficultyColors: Record<string, { bg: string; text: string }> = {
    easy: { bg: '#dcfce7', text: '#166534' },
    medium: { bg: '#fef9c3', text: '#854d0e' },
    intensive: { bg: '#fee2e2', text: '#991b1b' },
  };

  const colors = difficultyColors[plan.difficulty] || difficultyColors.medium;

  return (
    <View style={{
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, flex: 1 }}>
          {plan.title}
        </Text>
        {plan.is_featured && (
          <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ color: '#1e40af', fontSize: 11, fontWeight: '600' }}>Featured</Text>
          </View>
        )}
      </View>
      
      <Text style={{ color: theme.colors.muted, fontSize: 14, marginBottom: 12 }}>
        {plan.description}
      </Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{plan.duration_days} days</Text>
        <Text style={{ color: theme.colors.muted }}>•</Text>
        <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
          <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>
            {plan.difficulty}
          </Text>
        </View>
      </View>

      {progress ? (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: theme.colors.muted, fontSize: 12 }}>Progress</Text>
            <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>{progressPercent}%</Text>
          </View>
          <View style={{ height: 6, backgroundColor: theme.colors.surface, borderRadius: 3, marginBottom: 12 }}>
            <View style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              backgroundColor: theme.colors.primary, 
              borderRadius: 3 
            }} />
          </View>
          <TouchableOpacity
            onPress={onContinue}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '600' }}>Continue Reading</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onStart}
          style={{
            backgroundColor: theme.colors.surface,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Start Plan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ReadingPlans() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [userProgress, setUserProgress] = useState<UserPlanProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    
    try {
      const [allPlans, progress] = await Promise.all([
        getReadingPlans(),
        user ? getUserPlans(user.id) : [],
      ]);
      setPlans(allPlans);
      setUserProgress(progress);
    } catch (e: any) {
      console.error('Error loading reading plans:', e);
      setError('Failed to load reading plans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const handleStartPlan = async (plan: ReadingPlan) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await startPlan(user.id, plan.id);
      navigation.navigate('ReadingPlanDetail', { planId: plan.id, slug: plan.slug });
    } catch (e: any) {
      console.error('Error starting plan:', e);
      setError('Failed to start plan');
    }
  };

  const handleContinuePlan = (plan: ReadingPlan) => {
    navigation.navigate('ReadingPlanDetail', { planId: plan.id, slug: plan.slug });
  };

  const getProgressForPlan = (planId: string) => {
    return userProgress.find(p => p.plan_id === planId);
  };

  const activePlans = userProgress.filter(p => !p.is_completed);
  const activePlanIds = new Set(activePlans.map(p => p.plan_id));

  // Filter plans based on selected category
  const filteredPlans = useMemo(() => {
    switch (selectedCategory) {
      case 'all':
        return plans;
      case 'active':
        return plans.filter(p => activePlanIds.has(p.id));
      case 'quick':
        return plans.filter(p => p.duration_days <= 7);
      case 'deep':
        return plans.filter(p => p.duration_days >= 30);
      default:
        return plans.filter(p => p.category === selectedCategory);
    }
  }, [plans, selectedCategory, activePlanIds]);

  const featuredPlans = filteredPlans.filter(p => p.is_featured);
  const otherPlans = filteredPlans.filter(p => !p.is_featured);
  
  // Get count for each category
  const getCategoryCount = (key: string) => {
    switch (key) {
      case 'all':
        return plans.length;
      case 'active':
        return activePlans.length;
      case 'quick':
        return plans.filter(p => p.duration_days <= 7).length;
      case 'deep':
        return plans.filter(p => p.duration_days >= 30).length;
      default:
        return plans.filter(p => p.category === key).length;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={theme.colors.primary} />
        }
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.accent, fontFamily: theme.fonts?.heading }}>
            Reading Plans
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Bible')}
            style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 13 }}>📖 Bible</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: theme.colors.muted, marginBottom: 12 }}>
          {plans.length} plans to guide your daily Bible reading
        </Text>

        {/* Category Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={{ marginBottom: 16, marginHorizontal: -16 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {CATEGORIES.map(cat => {
            const count = getCategoryCount(cat.key);
            const isActive = selectedCategory === cat.key;
            if (count === 0 && cat.key !== 'all' && cat.key !== 'active') return null;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                <Text style={{ 
                  color: isActive ? theme.colors.primaryText : theme.colors.text, 
                  fontWeight: isActive ? '600' : '400',
                  fontSize: 13,
                }}>
                  {cat.label}
                </Text>
                <Text style={{ 
                  color: isActive ? theme.colors.primaryText : theme.colors.muted,
                  fontSize: 11,
                }}>
                  ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {error ? (
          <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: '#991b1b' }}>{error}</Text>
          </View>
        ) : null}

        {/* Active Plans - Show at top only when viewing 'all' */}
        {selectedCategory === 'all' && activePlans.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
              ▶️ Continue Reading
            </Text>
            {activePlans.map(progress => (
              <PlanCard
                key={progress.plan_id}
                plan={progress.plan!}
                progress={progress}
                onStart={() => {}}
                onContinue={() => handleContinuePlan(progress.plan!)}
              />
            ))}
          </View>
        )}

        {/* Featured Plans */}
        {featuredPlans.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
              ⭐ Featured
            </Text>
            {featuredPlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                progress={getProgressForPlan(plan.id)}
                onStart={() => handleStartPlan(plan)}
                onContinue={() => handleContinuePlan(plan)}
              />
            ))}
          </View>
        )}

        {/* Other Plans */}
        {otherPlans.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            {featuredPlans.length > 0 && (
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
                📚 More Plans
              </Text>
            )}
            {otherPlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                progress={getProgressForPlan(plan.id)}
                onStart={() => handleStartPlan(plan)}
                onContinue={() => handleContinuePlan(plan)}
              />
            ))}
          </View>
        )}

        {filteredPlans.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: theme.colors.muted }}>
              {selectedCategory === 'active' 
                ? "You haven't started any plans yet. Browse and start one!"
                : "No plans found in this category."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
