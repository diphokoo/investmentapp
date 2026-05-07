import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoanDetails } from './LoanCalculator';
import { Company } from './CompanySelector';

interface Props {
  company: Company;
  loanDetails: LoanDetails;
  onBack: () => void;
  onDone: () => void;
}

export default function SubmitApplication({ company, loanDetails, onBack, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // Prepare for Firebase integration
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1800);
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#2563eb" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Review & Submit</Text>
      <Text style={styles.sub}>Please review your application before submitting</Text>

      {/* Summary Card */}
      <LinearGradient colors={['#0f2d6b', '#1a56c4']} style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Application Summary</Text>
        <View style={styles.summaryDivider} />
        {[
          { label: 'Employer', value: company.name },
          { label: 'Loan Amount', value: `R${loanDetails.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
          { label: 'Repayment Period', value: `${loanDetails.days} days` },
          { label: 'Total Repayment', value: `R${loanDetails.totalRepayment.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
          { label: 'Due Date', value: loanDetails.dueDate },
        ].map(row => (
          <View key={row.label} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{row.label}</Text>
            <Text style={styles.summaryValue}>{row.value}</Text>
          </View>
        ))}
      </LinearGradient>

      <View style={styles.disclaimerBox}>
        <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
        <Text style={styles.disclaimerText}>
          By submitting, you confirm all information is accurate. Your application will be reviewed within 24 hours.
          Approval is subject to affordability assessment and credit checks.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnLoading]}
        onPress={handleSubmit}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading
          ? <Text style={styles.submitText}>Submitting...</Text>
          : <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitText}>Submit Loan Application</Text>
            </>
        }
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
              <Text style={styles.refValue}>PA-{Date.now().toString().slice(-8)}</Text>
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
  wrap: { gap: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 13, color: '#64748b', marginTop: -6 },
  summaryCard: { borderRadius: 18, padding: 20, gap: 10 },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  summaryValue: { fontSize: 13, fontWeight: '700', color: '#fff' },
  disclaimerBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  disclaimerText: { flex: 1, fontSize: 11, color: '#1e40af', lineHeight: 17 },
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
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  successSub: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  refBox: {
    backgroundColor: '#f8fafc', borderRadius: 12, padding: 14,
    alignItems: 'center', width: '100%', gap: 4,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  refLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  refValue: { fontSize: 18, fontWeight: '800', color: '#1e293b', letterSpacing: 1 },
  doneBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center', width: '100%',
  },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
