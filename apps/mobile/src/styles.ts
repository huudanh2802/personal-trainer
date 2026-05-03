import { Platform, StyleSheet } from 'react-native';

export const theme = {
  bg: '#0d0f14',
  bgElevated: '#151923',
  bgGlass: 'rgba(35, 42, 58, 0.72)',
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  accent: '#5b9dff',
  accentSoft: 'rgba(91, 157, 255, 0.18)',
  success: '#4ade80',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  ringTrack: 'rgba(255, 255, 255, 0.1)',
  ringFill: '#5b9dff',
  danger: '#f87171',
} as const;

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  glassCard: {
    backgroundColor: theme.bgGlass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.borderGlass,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  title: {
    color: theme.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 15,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: theme.text,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.bg,
    fontWeight: '700',
    fontSize: 16,
  },
  label: {
    color: theme.textMuted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
});
