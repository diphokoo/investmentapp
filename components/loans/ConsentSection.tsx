import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { ConsentRecord } from '@/lib/supabase';

export interface ConsentData {
  consents:  ConsentRecord[];
  signature: string;
}

interface Props {
  onNext:       (data: ConsentData) => void;
  onBack:       () => void;
  initialData?: ConsentData;
}

const CONSENT_VERSION = '1.0';

const PAYROLL_TEXT = `I hereby authorize my employer to deduct loan repayment amounts from my salary/wages on the agreed repayment dates. I understand that these deductions will continue until the full loan amount, including interest and fees, has been repaid. I confirm that I have read and understood the loan agreement terms.`;
const DEBICHECK_TEXT = `I authorize Zaris to initiate a DebiCheck debit order against my bank account for loan repayments. I understand I will receive an authentication request from my bank to confirm this mandate.`;
const TERMS_TEXT = `ZARIS TERMS AND CONDITIONS\n\nEffective Date: 1 January 2025\nLast Updated: 1 January 2025\n\nPLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING THE ZARIS PLATFORM OR APPLYING FOR A LOAN.\n\n1. INTRODUCTION AND PARTIES\n\n1.1 These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "Borrower", or "you") and Zaris Financial Services (Pty) Ltd ("Zaris", "we", "us", or "our"), a company registered in the Republic of South Africa.\n\n1.2 Zaris is a registered credit provider in terms of the National Credit Act 34 of 2005 ("NCA") and holds a valid registration certificate issued by the National Credit Regulator ("NCR").\n\n1.3 By accessing the Zaris platform, submitting a loan application, or accepting a loan offer, you confirm that you have read, understood, and agree to be bound by these Terms.\n\n2. ELIGIBILITY\n\n2.1 To qualify for a Zaris loan, you must:\n(a) Be a South African citizen or permanent resident;\n(b) Be at least 18 years of age;\n(c) Be permanently employed with a participating employer;\n(d) Have a valid South African bank account in your name;\n(e) Provide accurate and complete personal, employment, and financial information.\n\n2.2 Zaris reserves the right to decline any application without providing reasons, subject to the requirements of the NCA.\n\n3. LOAN APPLICATION AND APPROVAL\n\n3.1 Submitting a loan application does not guarantee approval. All applications are subject to a credit assessment and affordability evaluation in accordance with the NCA.\n\n3.2 Zaris will conduct a credit bureau enquiry as part of the assessment process. You consent to this enquiry by submitting your application.\n\n3.3 Upon approval, a Pre-Agreement Statement and Quotation ("PASQ") will be provided to you. You must review and accept the PASQ before the loan is disbursed.\n\n3.4 Loan funds will be disbursed to your registered bank account within the timeframe specified in your loan agreement.\n\n4. INTEREST RATES AND FEES\n\n4.1 Interest rates are calculated in accordance with the maximum rates prescribed by the NCA and the regulations thereunder.\n\n4.2 The following fees may apply:\n(a) Initiation Fee: A once-off fee charged at loan inception, as disclosed in your PASQ;\n(b) Monthly Service Fee: A recurring fee charged each month for the administration of your loan account;\n(c) Insurance Premium: A monthly premium for credit life insurance, where applicable;\n(d) Default Administration Charges: Applicable in the event of a missed or late payment.\n\n4.3 All fees and charges will be fully disclosed in your PASQ and loan agreement prior to acceptance.\n\n4.4 Green Loan Discount: Borrowers who qualify for and select the Green Loan option will receive a 0.5% per annum reduction on the applicable interest rate, subject to submission and verification of qualifying documentation.\n\n5. REPAYMENT\n\n5.1 Loan repayments are structured as equal monthly instalments over the agreed loan term.\n\n5.2 Repayments will be collected via payroll deduction through your employer and/or via DebiCheck debit order from your registered bank account, as authorised by you.\n\n5.3 It is your responsibility to ensure that sufficient funds are available in your bank account on each repayment date.\n\n5.4 In the event of a failed debit order, Zaris may attempt to re-present the debit and may charge a returned payment fee as disclosed in your loan agreement.\n\n5.5 Early settlement of your loan is permitted at any time. An early settlement fee may apply as permitted under the NCA.\n\n6. DEFAULT AND CONSEQUENCES\n\n6.1 You will be in default if you fail to make a repayment on the due date, provide false or misleading information, or breach any term of this agreement.\n\n6.2 In the event of default, Zaris may:\n(a) Charge default administration fees as permitted by the NCA;\n(b) Report the default to registered credit bureaus;\n(c) Refer the account to a debt collector or attorney;\n(d) Commence legal proceedings to recover the outstanding balance.\n\n6.3 Zaris will follow the prescribed debt enforcement procedures under the NCA before taking legal action.\n\n7. GOVERNING LAW AND JURISDICTION\n\n7.1 These Terms are governed by the laws of the Republic of South Africa.\n\n7.2 Any disputes arising from these Terms or your loan agreement shall be subject to the jurisdiction of the South African courts.\n\n8. CONTACT INFORMATION\n\nEmail: legal@zaris.co.za\nPhone: 0800 927 472`;

const PRIVACY_TEXT = `ZARIS PRIVACY POLICY\n\nEffective Date: 1 January 2025\nLast Updated: 1 January 2025\n\n1. INTRODUCTION\n\nZaris Financial Services (Pty) Ltd is committed to protecting your personal information in accordance with the Protection of Personal Information Act 4 of 2013 ("POPIA").\n\n2. INFORMATION WE COLLECT\n\nWe collect identity, contact, employment, financial, and FICA documentation as required for loan processing and regulatory compliance.\n\n3. HOW WE USE YOUR INFORMATION\n\nWe process your information to assess loan applications, conduct credit assessments, administer your account, comply with legal obligations, and prevent fraud.\n\n4. SHARING YOUR INFORMATION\n\nWe may share information with credit bureaus, your employer (for payroll deductions), banking partners, insurance providers, and regulatory authorities as required by law. We do not sell your personal information.\n\n5. YOUR RIGHTS UNDER POPIA\n\nYou have the right to access, correct, or request deletion of your personal information, subject to legal retention obligations.\n\n6. SECURITY\n\nWe implement appropriate technical and organisational measures to protect your personal information.\n\n7. CONTACT\n\nEmail: privacy@zaris.co.za\nPhone: 0800 927 472`;

export default function ConsentSection({ onNext, onBack, initialData }: Props) {
  const { user } = useAuth();

  const [payrollConsent,  setPayrollConsent]  = useState(initialData?.consents.some(c => c.type === 'payroll')   ?? false);
  const [debiCheck,       setDebiCheck]       = useState(initialData?.consents.some(c => c.type === 'debicheck') ?? false);
  const [termsAccepted,   setTermsAccepted]   = useState(initialData?.consents.some(c => c.type === 'terms')     ?? false);
  const [privacyAccepted, setPrivacyAccepted] = useState(initialData?.consents.some(c => c.type === 'privacy')   ?? false);
  const [signature,       setSignature]       = useState(initialData?.signature ?? '');
  const [error,           setError]           = useState('');
  const [modal,           setModal]           = useState<'terms' | 'privacy' | null>(null);

  // Prefill signature from user's full name
  useEffect(() => {
    if (!signature && user) {
      const full = [user.first_name, user.last_name].filter(Boolean).join(' ');
      if (full) setSignature(full);
    }
  }, [user]);

  const handleNext = () => {
    if (!payrollConsent || !debiCheck) {
      setError('You must accept the Payroll Deduction and DebiCheck consents to proceed.');
      return;
    }
    if (!termsAccepted) { setError('You must read and agree to the Terms & Conditions.'); return; }
    if (!privacyAccepted) { setError('You must read and acknowledge the Privacy Policy.'); return; }
    if (!signature.trim()) { setError('Please type your full name as a digital signature.'); return; }
    setError('');
    onNext({
      signature: signature.trim(),
      consents: [
        { type: 'payroll',   version: CONSENT_VERSION, text: PAYROLL_TEXT },
        { type: 'debicheck', version: CONSENT_VERSION, text: DEBICHECK_TEXT },
        { type: 'terms',     version: CONSENT_VERSION, text: 'Zaris Terms and Conditions v1.0' },
        { type: 'privacy',   version: CONSENT_VERSION, text: 'Zaris Privacy Policy v1.0' },
      ],
    });
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#16a34a" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Consent & Authorization</Text>
      <Text style={styles.sub}>Please read and accept the following consents</Text>

      {/* Payroll Deduction */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="document-text-outline" size={20} color="#16a34a" />
          <Text style={styles.consentTitle}>Payroll Deduction Authorization</Text>
        </View>
        <Text style={styles.consentText}>{PAYROLL_TEXT}</Text>
        <Pressable style={styles.checkRow} onPress={() => setPayrollConsent(v => !v)}>
          <View style={[styles.checkbox, payrollConsent && styles.checkboxActive]}>
            {payrollConsent && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.checkLabel}>I authorize payroll deductions for loan repayments.</Text>
        </Pressable>
      </View>

      {/* DebiCheck */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="card-outline" size={20} color="#9333ea" />
          <Text style={styles.consentTitle}>DebiCheck / Debit Order Consent</Text>
        </View>
        <Text style={styles.consentText}>{DEBICHECK_TEXT}</Text>
        <View style={styles.bankVerifyBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#9333ea" />
          <Text style={styles.bankVerifyText}>Bank account verification will be completed during onboarding</Text>
        </View>
        <Pressable style={styles.checkRow} onPress={() => setDebiCheck(v => !v)}>
          <View style={[styles.checkbox, debiCheck && styles.checkboxActive]}>
            {debiCheck && <Ionicons name="checkmark" size={13} color="#fff" />}
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
        <Text style={styles.consentText}>Please read the full Zaris Terms and Conditions before accepting.</Text>
        <TouchableOpacity style={styles.linkBtn} onPress={() => setModal('terms')}>
          <Ionicons name="open-outline" size={15} color="#16a34a" />
          <Text style={styles.linkText}>Read Terms & Conditions</Text>
        </TouchableOpacity>
        <Pressable style={styles.checkRow} onPress={() => setTermsAccepted(v => !v)}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
            {termsAccepted && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.checkLabel}>I have read and agree to the Terms & Conditions.</Text>
        </Pressable>
      </View>

      {/* Privacy */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="lock-closed-outline" size={20} color="#16a34a" />
          <Text style={styles.consentTitle}>Privacy Policy</Text>
        </View>
        <Text style={styles.consentText}>Please read the full Zaris Privacy Policy before acknowledging.</Text>
        <TouchableOpacity style={styles.linkBtn} onPress={() => setModal('privacy')}>
          <Ionicons name="open-outline" size={15} color="#16a34a" />
          <Text style={styles.linkText}>Read Privacy Policy</Text>
        </TouchableOpacity>
        <Pressable style={styles.checkRow} onPress={() => setPrivacyAccepted(v => !v)}>
          <View style={[styles.checkbox, privacyAccepted && styles.checkboxActive]}>
            {privacyAccepted && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.checkLabel}>I have read and acknowledge the Privacy Policy.</Text>
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
        {signature.length > 0 && <Text style={styles.signaturePreview}>{signature}</Text>}
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.nextText}>I Agree & Continue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>

      {/* Document Modal */}
      <Modal visible={modal !== null} animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
            </Text>
            <TouchableOpacity onPress={() => setModal(null)} style={styles.modalClose}>
              <Ionicons name="close" size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalText}>
              {modal === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.modalAcceptBtn}
            onPress={() => {
              if (modal === 'terms') setTermsAccepted(true);
              else setPrivacyAccepted(true);
              setModal(null);
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.modalAcceptText}>
              {modal === 'terms' ? 'I Agree to Terms & Conditions' : 'I Acknowledge Privacy Policy'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:    { gap: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText:{ fontSize: 14, fontWeight: '600', color: '#16a34a' },
  title:   { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub:     { fontSize: 13, color: '#64748b', marginTop: -6 },
  consentCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  consentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  consentTitle:  { fontSize: 14, fontWeight: '700', color: '#1e293b', flex: 1 },
  consentText:   { fontSize: 12, color: '#475569', lineHeight: 18 },
  bankVerifyBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#faf5ff', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#e9d5ff',
  },
  bankVerifyText: { fontSize: 11, color: '#7c3aed', flex: 1 },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#bbf7d0', alignSelf: 'flex-start',
  },
  linkText:  { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  checkRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkLabel:     { flex: 1, fontSize: 12, color: '#374151', lineHeight: 18 },
  signatureCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1.5, borderColor: '#14532d',
  },
  signatureInput: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc', paddingHorizontal: 12, fontSize: 15, color: '#1e293b',
  },
  signaturePreview: {
    fontSize: 20, color: '#14532d', fontStyle: 'italic',
    borderBottomWidth: 1.5, borderBottomColor: '#14532d', paddingBottom: 4,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { fontSize: 13, color: '#dc2626', flex: 1 },
  nextBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#16a34a',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalRoot: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  modalTitle:     { fontSize: 18, fontWeight: '800', color: '#0f172a', flex: 1 },
  modalClose:     { padding: 4 },
  modalScroll:    { flex: 1 },
  modalContent:   { padding: 20, paddingBottom: 32 },
  modalText:      { fontSize: 13, color: '#374151', lineHeight: 22 },
  modalAcceptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    margin: 20, height: 52, borderRadius: 14, backgroundColor: '#16a34a',
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  modalAcceptText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
