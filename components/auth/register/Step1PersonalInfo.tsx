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
import { RegData } from '../RegisterForm';

interface Props {
  data: RegData;
  onChange: (patch: Partial<RegData>) => void;
  onNext: () => Promise<void>;
  loading: boolean;
  error: string;
}

function field(
  label: string,
  icon: string,
  placeholder: string,
  value: string,
  onChangeText: (v: string) => void,
  focused: string,
  setFocused: (v: string) => void,
  id: string,
  extra?: object,
  error?: string,
  rightIcon?: React.ReactNode,
) {
  return (
    <View style={styles.fieldGroup} key={id}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, focused === id && styles.inputWrapperFocused, !!error && styles.inputWrapperError]}>
        <Ionicons name={icon as any} size={18} color="#94a3b8" style={styles.iconLeft} />
        <TextInput
          style={[styles.input, rightIcon ? { flex: 1 } : null]}
          placeholder={placeholder}
          placeholderTextColor="#cbd5e1"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused('')}
          {...extra}
        />
        {rightIcon}
      </View>
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

function validateSAID(id: string) {
  if (id.length !== 13 || !/^\d{13}$/.test(id)) return false;
  // Luhn check
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let d = parseInt(id[i]);
    if (i % 2 !== 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

export default function Step1PersonalInfo({ data, onChange, onNext, loading, error }: Props) {
  const [focused, setFocused] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof RegData, string>>>({});

  const validate = () => {
    const e: Partial<Record<keyof RegData, string>> = {};
    if (!data.fullName.trim())                          e.fullName    = 'Full name is required';
    if (!validateSAID(data.idNumber))                   e.idNumber    = 'Enter a valid 13-digit SA ID number';
    if (!/^0[6-8]\d{8}$/.test(data.mobile))            e.mobile      = 'Enter a valid SA mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email      = 'Enter a valid email address';
    if (data.password.length < 8)                       e.password    = 'Password must be at least 8 characters';
    if (data.password !== data.confirmPassword)         e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    await onNext();
  };

  return (
    <View style={styles.wrap}>
      {field('Full Name', 'person-outline', 'John Doe',
        data.fullName, v => onChange({ fullName: v }), focused, setFocused, 'fullName',
        { autoCapitalize: 'words' }, errors.fullName)}

      {field('South African ID Number', 'finger-print-outline', '8001015009087',
        data.idNumber, v => onChange({ idNumber: v.replace(/\D/g, '').slice(0, 13) }),
        focused, setFocused, 'idNumber',
        { keyboardType: 'number-pad', maxLength: 13 }, errors.idNumber)}

      {field('Mobile Number', 'call-outline', '0821234567',
        data.mobile, v => onChange({ mobile: v.replace(/\D/g, '').slice(0, 10) }),
        focused, setFocused, 'mobile',
        { keyboardType: 'phone-pad', maxLength: 10 }, errors.mobile)}

      {field('Email Address', 'mail-outline', 'you@example.com',
        data.email, v => onChange({ email: v.trim().toLowerCase() }),
        focused, setFocused, 'email',
        { keyboardType: 'email-address', autoCapitalize: 'none' }, errors.email)}

      {/* Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Create Password</Text>
        <View style={[styles.inputWrapper, focused === 'password' && styles.inputWrapperFocused, !!errors.password && styles.inputWrapperError]}>
          <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Min 8 characters"
            placeholderTextColor="#cbd5e1"
            secureTextEntry={!showPw}
            value={data.password}
            onChangeText={v => onChange({ password: v })}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
          />
          <Pressable onPress={() => setShowPw(v => !v)} style={styles.iconRight}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </Pressable>
        </View>
        {!!errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
      </View>

      {/* Confirm Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={[styles.inputWrapper, focused === 'confirmPassword' && styles.inputWrapperFocused, !!errors.confirmPassword && styles.inputWrapperError]}>
          <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Re-enter password"
            placeholderTextColor="#cbd5e1"
            secureTextEntry={!showCpw}
            value={data.confirmPassword}
            onChangeText={v => onChange({ confirmPassword: v })}
            onFocus={() => setFocused('confirmPassword')}
            onBlur={() => setFocused('')}
          />
          <Pressable onPress={() => setShowCpw(v => !v)} style={styles.iconRight}>
            <Ionicons name={showCpw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </Pressable>
        </View>
        {!!errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleNext}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <>
              <Text style={styles.btnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:               { gap: 14 },
  fieldGroup:         { gap: 6 },
  label:              { fontSize: 12, color: '#64748b', fontWeight: '600', letterSpacing: 0.3 },
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
  inputWrapperError: { borderColor: '#dc2626' },
  iconLeft:    { marginRight: 10 },
  iconRight:   { padding: 4 },
  input:       { flex: 1, fontSize: 15, color: '#1e293b' },
  fieldError:  { fontSize: 11, color: '#dc2626', marginTop: 2 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { flex: 1, fontSize: 12, color: '#dc2626' },
  btn: {
    height: 52, borderRadius: 14, backgroundColor: '#16a34a',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5, marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
