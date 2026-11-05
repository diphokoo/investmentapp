import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { registerCustomer } from '@/lib/supabase';
import StepIndicator from './register/StepIndicator';
import Step1PersonalInfo from './register/Step1PersonalInfo';
import Step3FICAUpload from './register/Step3FICAUpload';
import Step4Confirmation from './register/Step4Confirmation';

export interface RegData {
  fullName:        string;
  idNumber:        string;
  mobile:          string;
  email:           string;
  password:        string;
  confirmPassword: string;
}

const EMPTY: RegData = {
  fullName: '', idNumber: '', mobile: '',
  email: '', password: '', confirmPassword: '',
};

interface Props { onRegistrationComplete?: () => void; }

export default function RegisterForm({ onRegistrationComplete }: Props) {
  const [step, setStep]                       = useState(0);
  const [data, setData]                       = useState<RegData>(EMPTY);
  const [loading, setLoading]                 = useState(false);
  const [apiError, setApiError]               = useState('');
  const [uploadedId, setUploadedId]           = useState(false);
  const [uploadedAddress, setUploadedAddress] = useState(false);
  const [userId, setUserId]                   = useState('');
  // Prevent duplicate submissions
  const [submitted, setSubmitted] = useState(false);

  const patch = (p: Partial<RegData>) => {
    setData(d => ({ ...d, ...p }));
    setApiError('');
  };

  // ── Step 1: register directly into public.users ──────────────────────────
  const handleRegister = async () => {
    if (submitted) return;
    setLoading(true);
    setApiError('');
    try {
      setSubmitted(true);
      const [firstName, ...rest] = data.fullName.trim().split(' ');
      const lastName = rest.join(' ');
      const newUserId = await registerCustomer({
        email:     data.email,
        phone:     data.mobile,
        password:  data.password,
        firstName: firstName ?? '',
        lastName:  lastName  ?? '',
        idNumber:  data.idNumber,
      });
      setUserId(newUserId);
      setStep(1);
    } catch (err: any) {
      setSubmitted(false);
      setApiError(err.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 (FICA): document upload stubs ─────────────────────────────────
  // Upload is now handled inside Step3FICAUpload directly

  const goBack = () => { setApiError(''); setStep(s => Math.max(0, s - 1)); };
  const goToConfirmation = () => setStep(2);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.indicatorWrap}>
        <StepIndicator current={step} />
      </View>

      {step === 0 && (
        <Step1PersonalInfo
          data={data}
          onChange={patch}
          onNext={handleRegister}
          loading={loading}
          error={apiError}
        />
      )}

      {step === 1 && (
        <Step3FICAUpload
          userId={userId}
          uploadedId={uploadedId}
          uploadedAddress={uploadedAddress}
          onUploadId={() => setUploadedId(true)}
          onUploadAddress={() => setUploadedAddress(true)}
          onNext={goToConfirmation}
          onSkip={goToConfirmation}
          onBack={goBack}
        />
      )}

      {step === 2 && (
        <Step4Confirmation
          fullName={data.fullName}
          email={data.email}
          emailVerified={false}
          idUploaded={uploadedId}
          addressUploaded={uploadedAddress}
          onContinue={() => onRegistrationComplete?.()}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:        { flex: 1 },
  content:       { gap: 20, paddingBottom: 8 },
  indicatorWrap: { paddingVertical: 4 },
});
