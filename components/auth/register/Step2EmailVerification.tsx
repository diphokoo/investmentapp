import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInput as TextInputType,
} from 'react-native';

interface Props {
  email: string;
  onVerified: () => void;
  onBack: () => void;
  onResend: () => Promise<void>;
  onVerify: (otp: string) => Promise<void>;
  onCorrectEmail: (newEmail: string) => Promise<void>;
  loading: boolean;
  error: string;
}

const RESEND_SECONDS = 60;

export default function Step2EmailVerification({
  email, onVerified, onBack, onResend, onVerify, onCorrectEmail, loading, error,
}: Props) {
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown]   = useState(RESEND_SECONDS);
  const [resending, setResending]   = useState(false);
  const [editEmail, setEditEmail]   = useState(false);
  const [newEmail, setNewEmail]     = useState(email);
  const [emailError, setEmailError] = useState('');
  const refs = useRef<(React.ElementRef<typeof TextInput> | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigit = (text: string, i: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleBackspace = (key: string, i: number) => {
    if (key === 'Backspace' && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    await onVerify(code);
  };

  const handleResend = async () => {
    setResending(true);
    setOtp(['', '', '', '', '', '']);
    await onResend();
    setCountdown(RESEND_SECONDS);
    setResending(false);
    refs.current[0]?.focus();
  };

  const handleSaveEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    await onCorrectEmail(newEmail);
    setEditEmail(false);
    setOtp(['', '', '', '', '', '']);
    setCountdown(RESEND_SECONDS);
  };

  if (editEmail) {
    return (
      <View style={styles.wrap}>
        <TouchableOpacity style={styles.backRow} onPress={() => setEditEmail(false)}>
          <Ionicons name="arrow-back" size={18} color="#16a34a" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Correct Email Address</Text>
        <Text style={styles.sub}>Enter the correct email address to receive your verification code.</Text>
        <View style={[styles.inputWrapper, !!emailError && styles.inputWrapperError]}>
          <Ionicons name="mail-outline" size={18} color="#94a3b8" style={styles.iconLeft} />
          <TextInput
            style={styles.input}
            value={newEmail}
            onChangeText={v => { setNewEmail(v.trim().toLowerCase()); setEmailError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
            placeholderTextColor="#cbd5e1"
            placeholder="you@example.com"
          />
        </View>
        {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}
        <TouchableOpacity style={styles.btn} onPress={handleSaveEmail} activeOpacity={0.85}>
          <Text style={styles.btnText}>Update & Resend Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const otpComplete = otp.every(d => d !== '');

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backRow} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#16a34a" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.iconWrap}>
        <Ionicons name="mail-unread-outline" size={40} color="#16a34a" />
      </View>

      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.sub}>
        We sent a 6-digit code to{'\n'}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={el => { refs.current[i] = el; }}
            style={[styles.otpBox, digit && styles.otpBoxFilled]}
            value={digit}
            onChangeText={t => handleDigit(t, i)}
            onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, (!otpComplete || loading) && styles.btnDisabled]}
        onPress={handleVerify}
        disabled={!otpComplete || loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.btnText}>Verify</Text>
        }
      </TouchableOpacity>

      <View style={styles.resendRow}>
        {countdown > 0
          ? <Text style={styles.countdownText}>Resend code in {countdown}s</Text>
          : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending
                ? <ActivityIndicator color="#16a34a" size="small" />
                : <Text style={styles.resendText}>Resend Code</Text>
              }
            </TouchableOpacity>
          )
        }
      </View>

      <TouchableOpacity onPress={() => setEditEmail(true)} style={styles.correctEmailBtn}>
        <Ionicons name="create-outline" size={14} color="#16a34a" />
        <Text style={styles.correctEmailText}>Wrong email? Correct it here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:        { gap: 16, alignItems: 'center' },
  backRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText:    { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  iconWrap:    { width: 72, height: 72, borderRadius: 36, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  title:       { fontSize: 18, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  sub:         { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  emailHighlight: { fontWeight: '700', color: '#16a34a' },
  otpRow:      { flexDirection: 'row', gap: 10, marginVertical: 4 },
  otpBox: {
    width: 46, height: 54, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: 22, fontWeight: '700', color: '#1e293b',
  },
  otpBoxFilled: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fecaca', width: '100%',
  },
  errorText:   { flex: 1, fontSize: 12, color: '#dc2626' },
  btn: {
    height: 52, borderRadius: 14, backgroundColor: '#16a34a',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
    width: '100%',
  },
  btnDisabled:  { opacity: 0.5 },
  btnText:      { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  resendRow:    { height: 28, alignItems: 'center', justifyContent: 'center' },
  countdownText: { fontSize: 13, color: '#94a3b8' },
  resendText:   { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  correctEmailBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  correctEmailText: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 12, height: 50, width: '100%',
  },
  inputWrapperError: { borderColor: '#dc2626' },
  iconLeft:    { marginRight: 10 },
  input:       { flex: 1, fontSize: 15, color: '#1e293b' },
  fieldError:  { fontSize: 11, color: '#dc2626', alignSelf: 'flex-start' },
});
