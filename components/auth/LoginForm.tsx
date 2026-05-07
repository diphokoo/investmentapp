import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props { onLoginSuccess?: () => void; }

export default function LoginForm({ onLoginSuccess }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (field: string) => [
    styles.input,
    focused === field && styles.inputFocused,
  ];

  return (
    <View style={styles.container}>
      {/* Email */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email or Username</Text>
        <View style={[styles.inputWrapper, focused === 'email' && styles.inputWrapperFocused]}>
          <Ionicons name="person-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={inputStyle('email')}
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
        <Text style={styles.label}>Password</Text>
        <View style={[styles.inputWrapper, focused === 'password' && styles.inputWrapperFocused]}>
          <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={[inputStyle('password'), { flex: 1 }]}
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

      {/* Remember Me + Forgot */}
      <View style={styles.row}>
        <Pressable style={styles.checkRow} onPress={() => setRememberMe(v => !v)}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
          <Text style={styles.checkLabel}>Remember me</Text>
        </Pressable>
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={onLoginSuccess}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
          <Ionicons name="logo-google" size={18} color="#4285F4" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
          <Ionicons name="logo-apple" size={18} color="#000" />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 12, color: '#64748b', fontWeight: '500', letterSpacing: 0.3 },
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
  inputFocused: {},
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  checkLabel: { fontSize: 13, color: '#64748b' },
  forgotText: { fontSize: 13, color: '#3b82f6', fontWeight: '600' },
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
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  socialText: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
});
