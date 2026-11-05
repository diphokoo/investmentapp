import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/lib/auth-context';

interface Props { onLoginSuccess?: () => void; }

export default function LoginForm({ onLoginSuccess }: Props) {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPw] = useState(false);
  const [focused, setFocused]     = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;
    const ok = await login(email.trim().toLowerCase(), password);
    if (ok) onLoginSuccess?.();
  };

  return (
    <View style={styles.container}>
      {/* Email */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputWrapper, focused === 'email' && styles.inputWrapperFocused]}>
          <Ionicons name="mail-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#cbd5e1"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={v => { setEmail(v); clearError(); }}
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
            style={[styles.input, { flex: 1 }]}
            placeholder="••••••••"
            placeholderTextColor="#cbd5e1"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={v => { setPassword(v); clearError(); }}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
          />
          <Pressable onPress={() => setShowPw(v => !v)} style={styles.iconRight}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </Pressable>
        </View>
      </View>

      {/* Forgot */}
      <View style={styles.row}>
        <View />
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Sign In Button */}
      <TouchableOpacity
        style={[styles.button, (!email || !password || loading) && styles.buttonDisabled]}
        activeOpacity={0.85}
        onPress={handleSignIn}
        disabled={!email || !password || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.buttonText}>Sign In</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { gap: 16 },
  fieldGroup:         { gap: 6 },
  label:              { fontSize: 12, color: '#64748b', fontWeight: '500', letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 12, height: 50,
  },
  inputWrapperFocused: {
    borderColor: '#16a34a',
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 2,
  },
  iconLeft:       { marginRight: 10 },
  iconRight:      { padding: 4 },
  input:          { flex: 1, fontSize: 15, color: '#1e293b' },
  row:            { flexDirection: 'row', justifyContent: 'flex-end' },
  forgotText:     { fontSize: 13, color: '#16a34a', fontWeight: '600' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText:      { flex: 1, fontSize: 12, color: '#dc2626' },
  button: {
    height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText:     { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
