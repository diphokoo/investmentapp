import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../shared/InputField';
import { Company } from './CompanySelector';

interface EmployeeDetails {
  staffNumber: string;
  fullName: string;
  surname: string;
  phone: string;
  idNumber: string;
  employmentStatus: string;
}

interface Props {
  company: Company;
  onNext: (details: EmployeeDetails) => void;
  onBack: () => void;
}

const STATUSES = ['Permanent', 'Contract', 'Part-time', 'Probation'];

export default function EmployeeDetailsForm({ company, onNext, onBack }: Props) {
  const [form, setForm] = useState<EmployeeDetails>({
    staffNumber: '', fullName: '', surname: '',
    phone: '', idNumber: '', employmentStatus: '',
  });
  const [errors, setErrors] = useState<Partial<EmployeeDetails>>({});

  const set = (key: keyof EmployeeDetails) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Partial<EmployeeDetails> = {};
    if (!form.staffNumber) e.staffNumber = 'Required';
    if (!form.fullName) e.fullName = 'Required';
    if (!form.surname) e.surname = 'Required';
    if (!form.phone || form.phone.length < 10) e.phone = 'Valid phone required';
    if (!form.idNumber || form.idNumber.length !== 13) e.idNumber = 'SA ID must be 13 digits';
    if (!form.employmentStatus) e.employmentStatus = 'Select status';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#2563eb" />
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
      <Text style={styles.sub}>Please provide your employment information</Text>

      <InputField label="Staff / Employee Number" icon="id-card-outline" placeholder="e.g. EMP001234"
        value={form.staffNumber} onChangeText={set('staffNumber')} error={errors.staffNumber} />
      <InputField label="First Name" icon="person-outline" placeholder="John"
        value={form.fullName} onChangeText={set('fullName')} error={errors.fullName} />
      <InputField label="Surname" icon="person-outline" placeholder="Doe"
        value={form.surname} onChangeText={set('surname')} error={errors.surname} />
      <InputField label="Phone Number" icon="call-outline" placeholder="0821234567"
        value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" error={errors.phone} />
      <InputField label="South African ID Number" icon="finger-print-outline" placeholder="8001015009087"
        value={form.idNumber} onChangeText={set('idNumber')} keyboardType="number-pad" maxLength={13} error={errors.idNumber} />

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
  wrap: { gap: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  companyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#eff6ff', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  companyIcon: { fontSize: 28 },
  companyName: { fontSize: 14, fontWeight: '700', color: '#1e3a8a' },
  companySector: { fontSize: 11, color: '#3b82f6' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 13, color: '#64748b', marginTop: -6 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
  },
  statusChipActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  statusText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  statusTextActive: { color: '#2563eb' },
  error: { fontSize: 11, color: '#dc2626' },
  nextBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#2563eb',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, marginTop: 4,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
