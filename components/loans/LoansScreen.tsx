import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import BottomNav, { NavTab } from '../dashboard/BottomNav';
import CompanySelector, { Company } from './CompanySelector';
import EmployeeDetailsForm from './EmployeeDetailsForm';
import ConsentSection from './ConsentSection';
import LoanCalculator, { LoanDetails } from './LoanCalculator';
import FICAUploadScreen from './FICAUploadScreen';
import SubmitApplication from './SubmitApplication';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface Props { onNavChange?: (tab: NavTab) => void }

const STEP_LABELS = ['Employer', 'Details', 'Consent', 'Calculator', 'Documents', 'Submit'];

export default function LoansScreen({ onNavChange }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [company, setCompany] = useState<Company | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState<NavTab>('loans');

  const handleNav = (tab: NavTab) => {
    setActiveNav(tab);
    onNavChange?.(tab);
  };

  const handleDone = () => {
    setStep(1);
    setCompany(null);
    setEmployeeDetails(null);
    setLoanDetails(null);
    handleNav('history');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Loan Application</Text>
            <Text style={styles.headerSub}>Step {step} of 6 — {STEP_LABELS[step - 1]}</Text>
          </View>
          <Ionicons name="cash-outline" size={26} color="#2563eb" />
        </View>

        {/* Step Progress */}
        <View style={styles.stepRow}>
          {STEP_LABELS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i + 1 < step && styles.stepDotDone,
                i + 1 === step && styles.stepDotActive,
              ]}
            />
          ))}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <CompanySelector
              search={search}
              onSearchChange={setSearch}
              onSelect={c => { setCompany(c); setStep(2); }}
            />
          )}
          {step === 2 && company && (
            <EmployeeDetailsForm
              company={company}
              onNext={d => { setEmployeeDetails(d); setStep(3); }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <ConsentSection
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <LoanCalculator
              onNext={d => { setLoanDetails(d); setStep(5); }}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <FICAUploadScreen
              onNext={() => setStep(6)}
              onBack={() => setStep(4)}
            />
          )}
          {step === 6 && company && loanDetails && (
            <SubmitApplication
              company={company}
              loanDetails={loanDetails}
              onBack={() => setStep(5)}
              onDone={handleDone}
            />
          )}
        </ScrollView>

        <BottomNav active={activeNav} onChange={handleNav} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  root: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  stepRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 16 },
  stepDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' },
  stepDotActive: { backgroundColor: '#2563eb' },
  stepDotDone: { backgroundColor: '#86efac' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
});
