import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SubScreenShell from './shared/SubScreenShell';

interface Props { onBack: () => void }

const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English' },
  { code: 'af', label: 'Afrikaans',  native: 'Afrikaans' },
  { code: 'zu', label: 'Zulu',       native: 'isiZulu' },
  { code: 'fr', label: 'French',     native: 'Français' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'es', label: 'Spanish',    native: 'Español' },
];

export default function LanguageScreen({ onBack }: Props) {
  const [selected, setSelected] = useState('en');

  return (
    <SubScreenShell title="Language" onBack={onBack}>
      <Text style={styles.hint}>Select your preferred display language.</Text>

      <View style={styles.card}>
        {LANGUAGES.map((lang, i) => {
          const active = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.row, i === LANGUAGES.length - 1 && styles.noBorder]}
              onPress={() => setSelected(lang.code)}
              activeOpacity={0.65}
            >
              <View style={styles.labelGroup}>
                <Text style={[styles.langLabel, active && styles.langLabelActive]}>{lang.label}</Text>
                <Text style={styles.langNative}>{lang.native}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
              {active && (
                <Ionicons name="checkmark-circle" size={20} color="#2563eb" style={styles.check} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  noBorder: { borderBottomWidth: 0 },
  labelGroup: { flex: 1, gap: 2 },
  langLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
  langLabelActive: { color: '#1e293b' },
  langNative: { fontSize: 12, color: '#94a3b8' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#cbd5e1',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#2563eb' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb' },
  check: { marginLeft: 8 },
});
