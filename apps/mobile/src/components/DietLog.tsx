import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
  Platform,
  Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import { globalStyles, theme } from '../styles';
import { getStoredApiConfig, pushDietDay } from '../services/mealApi';

const STORAGE_CALORIES = '@personal_trainer/diet_calories';
const STORAGE_DAY = '@personal_trainer/diet_day';
const STORAGE_CALORIES_HISTORY = '@personal_trainer/diet_calories_history';
const DAILY_GOAL = 2000;
const MAX_MEAL_PHOTOS = 3;

const CHATGPT_MEAL_PROMPT = `I'm logging dietary calories for one meal or snack.

After this message I will attach a clear photo of the food/drink.

Please:
1. Estimate **total calories (kcal)** for everything clearly visible. If part of the meal is hidden or ambiguous, say so and give a reasonable range.
2. On the **first line of your reply**, output ONLY this exact format so I can scan it quickly:
   TOTAL_KCAL: <whole number>
3. Below that, add a short bullet list: each visible item with an approximate kcal contribution.
4. Be conservative if you are unsure; note if the photo is too blurry to trust.

No need for long introductions-focus on the number and the breakdown.`;

const CHATGPT_END_OF_DAY_PROMPT = `I am sending one merged image that contains Meal 1, Meal 2, and Meal 3 from my day.

Please:
1) Estimate total daily calories for all meals in the merged image.
2) First line ONLY in this format:
TOTAL_KCAL: <whole number>
3) Then provide a short breakdown by meal and visible food items.
4) If uncertain, provide a reasonable range and explain assumptions briefly.`;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type NumberByDate = Record<string, number>;

export default function DietLog() {
  const [input, setInput] = useState('');
  const [consumed, setConsumed] = useState(0);
  const [mealPhotos, setMealPhotos] = useState<string[]>([]);
  const [mergedPhotoUri, setMergedPhotoUri] = useState<string | null>(null);
  const collageRef = useRef<View>(null);

  const load = useCallback(async () => {
    try {
      const [raw, day] = await Promise.all([
        AsyncStorage.getItem(STORAGE_CALORIES),
        AsyncStorage.getItem(STORAGE_DAY),
      ]);
      const k = todayKey();
      if (day !== k) {
        await AsyncStorage.multiSet([
          [STORAGE_CALORIES, '0'],
          [STORAGE_DAY, k],
        ]);
        setConsumed(0);
        return;
      }
      setConsumed(raw != null ? parseInt(raw, 10) || 0 : 0);
    } catch {
      setConsumed(0);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (next: number) => {
    const k = todayKey();
    let history: NumberByDate = {};
    try {
      const rawHistory = await AsyncStorage.getItem(STORAGE_CALORIES_HISTORY);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          history = parsed as NumberByDate;
        }
      }
    } catch {
      history = {};
    }
    history[k] = next;
    await AsyncStorage.multiSet([
      [STORAGE_CALORIES, String(next)],
      [STORAGE_DAY, k],
      [STORAGE_CALORIES_HISTORY, JSON.stringify(history)],
    ]);
    setConsumed(next);

    const cfg = await getStoredApiConfig((key) => AsyncStorage.getItem(key));
    const result = await pushDietDay(cfg.baseUrl, cfg.apiKey, {
      date: k,
      caloriesConsumed: next,
      caloriesHistory: history,
    });
    if (!result.ok && result.error && cfg.baseUrl) {
      console.warn('Meal sync failed', result.status, result.error);
    }
  };

  const onAdd = async () => {
    Keyboard.dismiss();
    const add = parseInt(input.replace(/[^0-9]/g, ''), 10);
    if (!add || add <= 0) return;
    const next = consumed + add;
    setInput('');
    await persist(next);
  };

  const onCopyChatgptPrompt = async () => {
    try {
      await Clipboard.setStringAsync(CHATGPT_MEAL_PROMPT);
      Alert.alert(
        'Copied for ChatGPT',
        Platform.OS === 'ios'
          ? 'Open ChatGPT -> new chat -> paste. Then tap + and add your meal photo. When you see TOTAL_KCAL, type that number above in "Calories to add".'
          : 'Open ChatGPT -> new chat -> paste. Add your meal photo. When you see TOTAL_KCAL, type that number in "Calories to add".'
      );
    } catch {
      Alert.alert('Could not copy', 'Try selecting and copying the prompt manually from the app source.');
    }
  };

  const takeMealPhoto = async () => {
    if (mealPhotos.length >= MAX_MEAL_PHOTOS) {
      Alert.alert('Limit reached', `You can add up to ${MAX_MEAL_PHOTOS} meal photos before merging.`);
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to capture meal photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.6,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setMealPhotos((prev) => [...prev, result.assets[0].uri]);
    setMergedPhotoUri(null);
  };

  const removeMealPhoto = (idx: number) => {
    setMealPhotos((prev) => prev.filter((_, i) => i !== idx));
    setMergedPhotoUri(null);
  };

  const mergeMealPhotos = async () => {
    if (mealPhotos.length === 0) {
      Alert.alert('No photos yet', 'Capture meal photos first.');
      return;
    }
    if (!collageRef.current) return;
    try {
      const uri = await captureRef(collageRef, {
        format: 'jpg',
        quality: 0.9,
        result: 'tmpfile',
      });
      setMergedPhotoUri(uri);
      Alert.alert('Merged', 'Created one merged image for your end-of-day ChatGPT flow.');
    } catch {
      Alert.alert('Merge failed', 'Could not merge photos. Please try again.');
    }
  };

  const shareMergedToChatgpt = async () => {
    if (!mergedPhotoUri) {
      Alert.alert('No merged image', 'Tap "Merge meal photos" first.');
      return;
    }
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }
    await Sharing.shareAsync(mergedPhotoUri, {
      mimeType: 'image/jpeg',
      dialogTitle: 'Share merged meal image to ChatGPT',
    });
  };

  const copyEndOfDayPrompt = async () => {
    try {
      await Clipboard.setStringAsync(CHATGPT_END_OF_DAY_PROMPT);
      Alert.alert(
        'Prompt copied',
        'Open ChatGPT, paste prompt, attach merged image, then copy TOTAL_KCAL back here.'
      );
    } catch {
      Alert.alert('Copy failed', 'Could not copy prompt.');
    }
  };

  const remaining = Math.max(DAILY_GOAL - consumed, 0);

  return (
    <View style={globalStyles.glassCard}>
      <Text style={globalStyles.label}>Diet log</Text>
      <Text style={styles.summary}>
        Goal {DAILY_GOAL} kcal - Consumed <Text style={styles.summaryStrong}>{consumed}</Text> - Remaining{' '}
        <Text style={styles.summaryStrong}>{remaining}</Text>
      </Text>

      <TouchableOpacity style={styles.chatgptBtn} onPress={onCopyChatgptPrompt} activeOpacity={0.85}>
        <Text style={styles.chatgptBtnTitle}>Copy ChatGPT prompt (meal photo)</Text>
        <Text style={styles.chatgptBtnHint}>
          Paste in a new chat, attach your food photo, then enter the kcal you get back.
        </Text>
      </TouchableOpacity>

      <View style={styles.mealCard}>
        <Text style={styles.mealTitle}>End-of-day meal photo flow</Text>
        <Text style={styles.mealHint}>
          Capture Meal 1, 2, 3 - merge to one image - share to ChatGPT at end of day.
        </Text>

        <TouchableOpacity style={styles.captureBtn} onPress={takeMealPhoto} activeOpacity={0.9}>
          <Text style={styles.captureBtnText}>Take meal photo ({mealPhotos.length}/{MAX_MEAL_PHOTOS})</Text>
        </TouchableOpacity>

        {mealPhotos.map((uri, idx) => (
          <View key={`${uri}-${idx}`} style={styles.photoRow}>
            <Image source={{ uri }} style={styles.photoThumb} />
            <View style={styles.photoMeta}>
              <Text style={styles.photoLabel}>Meal {idx + 1}</Text>
              <TouchableOpacity onPress={() => removeMealPhoto(idx)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View ref={collageRef} style={styles.collage}>
          {[0, 1, 2].map((slot) => (
            <View key={slot} style={styles.collageSlot}>
              {mealPhotos[slot] ? (
                <Image source={{ uri: mealPhotos[slot] }} style={styles.collageImage} />
              ) : (
                <Text style={styles.collagePlaceholder}>Meal {slot + 1}</Text>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.mergeBtn} onPress={mergeMealPhotos} activeOpacity={0.9}>
          <Text style={styles.mergeBtnText}>Merge meal photos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mergeBtn, !mergedPhotoUri && styles.disabledBtn]}
          onPress={shareMergedToChatgpt}
          activeOpacity={0.9}
          disabled={!mergedPhotoUri}
        >
          <Text style={styles.mergeBtnText}>Share merged image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mergeBtn} onPress={copyEndOfDayPrompt} activeOpacity={0.9}>
          <Text style={styles.mergeBtnText}>Copy end-of-day ChatGPT prompt</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' ? (
        <Text style={styles.healthNote}>
          <Text style={styles.healthNoteStrong}>Apple Health: </Text>
          Reading or writing "Dietary Energy" needs Apple&apos;s HealthKit inside a{' '}
          <Text style={styles.healthNoteEm}>custom iOS build</Text>
          (Expo Go does not include HealthKit). Typical path: EAS Build or <Text style={styles.mono}>expo run:ios</Text>
          , then a module such as <Text style={styles.mono}>@kayzmann/expo-healthkit</Text> with the Dietary Energy
          type.
        </Text>
      ) : (
        <Text style={styles.healthNote}>
          <Text style={styles.healthNoteStrong}>Google Health Connect </Text>
          can be used in a similar way (custom Android build + Health Connect APIs). Expo Go won&apos;t see it.
        </Text>
      )}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Calories to add"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={[styles.addBtn, styles.addBtnSpacer]} onPress={onAdd}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        Totals stay on-device; if you configured an API in Settings, each save also syncs to your backend.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  summaryStrong: { color: theme.text, fontWeight: '600' },
  chatgptBtn: {
    backgroundColor: theme.bgElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.accent,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  chatgptBtnTitle: {
    color: theme.accent,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  chatgptBtnHint: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  mealCard: {
    backgroundColor: theme.bgElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.borderGlass,
    padding: 12,
    marginBottom: 12,
  },
  mealTitle: { color: theme.text, fontSize: 15, fontWeight: '700' },
  mealHint: { color: theme.textMuted, fontSize: 12, lineHeight: 16, marginTop: 4, marginBottom: 10 },
  captureBtn: {
    backgroundColor: theme.accentSoft,
    borderWidth: 1,
    borderColor: theme.borderGlass,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  captureBtnText: { color: theme.accent, fontWeight: '700' },
  photoRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  photoThumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: theme.bgGlass },
  photoMeta: { marginLeft: 10, flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  photoLabel: { color: theme.text, fontSize: 13, fontWeight: '600' },
  removeText: { color: theme.danger, fontSize: 12, fontWeight: '700' },
  collage: { marginTop: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.borderGlass },
  collageSlot: { height: 120, backgroundColor: theme.bgGlass, borderBottomWidth: 1, borderBottomColor: theme.borderGlass, justifyContent: 'center', alignItems: 'center' },
  collageImage: { width: '100%', height: '100%' },
  collagePlaceholder: { color: theme.textMuted, fontSize: 13 },
  mergeBtn: {
    marginTop: 10,
    backgroundColor: theme.accentSoft,
    borderWidth: 1,
    borderColor: theme.borderGlass,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  mergeBtnText: { color: theme.accent, fontWeight: '700' },
  disabledBtn: { opacity: 0.5 },
  healthNote: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
  healthNoteStrong: { color: theme.text, fontWeight: '700' },
  healthNoteEm: { fontStyle: 'italic', color: theme.text },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10, color: theme.textMuted },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: theme.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.borderGlass,
    color: theme.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: theme.accentSoft,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.borderGlass,
  },
  addBtnSpacer: { marginLeft: 10 },
  addBtnText: { color: theme.accent, fontWeight: '700' },
  hint: {
    color: theme.textMuted,
    fontSize: 11,
    marginTop: 10,
  },
});
