import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoanDetails } from './LoanCalculator';
import { Company } from './CompanySelector';
import { EmployeeDetails } from './EmployeeDetailsForm';
import { ConsentData } from './ConsentSection';
import { StagedDocument, submitLoanApplication } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Props {
  company:         Company;
  loanDetails:     LoanDetails;
  employeeDetails: EmployeeDetails;
  consentData:     ConsentData;
  stagedDocs:      StagedDocument[];
  onBack:          () => void;
  onDone:          () => void;
}

// Convert display date "15 August 2026" → "YYYY-MM-DD"
function displayDateToISO(display: string): string {
  const d = new Date(display);
  if (isNaN(d.getTime())) return display;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function SubmitApplication({
  company, loanDetails, employeeDetails, consentData, stagedDocs, onBack, onDone,
}: Props) {
  const { user } = useAuth();
  const [loading,   setLoading]   = useState(false);
  const [progress,  setProgress]  = useState('');
  const [success,   setSuccess]   = useState(false);
  const [loanId,    setLoanId]    = useState('');
  const [error,     setError]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (submitted || !user) return;
    setSubmitted(true);
    setLoading(true);
    setError('');

    try {
      const id = await submitLoanApplication({
        userId:          user.id,
        employerId:      company.id,
        requestedAmount: Math.round(loanDetails.amount * 100),
        totalRepayable:  Math.round(loanDetails.totalRepayment * 100),
        interestRateBps: Math.round(loanDetails.interestRate * 100),
        termDays:        loanDetails.days,
        dueDate:         displayDateToISO(loanDetails.dueDate),
        purpose:         loanDetails.isGreenLoan ? 'green_loan' : 'personal',
        isGreenLoan:     loanDetails.isGreenLoan,
        employeeNumber:  employeeDetails.staffNumber,
        monthlySalary:   Math.round(Number(employeeDetails.monthlySalary) * 100),
        payDay:          Number(employeeDetails.payDay),
        signature:       consentData.signature,
        consents:        consentData.consents,
        stagedDocs,
        onProgress:      setProgress,
      });
      setLoanId(id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? 'Submission failed. Please try again.');
      setSubmitted(false);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const fmt = (n: number) =>
    `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} disabled={loading}>
        <Ionicons name="arrow-back" size={18} color="#2563eb" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Review & Submit</Text>
      <Text style={styles.sub}>Please review your application before submitting</Text>

      {/* Summary Card */}
      <LinearGradient colors={['#14532d', '#16a34a']} style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>APPLICATION SUMMARY</Text>
        <View style={styles.summaryDivider} />
        {[
          { label: 'Employer',         value: company.name },
          { label: 'Loan Type',        value: loanDetails.isGreenLoan ? '🌿 Green Loan' : 'Standard Loan' },
          { label: 'Loan Amount',      value: fmt(loanDetails.amount) },
          { label: 'Interest Rate',    value: `${loanDetails.interestRate}%` },
          { label: 'Repayment Period', value: `${loanDetails.days} days` },
          { label: 'Total Repayable',  value: fmt(loanDetails.totalRepayment) },
          { label: 'Due Date',         value: loanDetails.dueDate },
        ].map(row => (
          <View key={row.label} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{row.label}</Text>
            <Text style={styles.summaryValue}>{row.value}</Text>
          </View>
        ))}
      </LinearGradient>

      {/* Employee details summary */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Personal & Employment</Text>
        {[
          { label: 'Name',           value: `${employeeDetails.firstName} ${employeeDetails.lastName}` },
          { label: 'Employee No.',   value: employeeDetails.staffNumber },
          { label: 'Monthly Salary', value: fmt(Number(employeeDetails.monthlySalary)) },
          { label: 'Pay Day',        value: `Day ${employeeDetails.payDay}` },
          { label: 'Status',         value: employeeDetails.employmentStatus },
        ].map(row => (
          <View key={row.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{row.label}</Text>
            <Text style={styles.detailValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Documents summary */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Documents ({stagedDocs.length})</Text>
        {stagedDocs.map((d, i) => (
          <View key={i} style={styles.docRow}>
            <Ionicons name="document-text" size={14} color="#16a34a" />
            <Text style={styles.docName} numberOfLines={1}>{d.fileName}</Text>
          </View>
        ))}
      </View>

      {/* Consent summary */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Consents Accepted</Text>
        {consentData.consents.map(c => (
          <View key={c.type} style={styles.consentRow}>
            <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
            <Text style={styles.consentLabel}>{c.type.charAt(0).toUpperCase() + c.type.slice(1)}</Text>
          </View>
        ))}
        <View style={styles.sigRow}>
          <Ionicons name="create-outline" size={14} color="#64748b" />
          <Text style={styles.sigText}>Signed: {consentData.signature}</Text>
        </View>
      </View>

      {/* Green loan docs */}
      {loanDetails.isGreenLoan && loanDetails.greenDocuments.length > 0 && (
        <View style={styles.greenDocsCard}>
          <View style={styles.greenDocsHeader}>
            <Ionicons name="leaf" size={14} color="#14532d" />
            <Text style={styles.greenDocsTitle}>Green Loan Supporting Documents</Text>
          </View>
          {loanDetails.greenDocuments.map((name, i) => (
            <View key={i} style={styles.docRow}>
              <Ionicons name="document-text" size={14} color="#16a34a" />
              <Text style={styles.docName} numberOfLines={1}>{name}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.disclaimerBox}>
        <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
        <Text style={styles.disclaimerText}>
          By submitting, you confirm all information is accurate. Your application will be reviewed within 24 hours.
          Approval is subject to affordability assessment and credit checks.
        </Text>
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnLoading]}
        onPress={handleSubmit}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.submitText}>{progress || 'Submitting…'}</Text>
          </View>
        ) : (
          <>
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.submitText}>Submit Loan Application</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal visible={success} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
            </View>
            <Text style={styles.successTitle}>Application Submitted!</Text>
            <Text style={styles.successSub}>
              Your loan application has been sent successfully.{'\n'}
              You will receive a response within 24 hours.
            </Text>
            <View style={styles.refBox}>
              <Text style={styles.refLabel}>Reference Number</Text>
              <Text style={styles.refValue}>{loanId.slice(0, 8).toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.85}>
              <Text style={styles.doneText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:    { gap: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText:{ fontSize: 14, fontWeight: '600', color: '#2563eb' },
  title:   { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub:     { fontSize: 13, color: '#64748b', marginTop: -6 },
  summaryCard:    { borderRadius: 18, padding: 20, gap: 10 },
  summaryTitle:   { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel:   { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  summaryValue:   { fontSize: 13, fontWeight: '700', color: '#fff' },
  detailsCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  detailsTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  detailRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel:  { fontSize: 12, color: '#64748b' },
  detailValue:  { fontSize: 12, fontWeight: '600', color: '#1e293b' },
  docRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docName:      { flex: 1, fontSize: 12, color: '#166534', fontWeight: '500' },
  consentRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  consentLabel: { fontSize: 12, color: '#1e293b', textTransform: 'capitalize' },
  sigRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sigText:      { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  greenDocsCard: {
    backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  greenDocsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  greenDocsTitle:  { fontSize: 13, fontWeight: '700', color: '#14532d' },
  disclaimerBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  disclaimerText: { flex: 1, fontSize: 11, color: '#166534', lineHeight: 17 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText:  { flex: 1, fontSize: 13, color: '#dc2626' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitBtn: {
    height: 56, borderRadius: 14, backgroundColor: '#16a34a',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  submitBtnLoading: { backgroundColor: '#64748b' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 14, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25, shadowRadius: 40, elevation: 20,
  },
  successIcon:  { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  successSub:   { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  refBox: {
    backgroundColor: '#f8fafc', borderRadius: 12, padding: 14,
    alignItems: 'center', width: '100%', gap: 4,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  refLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  refValue: { fontSize: 18, fontWeight: '800', color: '#1e293b', letterSpacing: 1 },
  doneBtn:  { height: 52, borderRadius: 14, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', width: '100%' },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
