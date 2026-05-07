import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  label?: string;
  onComplete?: (pin: string) => void;
}

export default function TransactionPINInput({ label = 'Enter Transaction PIN', onComplete }: Props) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, i: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...pin];
    next[i] = digit;
    setPin(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d !== '') && onComplete) onComplete(next.join(''));
  };

  const handleKey = (key: string, i: number) => {
    if (key === 'Backspace' && !pin[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {pin.map((d, i) => (
          <TextInput
            key={i}
            ref={el => { refs.current[i] = el; }}
            style={[styles.box, d && styles.boxFilled]}
            value={d}
            onChangeText={t => handleChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            secureTextEntry
            textAlign="center"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569' },
  row: { flexDirection: 'row', gap: 10 },
  box: {
    width: 48, height: 54, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc', fontSize: 22,
    color: '#1e293b', fontWeight: '800',
  },
  boxFilled: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
});
