import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import InputField from './shared/InputField';
import SubScreenShell from './shared/SubScreenShell';
import ToggleRow from './shared/ToggleRow';

interface Props { onBack: () => void }

export default function SecurityScreen({ onBack }: Props) {
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [twoFA, setTwoFA]               = useState(false);
  const [pin, setPin]                   = useState(['', '', '', '', '', '']);
  const pinRefs                         = useRef<(TextInput | null)[]>([]);

  const handlePin = (text: string, i: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...pin]; next[i] = digit; setPin(next);
    if (digit && i < 5) pinRefs.current[i + 1]?.focus();
  };
  const handlePinKey = (key: string, i: number) => {
    if (key === 'Backspace' && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };

  return (
    <SubScreenShell title="Security" onBack={onBack}>

      {/* Change Password */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Change Password</Text>
        <View style={styles.pwRow}>
          <InputField
            label="Current Password"
            placeholder="••••••••"
            secureTextEntry={!showCurrent}
            style={styles.pwInput}
          />
          <Pressable style={styles.eyeBtn} onPress={() => setShowCurrent(v => !v)}>
            <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </Pressable>
        </View>
        <View style={styles.pwRow}>
          <InputField
            label="New Password"
            placeholder="••••••••"
            secureTextEntry={!showNew}
            style={styles.pwInput}
          />
          <Pressable style={styles.eyeBtn} onPress={() => setShowNew(v => !v)}>
            <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </Pressable>
        </View>
      </View>

      {/* Transaction PIN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transaction PIN</Text>
        <Text style={styles.cardSub}>Enter a new 6-digit PIN</Text>
        <View style={styles.pinRow}>
          {pin.map((d, i) => (
            <TextInput
              key={i}
              ref={el => { pinRefs.current[i] = el; }}
              style={styles.pinBox}
              value={d}
              onChangeText={t => handlePin(t, i)}
              onKeyPress={({ nativeEvent }) => handlePinKey(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              textAlign="center"
            />
          ))}
        </View>
      </View>

      {/* 2FA */}
      <View style={styles.card}>
        <ToggleRow
          icon="shield-checkmark-outline"
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          label="Two-Factor Authentication"
          value={twoFA}
          onToggle={setTwoFA}
          hideBorder
        />
      </View>

      {/* Update button */}
      <TouchableOpacity activeOpacity={0.85} style={styles.btnWrap}>
        <LinearGradient colors={['#1d4ed8', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          <Text style={styles.btnText}>Update Security</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  cardSub:   { fontSize: 12, color: '#94a3b8', marginTop: -8 },
  pwRow:     { position: 'relative' },
  pwInput:   { paddingRight: 44 },
  eyeBtn: {
    position: 'absolute', right: 14, bottom: 14,
  },
  pinRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  pinBox: {
    width: 46, height: 52, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc', fontSize: 20,
    fontWeight: '700', color: '#1e293b',
  },
  btnWrap: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  btn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
