
import { useAuth } from '@/lib/auth-context';
import {
  completePasswordReset,
  requestPasswordReset,
  verifyPasswordResetOtp,
} from '@/lib/supabase';
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

type ResetStep = 'login' | 'email' | 'otp' | 'password';

interface Props {
  onLoginSuccess?: () => void;
  onForgotPassword?: () => void;
}

export default function LoginForm({
  onLoginSuccess,
}: Props) {
  const { login, loading, error, clearError } = useAuth();

  const [step, setStep] = useState<ResetStep>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPw] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [requestId, setRequestId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;

    const ok = await login(email.trim().toLowerCase(), password);

    if (ok) onLoginSuccess?.();
  };

  const openForgotPassword = () => {
    setResetError('');
    setResetMessage('');
    setStep('email');
  };

  const backToLogin = () => {
    setStep('login');
    setResetError('');
    setResetMessage('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetToken('');
    setRequestId('');
  };

  const handleRequestCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setResetError('Please enter your email address.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      const id = await requestPasswordReset(normalizedEmail);

      setRequestId(id);
      setStep('otp');
      setResetMessage(
        'If an account exists for this email, a verification code has been sent.',
      );
    } catch (err) {
      setResetError(
        err instanceof Error
          ? err.message
          : 'Unable to request a password reset. Please try again.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setResetError('Please enter the six-digit verification code.');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const token = await verifyPasswordResetOtp(requestId, otp.trim());

      setResetToken(token);
      setStep('password');
    } catch (err) {
      setResetError(
        err instanceof Error
          ? err.message
          : 'Invalid or expired verification code.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleCompleteReset = async () => {
    if (newPassword.length < 8) {
      setResetError('Your password must contain at least 8 characters.');
      return;
    }

    if (newPassword.length > 128) {
      setResetError('Your password cannot exceed 128 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Your passwords do not match.');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      await completePasswordReset(
        requestId,
        resetToken,
        newPassword,
      );

      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setResetToken('');
      setRequestId('');
      setStep('login');
      setResetMessage('Your password has been reset successfully. You can now sign in.');
    } catch (err) {
      setResetError(
        err instanceof Error
          ? err.message
          : 'Unable to reset your password. Please try again.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  const renderError = (message: string) => (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );

  const renderMessage = (message: string) => (
    <View style={styles.messageBox}>
      <Ionicons name="checkmark-circle-outline" size={17} color="#16a34a" />
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );

  const renderButton = (
    label: string,
    onPress: () => void,
    disabled = false,
  ) => (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
    >
      {resetLoading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* LOGIN */}
      {step === 'login' && (
        <>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>

            <View style={[
              styles.inputWrapper,
              focused === 'email' && styles.inputWrapperFocused,
            ]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#94a3b8"
                style={styles.iconLeft}
              />

              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#cbd5e1"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={v => {
                  setEmail(v);
                  clearError();
                  setResetMessage('');
                }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={[
              styles.inputWrapper,
              focused === 'password' && styles.inputWrapperFocused,
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#94a3b8"
                style={styles.iconLeft}
              />

              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={v => {
                  setPassword(v);
                  clearError();
                }}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />

              <Pressable
                onPress={() => setShowPw(v => !v)}
                style={styles.iconRight}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#94a3b8"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.row}>
            <View />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openForgotPassword}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {!!error && renderError(error)}
          {!!resetMessage && renderMessage(resetMessage)}

          <TouchableOpacity
            style={[
              styles.button,
              (!email || !password || loading) && styles.buttonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSignIn}
            disabled={!email || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* REQUEST PASSWORD RESET */}
      {step === 'email' && (
        <>
          <View style={styles.headingGroup}>
            <Text style={styles.heading}>Forgot Password?</Text>
            <Text style={styles.description}>
              Enter your registered email address and well send you a
              verification code.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>

            <View style={[
              styles.inputWrapper,
              focused === 'resetEmail' && styles.inputWrapperFocused,
            ]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#94a3b8"
                style={styles.iconLeft}
              />

              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#cbd5e1"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={v => {
                  setEmail(v);
                  setResetError('');
                }}
                onFocus={() => setFocused('resetEmail')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {!!resetError && renderError(resetError)}

          {renderButton(
            'Send Verification Code',
            handleRequestCode,
            resetLoading || !email.trim(),
          )}

          <TouchableOpacity onPress={backToLogin} style={styles.backButton}>
            <Ionicons name="arrow-back" size={16} color="#16a34a" />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>
        </>
      )}

      {/* VERIFY OTP */}
      {step === 'otp' && (
        <>
          <View style={styles.headingGroup}>
            <Text style={styles.heading}>Verify Your Email</Text>
            <Text style={styles.description}>
              Enter the six-digit verification code sent to {email}.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Verification Code</Text>

            <View style={[
              styles.inputWrapper,
              focused === 'otp' && styles.inputWrapperFocused,
            ]}>
              <Ionicons
                name="keypad-outline"
                size={18}
                color="#94a3b8"
                style={styles.iconLeft}
              />

              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor="#cbd5e1"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={v => {
                  setOtp(v.replace(/\D/g, ''));
                  setResetError('');
                }}
                onFocus={() => setFocused('otp')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {!!resetMessage && renderMessage(resetMessage)}
          {!!resetError && renderError(resetError)}

          {renderButton(
            'Verify Code',
            handleVerifyOtp,
            resetLoading || otp.length !== 6,
          )}

          <TouchableOpacity
            onPress={() => {
              setStep('email');
              setOtp('');
              setResetError('');
              setResetMessage('');
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={16} color="#16a34a" />
            <Text style={styles.backText}>Change Email Address</Text>
          </TouchableOpacity>
        </>
      )}

      {/* NEW PASSWORD */}
      {step === 'password' && (
        <>
          <View style={styles.headingGroup}>
            <Text style={styles.heading}>Create New Password</Text>
            <Text style={styles.description}>
              Choose a new password containing at least 8 characters.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New Password</Text>

            <View style={[
              styles.inputWrapper,
              focused === 'newPassword' && styles.inputWrapperFocused,
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#94a3b8"
                style={styles.iconLeft}
              />

              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter new password"
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={v => {
                  setNewPassword(v);
                  setResetError('');
                }}
                onFocus={() => setFocused('newPassword')}
                onBlur={() => setFocused(null)}
              />

              <Pressable
                onPress={() => setShowNewPassword(v => !v)}
                style={styles.iconRight}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#94a3b8"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm New Password</Text>

            <View style={[
              styles.inputWrapper,
              focused === 'confirmPassword' && styles.inputWrapperFocused,
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#94a3b8"
                style={styles.iconLeft}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!showNewPassword}
                value={confirmPassword}
                onChangeText={v => {
                  setConfirmPassword(v);
                  setResetError('');
                }}
                onFocus={() => setFocused('confirmPassword')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {!!resetError && renderError(resetError)}

          {renderButton(
            'Reset Password',
            handleCompleteReset,
            resetLoading || !newPassword || !confirmPassword,
          )}

          <TouchableOpacity
            onPress={() => {
              setStep('otp');
              setResetError('');
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={16} color="#16a34a" />
            <Text style={styles.backText}>Back to Verification</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
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
    borderColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  iconLeft: { marginRight: 10 },
  iconRight: { padding: 4 },
  input: { flex: 1, fontSize: 15, color: '#1e293b' },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  forgotText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { flex: 1, fontSize: 12, color: '#dc2626' },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  messageText: { flex: 1, fontSize: 12, color: '#166534' },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headingGroup: { gap: 6 },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
});