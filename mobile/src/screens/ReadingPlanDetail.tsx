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
  Image,
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
  uncompleteDay,
} from '../lib/readingPlans';
import { supabase } from '../lib/supabase';
import { chat } from '../lib/chat';
import { getBestCharacterName } from '../utils/characterSuggestions';

interface RouteParams {
  planId?: string;
  slug?: string;
  initialDay?: number;
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
  const [suggestedCharacters, setSuggestedCharacters] = useState<any[]>([]);

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

      // Auto-select day: prioritize initialDay param, then current progress
      if (!selectedDay) {
        if (params.initialDay) {
          const initialDayData = daysData.find(d => d.day_number === params.initialDay);
          if (initialDayData) {
            setSelectedDay(initialDayData);
          }
        } else if (progressData) {
          const currentDayData = daysData.find(d => d.day_number === progressData.current_day);
          if (currentDayData) {
            setSelectedDay(currentDayData);
          }
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

  // Load suggested characters when day is selected
  useEffect(() => {
    if (!selectedDay || !plan) {
      setSuggestedCharacters([]);
      return;
    }
    
    let active = true;
    (async () => {
      try {
        const readings = selectedDay.readings || [];
        if (readings.length === 0) return;
        
        // Get unique book names from readings
        const bookNames = [...new Set(readings.map(r => r.book))];
        
        // Find characters associated with these books
        const { data: chars } = await supabase
          .from('characters')
          .select('id,name,avatar_url,persona_prompt,bible_book')
          .or('is_visible.is.null,is_visible.eq.true')
          .limit(10);
        
        if (!chars || !active) return;
        
        // Score characters by relevance to today's readings
        const scored = chars
          .map(c => {
            let score = 0;
            const charBook = (c.bible_book || '').toLowerCase();
            for (const bookName of bookNames) {
              if (charBook.includes(bookName.toLowerCase())) {
                score += 10;
              }
            }
            // Bonus for primary suggested character
            const primaryName = getBestCharacterName(readings, plan.title);
            if (c.name.toLowerCase().includes(primaryName.toLowerCase())) {
              score += 20;
            }
            return { ...c, score };
          })
          .filter(c => c.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        
        if (active) setSuggestedCharacters(scored);
      } catch (e) {
        console.error('Error loading suggested characters:', e);
      }
    })();
    
    return () => { active = false; };
  }, [selectedDay, plan]);

  const handleStartPlan = async () => {
    if (!user) {
      Alert.alert('Account Required', 'Create a free account to track your reading plan progress.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Up', onPress: () => navigation.navigate('SignUp' as never) }
      ]);
      return;
    }
    if (!plan) return;
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

  const handleUncompleteDay = async () => {
    if (!user || !plan || !progress || !selectedDay) return;
    try {
      const updatedProgress = await uncompleteDay(
        user.id,
        plan.id,
        selectedDay.day_number
      );
      setProgress(updatedProgress);
    } catch (e: any) {
      console.error('Error unmarking day:', e);
      Alert.alert('Error', 'Failed to unmark day');
    }
  };

  const handlePrevDay = () => {
    if (!selectedDay || selectedDay.day_number <= 1) return;
    const prevDay = days.find(d => d.day_number === selectedDay.day_number - 1);
    if (prevDay) setSelectedDay(prevDay);
  };

  const handleNextDay = () => {
    if (!selectedDay || !plan || selectedDay.day_number >= plan.duration_days) return;
    const nextDay = days.find(d => d.day_number === selectedDay.day_number + 1);
    if (nextDay) setSelectedDay(nextDay);
  };

  // Start chat with a specific character (from suggestions)
  const startChatWithCharacter = async (charData: any) => {
    if (!selectedDay || !plan) return;
    
    try {
      const readings = selectedDay.readings || [];
      const readingsStr = readings.map(r => `${r.book} ${r.chapter}${r.verses ? ':' + r.verses : ''}`).join(', ');
      
      // For anonymous users, start ephemeral chat
      if (!user) {
        const planContext = {
          planTitle: plan.title,
          planSlug: plan.slug,
          dayNumber: selectedDay.day_number,
          dayTitle: selectedDay.title,
          readings: readingsStr,
          context: selectedDay.context,
          reflectionPrompt: selectedDay.reflection_prompt,
        };
        
        navigation.navigate('MainTabs', { 
          screen: 'Chat', 
          params: { 
            screen: 'ChatDetail', 
            params: { 
              character: charData,
              planContext,
              fromPlan: { slug: plan.slug, title: plan.title, dayNumber: selectedDay.day_number }
            }
          }
        });
        return;
      }
      
      // For logged-in users, create persistent chat
      const chatTitle = `${plan.title} - Day ${selectedDay.day_number}`;
      const newChat = await chat.createChat(user.id, charData.id, chatTitle);
      
      // Build system prompt
      const systemPrompt = [
        `READING PLAN CONTEXT:`,
        `Plan: "${plan.title}"`,
        `Day ${selectedDay.day_number} of ${plan.duration_days}: ${selectedDay.title || ''}`,
        `Today's Passages: ${readingsStr}`,
        selectedDay.context ? `\nToday's Teaching:\n${selectedDay.context}` : '',
        selectedDay.reflection_prompt ? `\nReflection Question: ${selectedDay.reflection_prompt}` : '',
        `\nINSTRUCTIONS:`,
        `You are ${charData.name}, guiding this person through their daily reading plan.`,
        `Lead the conversation - don't wait for them to ask questions.`,
        `1. Start by warmly greeting them and introducing today's reading.`,
        `2. Share your personal connection to these passages (if relevant to your biblical story).`,
        `3. After they've read, guide them through the key themes and lessons.`,
        `4. Use the reflection question to spark deeper discussion.`,
        `5. Encourage them and remind them of God's faithfulness.`,
        `Keep responses warm, conversational, and spiritually encouraging.`
      ].filter(Boolean).join('\n');
      
      await chat.addMessage(newChat.id, systemPrompt, 'system');
      
      // Generate intro
      const { generateCharacterResponse } = await import('../lib/api');
      const introPrompt = `Begin today's reading plan session. Warmly greet the reader, introduce Day ${selectedDay.day_number} (${selectedDay.title || readingsStr}), and share why these passages are meaningful. If these passages relate to your own story in Scripture, briefly mention that connection. Encourage them to read the passages and let you know when they're ready to discuss. Keep it warm and inviting (3-4 sentences).`;
      
      try {
        const introResponse = await generateCharacterResponse(
          charData.name,
          charData.persona_prompt || '',
          [{ role: 'user', content: introPrompt }]
        );
        await chat.addMessage(newChat.id, introResponse, 'assistant');
      } catch {
        const fallbackIntro = `Welcome to Day ${selectedDay.day_number} of "${plan.title}"! Today we'll be reading ${readingsStr}. Take your time with the passages, and when you're ready, I'd love to discuss what stood out to you.`;
        await chat.addMessage(newChat.id, fallbackIntro, 'assistant');
      }
      
      navigation.navigate('MainTabs', { 
        screen: 'Chat', 
        params: { 
          screen: 'ChatDetail', 
          params: { 
            chatId: newChat.id, 
            character: charData,
            fromPlan: { slug: plan.slug, title: plan.title, dayNumber: selectedDay.day_number }
          }
        }
      });
    } catch (e) {
      console.error('Error starting chat with character:', e);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  // Start chat with a suggested character based on today's reading
  const startCharacterChat = async () => {
    if (!selectedDay || !plan) {
      navigation.navigate('MainTabs', { screen: 'Chat', params: { screen: 'ChatNew' } });
      return;
    }
    
    try {
      // Get suggested character name based on readings
      const readings = selectedDay.readings || [];
      const characterName = getBestCharacterName(readings, plan.title);
      const readingsStr = readings.map(r => `${r.book} ${r.chapter}${r.verses ? ':' + r.verses : ''}`).join(', ');
      
      // Find the character in the database
      const { data: charData } = await supabase
        .from('characters')
        .select('id,name,avatar_url,persona_prompt,opening_line')
        .ilike('name', `%${characterName}%`)
        .limit(1)
        .maybeSingle();
      
      if (!charData) {
        // Fallback to chat selection if character not found
        navigation.navigate('MainTabs', { screen: 'Chat', params: { screen: 'ChatNew' } });
        return;
      }
      
      // For anonymous users, start ephemeral chat
      if (!user) {
        // Build reading plan context for ephemeral chat
        const planContext = {
          planTitle: plan.title,
          planSlug: plan.slug,
          dayNumber: selectedDay.day_number,
          dayTitle: selectedDay.title,
          readings: readingsStr,
          context: selectedDay.context,
          reflectionPrompt: selectedDay.reflection_prompt,
        };
        
        navigation.navigate('MainTabs', { 
          screen: 'Chat', 
          params: { 
            screen: 'ChatDetail', 
            params: { 
              character: charData,
              planContext,
              fromPlan: { slug: plan.slug, title: plan.title, dayNumber: selectedDay.day_number }
            }
          }
        });
        return;
      }
      
      // For logged-in users, create persistent chat
      const chatTitle = `${plan.title} - Day ${selectedDay.day_number}`;
      const newChat = await chat.createChat(user.id, charData.id, chatTitle);
      
      // Build comprehensive system message for character-led conversation
      const systemPrompt = [
        `READING PLAN CONTEXT:`,
        `Plan: "${plan.title}"`,
        `Day ${selectedDay.day_number} of ${plan.duration_days}: ${selectedDay.title || ''}`,
        `Today's Passages: ${readingsStr}`,
        selectedDay.context ? `\nToday's Teaching:\n${selectedDay.context}` : '',
        selectedDay.reflection_prompt ? `\nReflection Question: ${selectedDay.reflection_prompt}` : '',
        `\nINSTRUCTIONS:`,
        `You are ${charData.name}, guiding this person through their daily reading plan.`,
        `Lead the conversation - don't wait for them to ask questions.`,
        `1. Start by warmly greeting them and introducing today's reading.`,
        `2. Share your personal connection to these passages (if relevant to your biblical story).`,
        `3. After they've read, guide them through the key themes and lessons.`,
        `4. Use the reflection question to spark deeper discussion.`,
        `5. Encourage them and remind them of God's faithfulness.`,
        `Keep responses warm, conversational, and spiritually encouraging.`
      ].filter(Boolean).join('\n');
      
      await chat.addMessage(newChat.id, systemPrompt, 'system');
      
      // Generate character-led opening message instead of generic opening line
      const { generateCharacterResponse } = await import('../lib/api');
      const introPrompt = `Begin today's reading plan session. Warmly greet the reader, introduce Day ${selectedDay.day_number} (${selectedDay.title || readingsStr}), and share why these passages are meaningful. If these passages relate to your own story in Scripture, briefly mention that connection. Encourage them to read the passages and let you know when they're ready to discuss. Keep it warm and inviting (3-4 sentences).`;
      
      try {
        const introResponse = await generateCharacterResponse(
          charData.name,
          charData.persona_prompt || '',
          [{ role: 'user', content: introPrompt }]
        );
        await chat.addMessage(newChat.id, introResponse, 'assistant');
      } catch (introError) {
        // Fallback to a generic but contextual opening
        const fallbackIntro = `Welcome to Day ${selectedDay.day_number} of "${plan.title}"! Today we'll be reading ${readingsStr}. Take your time with the passages, and when you're ready, I'd love to discuss what stood out to you and explore these truths together.`;
        await chat.addMessage(newChat.id, fallbackIntro, 'assistant');
      }
      
      // Navigate to chat with plan context for back button
      navigation.navigate('MainTabs', { 
        screen: 'Chat', 
        params: { 
          screen: 'ChatDetail', 
          params: { 
            chatId: newChat.id, 
            character: charData,
            fromPlan: { slug: plan.slug, title: plan.title, dayNumber: selectedDay.day_number }
          }
        }
      });
    } catch (e) {
      console.error('Error starting character chat:', e);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  const openReading = (reading: { book: string; chapter: number; verses?: string }) => {
    // Pass reading plan context so highlighted verses can flow into character chat
    navigation.navigate('Bible', {
      translation: 'KJV',
      book: reading.book,
      chapter: reading.chapter,
      readingPlanContext: plan ? {
        planTitle: plan.title,
        planSlug: plan.slug,
        dayNumber: selectedDay?.day_number,
        dayTitle: selectedDay?.title,
        reflectionPrompt: selectedDay?.reflection_prompt,
        suggestedCharacter: getBestCharacterName(selectedDay?.readings || [], plan.title),
      } : undefined,
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
    const isDayCompleted = completedDays.has(selectedDay.day_number);
    const hasPrev = selectedDay.day_number > 1;
    const hasNext = selectedDay.day_number < plan.duration_days;
    
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Navigation Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setSelectedDay(null)}>
              <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← Back to Plan</Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity 
                onPress={handlePrevDay}
                disabled={!hasPrev}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: hasPrev ? theme.colors.surface : theme.colors.background,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: hasPrev ? theme.colors.border : theme.colors.background,
                }}
              >
                <Text style={{ color: hasPrev ? theme.colors.text : theme.colors.muted }}>← Prev</Text>
              </TouchableOpacity>
              
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                {selectedDay.day_number}/{plan.duration_days}
              </Text>
              
              <TouchableOpacity 
                onPress={handleNextDay}
                disabled={!hasNext}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: hasNext ? theme.colors.surface : theme.colors.background,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: hasNext ? theme.colors.border : theme.colors.background,
                }}
              >
                <Text style={{ color: hasNext ? theme.colors.text : theme.colors.muted }}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.colors.border }}>
            {/* Day Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
                  Day {selectedDay.day_number} of {plan.duration_days}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700' }}>
                  {selectedDay.title || `Day ${selectedDay.day_number}`}
                </Text>
              </View>
              {isDayCompleted && (
                <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#166534', fontSize: 12, fontWeight: '600' }}>✓ Completed</Text>
                </View>
              )}
            </View>

            {/* Today's Teaching/Context Section */}
            {selectedDay.context && (
              <View style={{ 
                backgroundColor: '#eff6ff', 
                padding: 16, 
                borderRadius: 10, 
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#bfdbfe',
              }}>
                <Text style={{ color: '#1e40af', fontWeight: '700', fontSize: 16, marginBottom: 10 }}>
                  📖 Today's Teaching
                </Text>
                <Text style={{ color: '#1e3a8a', lineHeight: 22 }}>
                  {selectedDay.context}
                </Text>
              </View>
            )}

            {/* Scripture Readings */}
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              📜 Today's Scripture
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

            {/* Reflection Prompt */}
            {selectedDay.reflection_prompt && (
              <View style={{ 
                backgroundColor: '#fef9c3', 
                padding: 14, 
                borderRadius: 8, 
                marginTop: 16,
                borderWidth: 1,
                borderColor: '#fde047',
              }}>
                <Text style={{ color: '#854d0e', fontWeight: '600', marginBottom: 4 }}>
                  💭 Reflection Question
                </Text>
                <Text style={{ color: '#713f12' }}>{selectedDay.reflection_prompt}</Text>
              </View>
            )}

            {/* Character Suggestions */}
            {suggestedCharacters.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                  👥 Discuss With
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {suggestedCharacters.map((char) => (
                    <TouchableOpacity
                      key={char.id}
                      onPress={() => startChatWithCharacter(char)}
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 10,
                        padding: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      {char.avatar_url ? (
                        <Image
                          source={{ uri: char.avatar_url }}
                          style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 8 }}
                        />
                      ) : (
                        <View style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: 24, 
                          backgroundColor: theme.colors.primary,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}>
                          <Text style={{ color: theme.colors.primaryText, fontWeight: '700', fontSize: 18 }}>
                            {char.name.charAt(0)}
                          </Text>
                        </View>
                      )}
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontWeight: '600', 
                        fontSize: 12,
                        textAlign: 'center',
                      }} numberOfLines={1}>
                        {char.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ gap: 12, marginTop: 20 }}>
              {user ? (
                // Logged in users see complete/uncomplete buttons
                progress ? (
                  isDayCompleted ? (
                    <TouchableOpacity
                      onPress={handleUncompleteDay}
                      style={{
                        backgroundColor: '#6b7280',
                        paddingVertical: 14,
                        borderRadius: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>↩ Unmark Complete</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleCompleteDay}
                      style={{
                        backgroundColor: '#16a34a',
                        paddingVertical: 14,
                        borderRadius: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>✓ Mark Day Complete</Text>
                    </TouchableOpacity>
                  )
                ) : (
                  <TouchableOpacity
                    onPress={handleStartPlan}
                    style={{
                      backgroundColor: '#16a34a',
                      paddingVertical: 14,
                      borderRadius: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>▶ Start Tracking This Plan</Text>
                  </TouchableOpacity>
                )
              ) : (
                // Anonymous users see sign up/login options
                <View style={{
                  backgroundColor: theme.colors.surface,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}>
                  <Text style={{ color: theme.colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                    Track your progress with a free account
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('SignUp', { 
                        returnTo: { 
                          screen: 'ReadingPlanDetail', 
                          params: { slug: plan?.slug } 
                        } 
                      })}
                      style={{
                        backgroundColor: theme.colors.primary,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 14 }}>Create Free Account</Text>
                    </TouchableOpacity>
                    <Text style={{ color: theme.colors.muted }}>or</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Login', { 
                        returnTo: { 
                          screen: 'ReadingPlanDetail', 
                          params: { slug: plan?.slug } 
                        } 
                      })}
                      style={{
                        backgroundColor: theme.colors.card,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 14 }}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {/* Primary action buttons row */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    const firstReading = selectedDay?.readings?.[0];
                    if (firstReading) {
                      openReading(firstReading);
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#2563eb',
                    paddingVertical: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>📖 Open in Bible</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={startCharacterChat}
                  style={{
                    flex: 1,
                    backgroundColor: '#7c3aed',
                    paddingVertical: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                    💬 Chat with {selectedDay?.readings?.[0]?.book ? getBestCharacterName(selectedDay.readings, plan?.title || '').split(' ')[0] : 'Guide'}
                  </Text>
                </TouchableOpacity>
              </View>
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
