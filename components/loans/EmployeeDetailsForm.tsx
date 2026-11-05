import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../shared/InputField';
import { Company } from './CompanySelector';
import { useAuth } from '@/lib/auth-context';

export interface EmployeeDetails {
  staffNumber:      string;
  firstName:        string;
  lastName:         string;
  phone:            string;
  idNumber:         string;
  employmentStatus: string;
  monthlySalary:    string;
  payDay:           string;
}

interface Props {
  company:  Company;
  onNext:   (details: EmployeeDetails) => void;
  onBack:   () => void;
  initial?: Partial<EmployeeDetails>;
}

const STATUSES = ['Permanent', 'Contract', 'Part-time', 'Probation'];

function luhnValid(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let d = parseInt(id[i], 10);
    if (i % 2 !== 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

export default function EmployeeDetailsForm({ company, onNext, onBack, initial }: Props) {
  const { user } = useAuth();

  const [form, setForm] = useState<EmployeeDetails>({
    staffNumber:      initial?.staffNumber      ?? '',
    firstName:        initial?.firstName        ?? '',
    lastName:         initial?.lastName         ?? '',
    phone:            initial?.phone            ?? '',
    idNumber:         initial?.idNumber         ?? '',
    employmentStatus: initial?.employmentStatus ?? '',
    monthlySalary:    initial?.monthlySalary    ?? '',
    payDay:           initial?.payDay           ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeDetails, string>>>({});

  // Prefill from authenticated user on mount
  useEffect(() => {
    if (!user) return;
    setForm(f => ({
      ...f,
      firstName:     f.firstName  || user.first_name  || '',
      lastName:      f.lastName   || user.last_name   || '',
      phone:         f.phone      || user.phone       || '',
      idNumber:      f.idNumber   || user.id_number   || '',
      staffNumber:   f.staffNumber || (user as any).employee_number || '',
      monthlySalary: f.monthlySalary || ((user as any).monthly_salary
        ? String(Math.round((user as any).monthly_salary / 100))
        : ''),
      payDay:        f.payDay || ((user as any).pay_day ? String((user as any).pay_day) : ''),
    }));
  }, [user]);

  const set = (key: keyof EmployeeDetails) => (val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof EmployeeDetails, string>> = {};
    if (!form.staffNumber.trim())                          e.staffNumber      = 'Required';
    if (!form.firstName.trim())                            e.firstName        = 'Required';
    if (!form.lastName.trim())                             e.lastName         = 'Required';
    if (!form.phone || form.phone.replace(/\s/g,'').length < 10) e.phone     = 'Valid phone required';
    if (!luhnValid(form.idNumber))                         e.idNumber         = 'Invalid SA ID number';
    if (!form.employmentStatus)                            e.employmentStatus = 'Select status';
    if (!form.monthlySalary || isNaN(Number(form.monthlySalary))) e.monthlySalary = 'Enter monthly salary';
    if (!form.payDay || isNaN(Number(form.payDay)) || Number(form.payDay) < 1 || Number(form.payDay) > 31)
      e.payDay = 'Enter pay day (1–31)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#16a34a" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.companyBadge}>
        <Text style={styles.companyIcon}>{company.icon}</Text>
        <View>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companySector}>{company.sector}</Text>
        </View>
      </View>

      <Text style={styles.title}>Employee Details</Text>
      <Text style={styles.sub}>Please confirm your employment information</Text>

      <InputField label="Staff / Employee Number" icon="id-card-outline" placeholder="e.g. EMP001234"
        value={form.staffNumber} onChangeText={set('staffNumber')} error={errors.staffNumber} />
      <InputField label="First Name" icon="person-outline" placeholder="John"
        value={form.firstName} onChangeText={set('firstName')} error={errors.firstName} />
      <InputField label="Surname" icon="person-outline" placeholder="Doe"
        value={form.lastName} onChangeText={set('lastName')} error={errors.lastName} />
      <InputField label="Phone Number" icon="call-outline" placeholder="0821234567"
        value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" error={errors.phone} />
      <InputField label="South African ID Number" icon="finger-print-outline" placeholder="8001015009087"
        value={form.idNumber} onChangeText={set('idNumber')} keyboardType="number-pad" maxLength={13} error={errors.idNumber} />
      <InputField label="Monthly Salary (R)" icon="cash-outline" placeholder="15000"
        value={form.monthlySalary} onChangeText={set('monthlySalary')} keyboardType="numeric" error={errors.monthlySalary} />
      <InputField label="Pay Day (day of month)" icon="calendar-outline" placeholder="25"
        value={form.payDay} onChangeText={set('payDay')} keyboardType="number-pad" maxLength={2} error={errors.payDay} />

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Employment Status</Text>
        <View style={styles.statusGrid}>
          {STATUSES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.statusChip, form.employmentStatus === s && styles.statusChipActive]}
              onPress={() => set('employmentStatus')(s)}
            >
              <Text style={[styles.statusText, form.employmentStatus === s && styles.statusTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.employmentStatus && <Text style={styles.error}>{errors.employmentStatus}</Text>}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={() => validate() && onNext(form)} activeOpacity={0.85}>
        <Text style={styles.nextText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:        { gap: 14 },
  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText:    { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  companyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  companyIcon:   { fontSize: 28 },
  companyName:   { fontSize: 14, fontWeight: '700', color: '#14532d' },
  companySector: { fontSize: 11, color: '#16a34a' },
  title:         { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub:           { fontSize: 13, color: '#64748b', marginTop: -6 },
  fieldGroup:    { gap: 8 },
  fieldLabel:    { fontSize: 12, fontWeight: '600', color: '#475569' },
  statusGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
  },
  statusChipActive: { backgroundColor: '#f0fdf4', borderColor: '#16a34a' },
  statusText:       { fontSize: 13, fontWeight: '600', color: '#64748b' },
  statusTextActive: { color: '#16a34a' },
  error: { fontSize: 11, color: '#dc2626' },
  nextBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#16a34a',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, marginTop: 4,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
