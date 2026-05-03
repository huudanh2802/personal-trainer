import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, theme } from '../styles';
import { getStoredApiConfig, saveApiConfig } from '../services/mealApi';

const WORKOUT_WEB_URL_KEY = '@personal_trainer/workout_web_url';

type SettingsProps = {
  navigation: { goBack: () => void };
};

export default function SettingsScreen({ navigation }: SettingsProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [workoutWebUrl, setWorkoutWebUrl] = useState('http://localhost:5173');

  const load = useCallback(async () => {
    const cfg = await getStoredApiConfig((k) => AsyncStorage.getItem(k));
    setBaseUrl(cfg.baseUrl);
    setApiKey(cfg.apiKey);
    const w = await AsyncStorage.getItem(WORKOUT_WEB_URL_KEY);
    if (w) setWorkoutWebUrl(w);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    Keyboard.dismiss();
    try {
      await saveApiConfig((k, v) => AsyncStorage.setItem(k, v), baseUrl, apiKey);
      await AsyncStorage.setItem(WORKOUT_WEB_URL_KEY, workoutWebUrl.trim());
      Alert.alert('Saved', 'API URL, key, and workout web link stored on this device.');
    } catch {
      Alert.alert('Error', 'Could not save settings.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={globalStyles.screen} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Meal log</Text>
        </TouchableOpacity>

        <Text style={globalStyles.title}>Sync &amp; links</Text>
        <Text style={globalStyles.subtitle}>
          Optional: PUT daily calorie totals to your Azure-hosted API. Leave blank to stay local-only.
        </Text>

        <View style={[globalStyles.glassCard, styles.card]}>
          <Text style={globalStyles.label}>Backend base URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://your-api.azurecontainerapps.io"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={baseUrl}
            onChangeText={setBaseUrl}
          />
          <Text style={styles.hint}>No trailing slash. Must expose PUT /api/v1/diet/day</Text>
        </View>

        <View style={[globalStyles.glassCard, styles.card]}>
          <Text style={globalStyles.label}>API key (x-api-key)</Text>
          <TextInput
            style={styles.input}
            placeholder="Shared secret configured on the server"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            secureTextEntry
            value={apiKey}
            onChangeText={setApiKey}
          />
        </View>

        <View style={[globalStyles.glassCard, styles.card]}>
          <Text style={globalStyles.label}>Home workout web URL</Text>
          <TextInput
            style={styles.input}
            placeholder="http://localhost:5173"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={workoutWebUrl}
            onChangeText={setWorkoutWebUrl}
          />
          <Text style={styles.hint}>Shown on the meal log screen as the primary button.</Text>
        </View>

        <TouchableOpacity style={globalStyles.primaryButton} onPress={() => void onSave()} activeOpacity={0.9}>
          <Text style={globalStyles.primaryButtonText}>Save settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  scroll: { paddingBottom: 32 },
  back: { alignSelf: 'flex-start', marginBottom: 12, paddingVertical: 4 },
  backText: { color: theme.accent, fontSize: 15, fontWeight: '600' },
  card: { marginTop: 14 },
  input: {
    backgroundColor: theme.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.borderGlass,
    color: theme.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 8,
  },
  hint: {
    color: theme.textMuted,
    fontSize: 11,
    marginTop: 8,
    lineHeight: 15,
  },
});
