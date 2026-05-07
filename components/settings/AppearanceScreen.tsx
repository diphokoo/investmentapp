import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SubScreenShell from './shared/SubScreenShell';

interface Props { onBack: () => void }

const THEMES = [
  {
    key: 'light',
    label: 'Light Mode',
    icon: 'sunny-outline',
    preview: { bg: '#f0f4f8', card: '#ffffff', text: '#1e293b', accent: '#2563eb' },
  },
  {
    key: 'dark',
    label: 'Dark Mode',
    icon: 'moon-outline',
    preview: { bg: '#0f172a', card: '#1e293b', text: '#f1f5f9', accent: '#3b82f6' },
  },
] as const;

function ThemePreview({ theme, active, onSelect }: {
  theme: typeof THEMES[number]; active: boolean; onSelect: () => void;
}) {
  const p = theme.preview;
  return (
    <TouchableOpacity
      style={[styles.previewWrap, active && styles.previewActive]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {/* Mini mockup */}
      <View style={[styles.mockup, { backgroundColor: p.bg }]}>
        <View style={[styles.mockCard, { backgroundColor: p.card }]}>
          <View style={[styles.mockBar, { backgroundColor: p.accent, width: '60%' }]} />
          <View style={[styles.mockBar, { backgroundColor: p.text, opacity: 0.2, width: '40%' }]} />
        </View>
        <View style={[styles.mockCard, { backgroundColor: p.card, marginTop: 6 }]}>
          <View style={[styles.mockBar, { backgroundColor: p.text, opacity: 0.15, width: '80%' }]} />
          <View style={[styles.mockBar, { backgroundColor: p.text, opacity: 0.1, width: '55%' }]} />
        </View>
      </View>

      {/* Label row */}
      <View style={styles.previewLabel}>
        <Ionicons name={theme.icon} size={16} color={active ? '#2563eb' : '#94a3b8'} />
        <Text style={[styles.previewText, active && styles.previewTextActive]}>{theme.label}</Text>
        {active && (
          <View style={styles.activeDot}>
            <Ionicons name="checkmark" size={11} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AppearanceScreen({ onBack }: Props) {
  const [selected, setSelected] = useState<'light' | 'dark'>('light');

  return (
    <SubScreenShell title="Appearance" onBack={onBack}>
      <Text style={styles.hint}>Choose a theme that suits your style.</Text>

      <View style={styles.grid}>
        {THEMES.map(t => (
          <ThemePreview
            key={t.key}
            theme={t}
            active={selected === t.key}
            onSelect={() => setSelected(t.key)}
          />
        ))}
      </View>

      {/* Active info */}
      <LinearGradient
        colors={selected === 'dark' ? ['#0f172a', '#1e293b'] : ['#eff6ff', '#dbeafe']}
        style={styles.infoBanner}
      >
        <Ionicons
          name={selected === 'dark' ? 'moon' : 'sunny'}
          size={20}
          color={selected === 'dark' ? '#93c5fd' : '#2563eb'}
        />
        <Text style={[styles.infoText, selected === 'dark' && styles.infoTextDark]}>
          {selected === 'dark' ? 'Dark mode is active' : 'Light mode is active'}
        </Text>
      </LinearGradient>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  grid: { flexDirection: 'row', gap: 14 },
  previewWrap: {
    flex: 1, borderRadius: 18, overflow: 'hidden',
    borderWidth: 2, borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  previewActive: {
    borderColor: '#2563eb',
    shadowColor: '#2563eb', shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  mockup: { padding: 12, gap: 0 },
  mockCard: { borderRadius: 8, padding: 10, gap: 6 },
  mockBar: { height: 6, borderRadius: 3 },
  previewLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  previewText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  previewTextActive: { color: '#1e293b' },
  activeDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
  },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, padding: 16,
  },
  infoText: { fontSize: 14, fontWeight: '600', color: '#1d4ed8' },
  infoTextDark: { color: '#93c5fd' },
});
