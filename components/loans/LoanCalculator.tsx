import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useMemo } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';

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
  initiationFee: number;
  totalCostOfCredit: number;
  isGreenLoan: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MIN_LOAN = 500;
const MAX_LOAN = 10_000;
const MAX_DAYS = 60;
const MONTHLY_SERVICE_FEE = 60;
const INSURANCE_RATE = 0.005; // 0.5% of principal

function getRate(amount: number, isGreen: boolean): number {
  if (isGreen) return 0.5;
  return amount >= 8_000 ? 2.9 : 5;
}

function calcInitiationFee(amount: number): number {
  return parseFloat((165 + 0.1 * amount).toFixed(2));
}

function fmt(n: number) {
  return `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_OF_WEEK = ['Su','Mo','Tu','We','Th','Fr','Sa'];

interface CalendarProps {
  selected: string;
  minDate: string;
  maxDate: string;
  onSelect: (d: string) => void;
  onClose: () => void;
}

function Calendar({ selected, minDate, maxDate, onSelect, onClose }: CalendarProps) {
  const today = new Date(minDate + 'T00:00:00');
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <View style={cal.wrap}>
      <View style={cal.header}>
        <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
          <Ionicons name="chevron-back" size={20} color="#1e293b" />
        </TouchableOpacity>
        <Text style={cal.title}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
          <Ionicons name="chevron-forward" size={20} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <View style={cal.dowRow}>
        {DAYS_OF_WEEK.map(d => <Text key={d} style={cal.dow}>{d}</Text>)}
      </View>

      <View style={cal.grid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={`e${idx}`} style={cal.cell} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dateStr === selected;
          const disabled = dateStr < minDate || dateStr > maxDate;
          return (
            <TouchableOpacity
              key={dateStr}
              style={[cal.cell, isSelected && cal.cellSelected, disabled && cal.cellDisabled]}
              onPress={() => !disabled && (onSelect(dateStr), onClose())}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text style={[cal.cellText, isSelected && cal.cellTextSelected, disabled && cal.cellTextDisabled]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LoanCalculator({ onNext, onBack }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateString(today);
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + MAX_DAYS);
  const maxDateStr = toDateString(maxDate);

  const [amount, setAmount] = useState('2000');
  const [repayDate, setRepayDate] = useState(todayStr);
  const [isGreen, setIsGreen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const amt = parseFloat(amount) || 0;
  const repayDay = new Date(repayDate + 'T00:00:00');
  const days = daysBetween(today, repayDay);
  const months = Math.max(days / 30, 1 / 30);

  const rate = getRate(amt, isGreen);
  const interest = parseFloat(((amt * rate) / 100).toFixed(2));
  const initiationFee = calcInitiationFee(amt);
  const totalServiceFee = parseFloat((MONTHLY_SERVICE_FEE * months).toFixed(2));
  const insurance = parseFloat((amt * INSURANCE_RATE).toFixed(2));
  const totalCost = parseFloat((amt + interest + initiationFee + totalServiceFee + insurance).toFixed(2));

  const amtError = amt > 0 && (amt < MIN_LOAN || amt > MAX_LOAN);
  const dateError = days < 1 || days > MAX_DAYS;
  const isValid = amt >= MIN_LOAN && amt <= MAX_LOAN && days >= 1 && days <= MAX_DAYS;

  const handleNext = () => {
    if (!isValid) return;
    onNext({
      amount: amt,
      days,
      interestRate: rate,
      totalRepayment: totalCost,
      interest,
      serviceFee: totalServiceFee,
      dueDate: formatDisplay(repayDate),
      initiationFee,
      totalCostOfCredit: totalCost,
      isGreenLoan: isGreen,
    });
  };

  const breakdown = [
    { label: 'Principal',            value: fmt(amt),            icon: 'cash-outline',            color: '#2563eb' },
    { label: `Interest (${rate}%)`,  value: fmt(interest),       icon: 'trending-up-outline',     color: isGreen ? '#16a34a' : '#6366f1' },
    { label: 'Initiation Fee',       value: fmt(initiationFee),  icon: 'receipt-outline',         color: '#d97706' },
    { label: `Service Fee (${Math.ceil(months)}mo × R60)`, value: fmt(totalServiceFee), icon: 'calendar-outline', color: '#0891b2' },
    { label: 'Insurance (0.5%)',     value: fmt(insurance),      icon: 'shield-checkmark-outline',color: '#9333ea' },
  ];

  return (
    <>
      <View style={s.wrap}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={18} color="#2563eb" />
          <Text style={s.backText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={s.title}>Loan Calculator</Text>
        <Text style={s.sub}>Adjust details to see your full cost breakdown</Text>

        {/* ── Loan Details Card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.cardIcon}><Ionicons name="cash-outline" size={18} color="#2563eb" /></View>
            <Text style={s.cardTitle}>Loan Details</Text>
          </View>

          <Text style={s.fieldLabel}>Loan Amount</Text>
          <View style={[s.inputWrap, amtError && s.inputError]}>
            <Text style={s.inputPrefix}>R</Text>
            <TextInput
              style={s.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#cbd5e1"
            />
          </View>
          {amtError ? (
            <Text style={s.errText}>
              {amt < MIN_LOAN ? `Minimum is R ${MIN_LOAN.toLocaleString()}` : `Maximum is R ${MAX_LOAN.toLocaleString()}`}
            </Text>
          ) : (
            <Text style={s.hintText}>R {MIN_LOAN.toLocaleString()} – R {MAX_LOAN.toLocaleString()}</Text>
          )}

          {/* Green Loan Toggle */}
          <View style={s.greenRow}>
            <View style={s.greenLeft}>
              <View style={s.greenIconWrap}>
                <Ionicons name="leaf-outline" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.greenLabel}>Green Loan</Text>
                <Text style={s.greenSub}>Renewable energy purpose — 0.5% rate</Text>
              </View>
            </View>
            <Pressable
              style={[s.toggle, isGreen && s.toggleOn]}
              onPress={() => setIsGreen(v => !v)}
            >
              <View style={[s.toggleThumb, isGreen && s.toggleThumbOn]} />
            </Pressable>
          </View>
          {isGreen && (
            <View style={s.greenBanner}>
              <Ionicons name="leaf" size={14} color="#16a34a" />
              <Text style={s.greenBannerText}>Green Loan rate of 0.5% overrides standard rate</Text>
            </View>
          )}
        </View>

        {/* ── Repayment Card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="calendar-outline" size={18} color="#16a34a" />
            </View>
            <Text style={s.cardTitle}>Repayment Date</Text>
          </View>

          <TouchableOpacity
            style={[s.datePicker, dateError && s.inputError]}
            onPress={() => setShowCalendar(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={18} color="#64748b" />
            <Text style={s.dateText}>{formatDisplay(repayDate)}</Text>
            <Ionicons name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>

          {dateError && <Text style={s.errText}>Date must be 1–{MAX_DAYS} days from today</Text>}

          <View style={s.durationChip}>
            <Ionicons name="time-outline" size={14} color="#2563eb" />
            <Text style={s.durationText}>
              {days > 0 ? `${days} day${days !== 1 ? 's' : ''} until repayment` : 'Select a future date'}
            </Text>
          </View>
        </View>

        {/* ── Cost Breakdown Card ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIcon, { backgroundColor: '#fdf4ff' }]}>
              <Ionicons name="receipt-outline" size={18} color="#9333ea" />
            </View>
            <Text style={s.cardTitle}>Cost Breakdown</Text>
          </View>

          {breakdown.map((row, i) => (
            <View key={row.label} style={[s.breakRow, i < breakdown.length - 1 && s.breakRowBorder]}>
              <View style={[s.breakIcon, { backgroundColor: `${row.color}18` }]}>
                <Ionicons name={row.icon as any} size={14} color={row.color} />
              </View>
              <Text style={s.breakLabel}>{row.label}</Text>
              <Text style={[s.breakValue, { color: row.color }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Summary Card ── */}
        <LinearGradient colors={['#0f2d6b', '#1a56c4', '#3b82f6']} style={s.summaryCard}>
          <Text style={s.summaryEyebrow}>TOTAL COST OF CREDIT</Text>
          <Text style={s.summaryTotal}>{fmt(totalCost)}</Text>
          <View style={s.summaryDivider} />
          <View style={s.summaryGrid}>
            {[
              { label: 'Loan Amount',   value: fmt(amt) },
              { label: 'Repayment Date', value: formatDisplay(repayDate) },
              { label: 'Duration',      value: `${days} days` },
              { label: 'Interest Rate', value: `${rate}%${isGreen ? ' 🌿' : ''}` },
            ].map(r => (
              <View key={r.label} style={s.summaryItem}>
                <Text style={s.summaryItemLabel}>{r.label}</Text>
                <Text style={s.summaryItemValue}>{r.value}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Validation hint */}
        {!isValid && (amtError || dateError) && (
          <View style={s.warnBox}>
            <Ionicons name="warning-outline" size={16} color="#d97706" />
            <Text style={s.warnText}>
              {amtError
                ? (amt < MIN_LOAN ? `Minimum loan amount is R ${MIN_LOAN.toLocaleString()}` : `Maximum loan amount is R ${MAX_LOAN.toLocaleString()}`)
                : `Repayment date must be within ${MAX_DAYS} days`}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.nextBtn, !isValid && s.nextBtnDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!isValid}
        >
          <Text style={s.nextText}>Proceed with Application</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Repayment Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={s.modalSub}>Maximum {MAX_DAYS} days from today</Text>
            <Calendar
              selected={repayDate}
              minDate={todayStr}
              maxDate={maxDateStr}
              onSelect={setRepayDate}
              onClose={() => setShowCalendar(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrap: { gap: 14, paddingBottom: 8 },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 13, color: '#64748b', marginTop: -6 },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  cardIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },

  // Input
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0', paddingHorizontal: 12, height: 52,
  },
  inputError: { borderColor: '#dc2626' },
  inputPrefix: { fontSize: 16, fontWeight: '700', color: '#94a3b8', marginRight: 6 },
  input: { flex: 1, fontSize: 20, fontWeight: '800', color: '#0f172a' },
  hintText: { fontSize: 11, color: '#94a3b8' },
  errText: { fontSize: 11, color: '#dc2626', fontWeight: '600' },

  // Green toggle
  greenRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4 },
  greenLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  greenIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  greenLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  greenSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: '#e2e8f0', justifyContent: 'center', padding: 3 },
  toggleOn: { backgroundColor: '#bbf7d0' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 },
  toggleThumbOn: { backgroundColor: '#16a34a', transform: [{ translateX: 20 }] },
  greenBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  greenBannerText: { fontSize: 12, color: '#15803d', fontWeight: '600', flex: 1 },

  // Date picker
  datePicker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f8fafc', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0', padding: 14,
  },
  dateText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0f172a' },
  durationChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eff6ff', borderRadius: 8, padding: 8,
    alignSelf: 'flex-start',
  },
  durationText: { fontSize: 12, fontWeight: '600', color: '#2563eb' },

  // Breakdown
  breakRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  breakRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  breakIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  breakLabel: { flex: 1, fontSize: 13, color: '#475569', fontWeight: '500' },
  breakValue: { fontSize: 13, fontWeight: '700' },

  // Summary
  summaryCard: { borderRadius: 20, padding: 22, gap: 10, shadowColor: '#1a56c4', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10 },
  summaryEyebrow: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5 },
  summaryTotal: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryItem: { width: '47%' },
  summaryItemLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  summaryItemValue: { fontSize: 13, fontWeight: '700', color: '#fff', marginTop: 2 },

  // Warn
  warnBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fffbeb', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  warnText: { fontSize: 12, color: '#92400e', flex: 1 },

  // CTA
  nextBtn: {
    height: 54, borderRadius: 14, backgroundColor: '#2563eb',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  nextBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  modalSub: { fontSize: 12, color: '#64748b', marginTop: -6 },
});

// ── Calendar Styles ───────────────────────────────────────────────────────────
const cal = StyleSheet.create({
  wrap: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  navBtn: { padding: 6 },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  dowRow: { flexDirection: 'row' },
  dow: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#94a3b8', paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellSelected: { backgroundColor: '#2563eb', borderRadius: 999 },
  cellDisabled: { opacity: 0.3 },
  cellText: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
  cellTextSelected: { color: '#fff', fontWeight: '800' },
  cellTextDisabled: { color: '#94a3b8' },
});
