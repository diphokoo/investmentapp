import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function ConsentSection({ onNext, onBack }: Props) {
  const [payrollConsent, setPayrollConsent] = useState(false);
  const [debiCheckConsent, setDebiCheckConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'terms' | 'privacy' | null>(null);

  const handleNext = () => {
    if (!payrollConsent || !debiCheckConsent) {
      setError('You must accept the Payroll Deduction and DebiCheck consents to proceed.');
      return;
    }
    if (!termsAccepted) {
      setError('You must read and agree to the Terms & Conditions.');
      return;
    }
    if (!privacyAccepted) {
      setError('You must read and acknowledge the Privacy Policy.');
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
        <Ionicons name="arrow-back" size={18} color="#16a34a" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Consent & Authorization</Text>
      <Text style={styles.sub}>Please read and accept the following consents</Text>

      {/* Payroll Deduction Consent */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="document-text-outline" size={20} color="#16a34a" />
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
          I authorize Zaris to initiate a DebiCheck debit order against my bank account for loan repayments.
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

      {/* Terms & Conditions */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="shield-outline" size={20} color="#16a34a" />
          <Text style={styles.consentTitle}>Terms & Conditions</Text>
        </View>
        <Text style={styles.consentText}>
          Please read the full Zaris Terms and Conditions before accepting.
        </Text>
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

      {/* Privacy Policy */}
      <View style={styles.consentCard}>
        <View style={styles.consentHeader}>
          <Ionicons name="lock-closed-outline" size={20} color="#16a34a" />
          <Text style={styles.consentTitle}>Privacy Policy</Text>
        </View>
        <Text style={styles.consentText}>
          Please read the full Zaris Privacy Policy before acknowledging.
        </Text>
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

// ─── Legal Content ────────────────────────────────────────────────────────────

const TERMS_TEXT = `ZARIS TERMS AND CONDITIONS

Effective Date: 1 January 2025
Last Updated: 1 January 2025

PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING THE ZARIS PLATFORM OR APPLYING FOR A LOAN.

1. INTRODUCTION AND PARTIES

1.1 These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "Borrower", or "you") and Zaris Financial Services (Pty) Ltd ("Zaris", "we", "us", or "our"), a company registered in the Republic of South Africa.

1.2 Zaris is a registered credit provider in terms of the National Credit Act 34 of 2005 ("NCA") and holds a valid registration certificate issued by the National Credit Regulator ("NCR").

1.3 By accessing the Zaris platform, submitting a loan application, or accepting a loan offer, you confirm that you have read, understood, and agree to be bound by these Terms.

2. ELIGIBILITY

2.1 To qualify for a Zaris loan, you must:
(a) Be a South African citizen or permanent resident;
(b) Be at least 18 years of age;
(c) Be permanently employed with a participating employer;
(d) Have a valid South African bank account in your name;
(e) Provide accurate and complete personal, employment, and financial information.

2.2 Zaris reserves the right to decline any application without providing reasons, subject to the requirements of the NCA.

3. LOAN APPLICATION AND APPROVAL

3.1 Submitting a loan application does not guarantee approval. All applications are subject to a credit assessment and affordability evaluation in accordance with the NCA.

3.2 Zaris will conduct a credit bureau enquiry as part of the assessment process. You consent to this enquiry by submitting your application.

3.3 Upon approval, a Pre-Agreement Statement and Quotation ("PASQ") will be provided to you. You must review and accept the PASQ before the loan is disbursed.

3.4 Loan funds will be disbursed to your registered bank account within the timeframe specified in your loan agreement.

4. INTEREST RATES AND FEES

4.1 Interest rates are calculated in accordance with the maximum rates prescribed by the NCA and the regulations thereunder.

4.2 The following fees may apply:
(a) Initiation Fee: A once-off fee charged at loan inception, as disclosed in your PASQ;
(b) Monthly Service Fee: A recurring fee charged each month for the administration of your loan account;
(c) Insurance Premium: A monthly premium for credit life insurance, where applicable;
(d) Default Administration Charges: Applicable in the event of a missed or late payment.

4.3 All fees and charges will be fully disclosed in your PASQ and loan agreement prior to acceptance.

4.4 Green Loan Discount: Borrowers who qualify for and select the Green Loan option will receive a 0.5% per annum reduction on the applicable interest rate, subject to submission and verification of qualifying documentation.

5. REPAYMENT

5.1 Loan repayments are structured as equal monthly instalments over the agreed loan term.

5.2 Repayments will be collected via payroll deduction through your employer and/or via DebiCheck debit order from your registered bank account, as authorised by you.

5.3 It is your responsibility to ensure that sufficient funds are available in your bank account on each repayment date.

5.4 In the event of a failed debit order, Zaris may attempt to re-present the debit and may charge a returned payment fee as disclosed in your loan agreement.

5.5 Early settlement of your loan is permitted at any time. An early settlement fee may apply as permitted under the NCA.

6. DEFAULT AND CONSEQUENCES

6.1 You will be in default if you fail to make a repayment on the due date, provide false or misleading information, or breach any term of this agreement.

6.2 In the event of default, Zaris may:
(a) Charge default administration fees as permitted by the NCA;
(b) Report the default to registered credit bureaus;
(c) Refer the account to a debt collector or attorney;
(d) Commence legal proceedings to recover the outstanding balance.

6.3 Zaris will follow the prescribed debt enforcement procedures under the NCA before taking legal action.

7. CREDIT BUREAU REPORTING

7.1 Zaris is obligated to report your credit information, including payment history and any defaults, to registered credit bureaus in accordance with the NCA.

7.2 Positive payment behaviour will also be reported and may assist in building your credit profile.

8. CREDIT LIFE INSURANCE

8.1 Credit life insurance is included in your loan agreement where required by the NCA. This insurance covers your outstanding loan balance in the event of death, permanent disability, temporary disability, or retrenchment.

8.2 Details of the insurance cover, premiums, and exclusions will be provided in your loan agreement.

9. EMPLOYER RELATIONSHIP

9.1 Zaris operates in partnership with participating employers to facilitate payroll-based loan repayments. Your employer acts solely as a payment facilitator and is not a party to the credit agreement between you and Zaris.

9.2 Termination of employment does not extinguish your obligation to repay the outstanding loan balance. Alternative repayment arrangements must be made immediately upon termination.

10. AMENDMENTS TO TERMS

10.1 Zaris reserves the right to amend these Terms at any time. Material changes will be communicated to you via the platform or registered contact details with reasonable notice.

10.2 Continued use of the platform or maintenance of an active loan account after notification of changes constitutes acceptance of the amended Terms.

11. GOVERNING LAW AND JURISDICTION

11.1 These Terms are governed by the laws of the Republic of South Africa.

11.2 Any disputes arising from these Terms or your loan agreement shall be subject to the jurisdiction of the South African courts, without prejudice to your rights under the NCA to approach the NCR or the National Consumer Tribunal.

12. CONTACT INFORMATION

If you have any questions about these Terms, please contact Zaris at:
Email: legal@zaris.co.za
Phone: 0800 927 472
Address: Zaris Financial Services (Pty) Ltd, South Africa`;

const PRIVACY_TEXT = `ZARIS PRIVACY POLICY

Effective Date: 1 January 2025
Last Updated: 1 January 2025

ZARIS FINANCIAL SERVICES (PTY) LTD — PRIVACY POLICY

1. INTRODUCTION

1.1 Zaris Financial Services (Pty) Ltd ("Zaris", "we", "us", or "our") is committed to protecting your personal information in accordance with the Protection of Personal Information Act 4 of 2013 ("POPIA") and all applicable South African privacy legislation.

1.2 This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use the Zaris platform or apply for a loan.

1.3 By using our platform or submitting a loan application, you acknowledge that you have read and understood this Privacy Policy.

2. INFORMATION WE COLLECT

2.1 We collect the following categories of personal information:

(a) Identity Information: Full name, South African ID number, date of birth, gender, nationality;
(b) Contact Information: Residential address, email address, mobile number;
(c) Employment Information: Employer name, employee number, job title, salary details, payslips;
(d) Financial Information: Bank account details, credit history, income and expenditure information;
(e) FICA Documentation: Certified copy of ID, proof of residence, and other documents required by the Financial Intelligence Centre Act 38 of 2001 ("FICA");
(f) Device and Usage Information: IP address, device identifiers, app usage data, and log information collected automatically when you use our platform;
(g) Green Loan Documentation: Supporting documents submitted in connection with a Green Loan application, where applicable.

3. HOW WE USE YOUR INFORMATION

3.1 We process your personal information for the following purposes:

(a) To assess and process your loan application;
(b) To conduct credit and affordability assessments as required by the National Credit Act 34 of 2005 ("NCA");
(c) To verify your identity and comply with FICA obligations;
(d) To administer your loan account and process repayments;
(e) To communicate with you regarding your application, account, and any changes to our products or services;
(f) To report to registered credit bureaus as required by the NCA;
(g) To detect, prevent, and investigate fraud and other unlawful activities;
(h) To comply with our legal and regulatory obligations;
(i) To improve our platform, products, and services.

4. LEGAL BASIS FOR PROCESSING

4.1 We process your personal information on the following legal grounds:

(a) Performance of a contract: Processing necessary to enter into and perform the loan agreement with you;
(b) Legal obligation: Processing required to comply with the NCA, FICA, POPIA, and other applicable laws;
(c) Legitimate interests: Processing necessary for fraud prevention, risk management, and platform improvement;
(d) Consent: Where you have provided explicit consent for specific processing activities.

5. SHARING YOUR INFORMATION

5.1 We may share your personal information with the following parties:

(a) Credit Bureaus: We are required to submit your credit information to registered credit bureaus under the NCA;
(b) Your Employer: Limited employment and repayment information is shared with your employer solely for the purpose of facilitating payroll deductions;
(c) Banking Partners: Your bank account details are shared with our banking partners to process disbursements and debit orders;
(d) Insurance Providers: Where credit life insurance is included in your loan, relevant information is shared with the insurer;
(e) Regulatory Authorities: We may disclose information to the NCR, FSCA, FIC, SARS, or other regulatory bodies as required by law;
(f) Service Providers: We engage third-party service providers (including IT, cloud storage, and analytics providers) who process information on our behalf under strict confidentiality obligations;
(g) Legal and Debt Collection: In the event of default, information may be shared with attorneys or debt collectors for recovery purposes.

5.2 We do not sell your personal information to third parties.

6. CROSS-BORDER TRANSFERS

6.1 Where your personal information is transferred to a recipient in a country outside South Africa, we will ensure that adequate safeguards are in place as required by POPIA, including binding contractual obligations or confirmation that the recipient country provides an equivalent level of protection.

7. RETENTION OF INFORMATION

7.1 We retain your personal information for as long as necessary to fulfil the purposes for which it was collected, including to satisfy legal, regulatory, accounting, or reporting requirements.

7.2 Loan records are retained for a minimum of five (5) years after the loan is settled or written off, in accordance with applicable legislation.

7.3 Where you have not proceeded with a loan application, your information will be retained for a period of three (3) years from the date of application.

8. YOUR RIGHTS UNDER POPIA

8.1 You have the following rights in respect of your personal information:

(a) Right of Access: You may request confirmation of whether we hold your personal information and request a copy thereof;
(b) Right to Correction: You may request that we correct inaccurate or incomplete personal information;
(c) Right to Deletion: You may request deletion of your personal information, subject to our legal retention obligations;
(d) Right to Object: You may object to the processing of your personal information on grounds relating to your particular situation;
(e) Right to Withdraw Consent: Where processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of prior processing;
(f) Right to Lodge a Complaint: You have the right to lodge a complaint with the Information Regulator of South Africa.

8.2 To exercise any of these rights, please contact our Information Officer at the details provided in Section 12.

9. SECURITY

9.1 We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, disclosure, alteration, or destruction.

9.2 These measures include encryption of data in transit and at rest, access controls, regular security assessments, and staff training on data protection.

9.3 In the event of a data breach that poses a risk to your rights and freedoms, we will notify you and the Information Regulator as required by POPIA.

10. COOKIES AND TRACKING

10.1 Our platform may use cookies and similar tracking technologies to enhance your experience and collect usage data. You may manage cookie preferences through your device or browser settings.

11. CHILDREN

11.1 Our services are not directed at persons under the age of 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such information, please contact us immediately.

12. CONTACT AND INFORMATION OFFICER

12.1 For any privacy-related queries, requests, or complaints, please contact our Information Officer:

Email: privacy@zaris.co.za
Phone: 0800 927 472
Address: Zaris Financial Services (Pty) Ltd, South Africa

12.2 You may also contact the Information Regulator of South Africa:
Website: www.justice.gov.za/inforeg
Email: inforeg@justice.gov.za

13. UPDATES TO THIS POLICY

13.1 We may update this Privacy Policy from time to time. The updated version will be published on our platform with a revised effective date. We encourage you to review this Policy periodically.`;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
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
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#bbf7d0', alignSelf: 'flex-start',
  },
  linkText: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkLabel: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 18 },
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
  // Modal
  modalRoot: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', flex: 1 },
  modalClose: { padding: 4 },
  modalScroll: { flex: 1 },
  modalContent: { padding: 20, paddingBottom: 32 },
  modalText: { fontSize: 13, color: '#374151', lineHeight: 22 },
  modalAcceptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    margin: 20, height: 52, borderRadius: 14, backgroundColor: '#16a34a',
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  modalAcceptText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
