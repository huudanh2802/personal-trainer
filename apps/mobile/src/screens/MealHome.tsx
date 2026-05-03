import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DietLog from '../components/DietLog';
import { globalStyles, theme } from '../styles';

const WORKOUT_WEB_URL_KEY = '@personal_trainer/workout_web_url';
const DEFAULT_WORKOUT_WEB = 'http://localhost:5173';

type MealHomeProps = {
  navigation: { navigate: (name: string) => void };
};

export default function MealHomeScreen({ navigation }: MealHomeProps) {
  const [workoutWebUrl, setWorkoutWebUrl] = useState(DEFAULT_WORKOUT_WEB);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          const w = await AsyncStorage.getItem(WORKOUT_WEB_URL_KEY);
          setWorkoutWebUrl(w?.trim() || DEFAULT_WORKOUT_WEB);
        } catch {
          setWorkoutWebUrl(DEFAULT_WORKOUT_WEB);
        }
      })();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={globalStyles.screen} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={globalStyles.title}>Meal log</Text>
        <Text style={globalStyles.subtitle}>Log calories on the go. Workouts run in the browser at home.</Text>

        <TouchableOpacity
          style={[globalStyles.primaryButton, styles.cta]}
          onPress={() => Linking.openURL(workoutWebUrl)}
          activeOpacity={0.9}
        >
          <Text style={globalStyles.primaryButtonText}>Open home workouts (web)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, styles.secondarySpacing]}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryButtonText}>Backend &amp; sync settings</Text>
        </TouchableOpacity>

        <View style={styles.diet}>
          <DietLog />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  scroll: { paddingBottom: 32 },
  cta: { marginTop: 16 },
  secondarySpacing: { marginTop: 12 },
  secondaryButton: {
    backgroundColor: theme.accentSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.borderGlass,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.accent,
    fontWeight: '700',
    fontSize: 16,
  },
  diet: { marginTop: 16 },
});
