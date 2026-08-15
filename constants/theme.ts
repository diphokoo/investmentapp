import { Platform } from 'react-native';

export const Colors = {
  primary: '#16a34a',
  primaryDark: '#14532d',
  primaryLight: '#4ade80',
  accent: '#06b6d4',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
  bg: '#f0f4f8',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  gradient: ['#14532d', '#16a34a', '#4ade80'] as const,
};

export const Radius = { sm: 10, md: 14, lg: 18, xl: 22 };

export const Shadow = {
  card: {
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  strong: {
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
});
