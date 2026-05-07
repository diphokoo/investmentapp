import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  onNext: (details: LoanDetails) => void;
  onBack: () => void;
}

export interface LoanDetails {
  amount: number;
  days: number;
  interestRate: number;
  totalRepayment: number;
  interest: number;
  serviceFee: number;
  dueDate: string;
}

const SERVICE_FEE = 150;
const MAX_LOAN = 10000;
const MIN_LOAN = 500;

function calcDueDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LoanCalculator({ onNext, onBack }: Props) {
  const [amount, setAmount] = useState('2000');
  const [days, setDays] = useState('30');
  const [rate, setRate] = useState('5');

  const amt = parseFloat(amount) || 0;
  const d = parseInt(days) || 30;
  const r = parseFloat(rate) || 5;

  const interest = parseFloat(((amt * r) / 100).toFixed(2));
  const total = parseFloat((amt + interest + SERVICE_FEE).toFixed(2));
  const daily = parseFloat((total / d).toFixed(2));
  const dueDate = calcDueDate(d);

  const isValid = amt >= MIN_LOAN && amt <= MAX_LOAN && d >= 7 && d <= 90;

  const handleNext = () => {
    if (!isValid) return;
    onNext({ amount: amt, days: d, interestRate: r, totalRepayment: total, interest, serviceFee: SERVICE_FEE, dueDate });
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#2563eb" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Loan Calculator</Text>
      <Text style={styles.sub}>Calculate your repayment before applying</Text>

      {/* Inputs */}
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Loan Amount (R)</Text>
            <TextInput
              style={[styles.input, !isValid && amt > 0 && styles.inputError]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor="#cbd5e1"
            />
            <Text style={styles.inputHint}>R{MIN_LOAN} – R{MAX_LOAN.toLocaleString()}</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Repayment Days</Text>
            <TextInput
              style={styles.input}
              value={days}
              onChangeText={setDays}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor="#cbd5e1"
            />
            <Text style={styles.inputHint}>7 – 90 days</Text>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Interest Rate (%)</Text>
          <TextInput
            style={styles.input}
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
            placeholder="5"
            placeholderTextColor="#cbd5e1"
          />
          <Text style={styles.inputHint}>NCA regulated rate</Text>
        </View>
      </View>

      {/* Results Card */}
      <LinearGradient colors={['#0f2d6b', '#1a56c4', '#3b82f6']} style={styles.resultCard}>
        <Text style={styles.resultTitle}>Repayment Summary</Text>
        <View style={styles.resultDivider} />
        {[
          { label: 'Amount Borrowed', value: `R${amt.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
          { label: 'Interest', value: `R${interest.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
          { label: 'Service Fee', value: `R${SERVICE_FEE.toFixed(2)}` },
          { label: 'Daily Repayment', value: `R${daily.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
          { label: 'Due Date', value: dueDate },
        ].map(row => (
          <View key={row.label} style={styles.resultRow}>
            <Text style={styles.resultLabel}>{row.label}</Text>
            <Text style={styles.resultValue}>{row.value}</Text>
          </View>
        ))}
        <View style={styles.resultDivider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL REPAYMENT</Text>
          <Text style={styles.totalValue}>R{total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</Text>
        </View>
      </LinearGradient>

      {!isValid && amt > 0 && (
        <View style={styles.warnBox}>
          <Ionicons name="warning-outline" size={16} color="#d97706" />
          <Text style={styles.warnText}>
            {amt < MIN_LOAN ? `Minimum loan is R${MIN_LOAN}` : amt > MAX_LOAN ? `Maximum loan is R${MAX_LOAN.toLocaleString()}` : 'Repayment period must be 7–90 days'}
          </Text>
        </View>
      )}

      <TouchableOpacity style={[styles.nextBtn, !isValid && styles.nextBtnDisabled]} onPress={handleNext} activeOpacity={0.85} disabled={!isValid}>
        <Text style={styles.nextText}>Proceed with Application</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 13, color: '#64748b', marginTop: -6 },
  inputCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { flex: 1, gap: 4 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: '#475569' },
  input: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc', paddingHorizontal: 12, fontSize: 16,
    fontWeight: '700', color: '#1e293b',
  },
  inputError: { borderColor: '#dc2626' },
  inputHint: { fontSize: 10, color: '#94a3b8' },
  resultCard: {
    borderRadius: 18, padding: 20, gap: 10,
    shadowColor: '#1a56c4', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  resultTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  resultDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  resultValue: { fontSize: 13, fontWeight: '700', color: '#fff' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#fff' },
  warnBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fffbeb', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  warnText: { fontSize: 12, color: '#92400e', flex: 1 },
  nextBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#2563eb',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  nextBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
