import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const pinRefs = useRef<(TextInput | null)[]>([]);

  const handlePinChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...pin];
    next[index] = digit;
    setPin(next);
    if (digit && index < 5) pinRefs.current[index + 1]?.focus();
  };

  const handlePinKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const wrapperStyle = (field: string) => [
    styles.inputWrapper,
    focused === field && styles.inputWrapperFocused,
  ];

  return (
    <View style={styles.container}>
      {/* Username */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Username</Text>
        <View style={wrapperStyle('username')}>
          <Ionicons name="at-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={styles.input}
            placeholder="johndoe"
            placeholderTextColor="#cbd5e1"
            autoCapitalize="none"
            onFocus={() => setFocused('username')}
            onBlur={() => setFocused(null)}
          />
        </View>
      </View>

      {/* Email */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={wrapperStyle('email')}>
          <Ionicons name="mail-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#cbd5e1"
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
          />
        </View>
      </View>

      {/* Password */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Password</Text>
          <Text style={styles.hint}>min 8 characters</Text>
        </View>
        <View style={wrapperStyle('password')}>
          <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="••••••••"
            placeholderTextColor="#cbd5e1"
            secureTextEntry={!showPassword}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
          />
          <Pressable onPress={() => setShowPassword(v => !v)} style={styles.iconRight}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </Pressable>
        </View>
      </View>

      {/* Transaction PIN */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Transaction PIN</Text>
        <View style={styles.pinRow}>
          {pin.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { pinRefs.current[i] = el; }}
              style={[styles.pinBox, focused === `pin${i}` && styles.pinBoxFocused]}
              value={digit}
              onChangeText={text => handlePinChange(text, i)}
              onKeyPress={({ nativeEvent }) => handlePinKeyPress(nativeEvent.key, i)}
              onFocus={() => setFocused(`pin${i}`)}
              onBlur={() => setFocused(null)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              textAlign="center"
            />
          ))}
        </View>
      </View>

      {/* Create Account Button */}
      <TouchableOpacity style={styles.button} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  fieldGroup: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, color: '#64748b', fontWeight: '500', letterSpacing: 0.3 },
  hint: { fontSize: 11, color: '#94a3b8' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 50,
  },
  inputWrapperFocused: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  iconLeft: { marginRight: 10 },
  iconRight: { padding: 4 },
  input: { flex: 1, fontSize: 15, color: '#1e293b' },
  pinRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  pinBox: {
    width: 48,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: 20,
    color: '#1e293b',
    fontWeight: '700',
  },
  pinBoxFocused: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
