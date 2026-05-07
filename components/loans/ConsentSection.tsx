import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function ConsentSection({ onNext, onBack }: Props) {
  const [payrollConsent, setPayrollConsent] = useState(false);
  const [debiCheckConsent, setDebiCheckConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!payrollConsent || !debiCheckConsent || !termsAccepted) {
      setError('You must accept all consents to proceed.');
      return;
    }
    if (!signature.trim()) {
      setError('Please type your full name as a digital signature.');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#2563eb" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Consent & Authorization</Text>
      <Text style={styles.sub}>Please read and accept the following consents</Text>

      {/* Payroll Deduction Consent */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="document-text-outline" size={20} color="#2563eb" />
          <Text style={styles.consentTitle}>Payroll Deduction Authorization</Text>
        </View>
        <Text style={styles.consentText}>
          I hereby authorize my employer to deduct loan repayment amounts from my salary/wages on the agreed repayment dates.
          I understand that these deductions will continue until the full loan amount, including interest and fees, has been repaid.
          I confirm that I have read and understood the loan agreement terms.
        </Text>
        <Pressable style={styles.checkRow} onPress={() => setPayrollConsent(v => !v)}>
          <View style={[styles.checkbox, payrollConsent && styles.checkboxActive]}>
            {payrollConsent && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.checkLabel}>I authorize payroll deductions for loan repayments.</Text>
        </Pressable>
      </View>

      {/* DebiCheck Consent */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="card-outline" size={20} color="#9333ea" />
          <Text style={styles.consentTitle}>DebiCheck / Debit Order Consent</Text>
        </View>
        <Text style={styles.consentText}>
          I authorize PayAdvance to initiate a DebiCheck debit order against my bank account for loan repayments.
          I understand I will receive an authentication request from my bank to confirm this mandate.
        </Text>
        <View style={styles.bankVerifyBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#9333ea" />
          <Text style={styles.bankVerifyText}>Bank account verification will be completed during onboarding</Text>
        </View>
        <Pressable style={styles.checkRow} onPress={() => setDebiCheckConsent(v => !v)}>
          <View style={[styles.checkbox, debiCheckConsent && styles.checkboxActive]}>
            {debiCheckConsent && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.checkLabel}>I consent to DebiCheck debit order mandate.</Text>
        </Pressable>
      </View>

      {/* Terms */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="shield-outline" size={20} color="#16a34a" />
          <Text style={styles.consentTitle}>Terms & Conditions</Text>
        </View>
        <ScrollView style={styles.termsScroll} nestedScrollEnabled>
          <Text style={styles.termsText}>
            {TERMS_TEXT}
          </Text>
        </ScrollView>
        <Pressable style={styles.checkRow} onPress={() => setTermsAccepted(v => !v)}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
            {termsAccepted && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.checkLabel}>I have read and accept the Terms & Conditions.</Text>
        </Pressable>
      </View>

      {/* Digital Signature */}
      <View style={styles.signatureCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="create-outline" size={20} color="#0f172a" />
          <Text style={styles.consentTitle}>Digital Signature</Text>
        </View>
        <Text style={styles.consentText}>Type your full name below as your digital signature to confirm all consents above.</Text>
        <TextInput
          style={styles.signatureInput}
          placeholder="Full Name (as digital signature)"
          placeholderTextColor="#cbd5e1"
          value={signature}
          onChangeText={setSignature}
          autoCapitalize="words"
        />
        {signature.length > 0 && (
          <Text style={styles.signaturePreview}>{signature}</Text>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.nextText}>I Agree & Continue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const TERMS_TEXT = `1. LOAN AGREEMENT
PayAdvance (Pty) Ltd is a registered credit provider (NCR Reg. No. NCRCP0000). This agreement is governed by the National Credit Act 34 of 2005.

2. REPAYMENT
Repayments are deducted from your salary on the agreed date. Failure to maintain sufficient funds may result in additional fees.

3. INTEREST & FEES
Interest is calculated at the maximum rate permitted by the NCA. A once-off initiation fee and monthly service fee apply.

4. CREDIT BUREAU
Your credit information may be submitted to registered credit bureaus. Late payments will be reported.

5. PRIVACY
Your personal information is processed in accordance with POPIA (Protection of Personal Information Act).`;

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 13, color: '#64748b', marginTop: -6 },
  consentCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  consentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  consentTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', flex: 1 },
  consentText: { fontSize: 12, color: '#475569', lineHeight: 18 },
  bankVerifyBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#faf5ff', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#e9d5ff',
  },
  bankVerifyText: { fontSize: 11, color: '#7c3aed', flex: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  checkLabel: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 18 },
  termsScroll: { maxHeight: 100, backgroundColor: '#f8fafc', borderRadius: 8, padding: 10 },
  termsText: { fontSize: 11, color: '#475569', lineHeight: 17 },
  signatureCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1.5, borderColor: '#0f2d6b',
  },
  signatureInput: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc', paddingHorizontal: 12, fontSize: 15, color: '#1e293b',
  },
  signaturePreview: {
    fontSize: 20, color: '#0f2d6b', fontStyle: 'italic',
    borderBottomWidth: 1.5, borderBottomColor: '#0f2d6b', paddingBottom: 4,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { fontSize: 13, color: '#dc2626', flex: 1 },
  nextBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#2563eb',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
