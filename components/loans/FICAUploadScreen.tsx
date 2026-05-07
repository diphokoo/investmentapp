import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UploadCard from '../shared/UploadCard';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const DOCS = [
  { key: 'id',      label: 'South African ID',   description: 'Green ID book or Smart ID card', icon: 'id-card-outline' },
  { key: 'payslip', label: 'Latest Payslip',      description: 'Most recent payslip (PDF/image)', icon: 'document-text-outline' },
  { key: 'address', label: 'Proof of Address',    description: 'Utility bill or bank statement (3 months)', icon: 'home-outline' },
  { key: 'bank',    label: 'Bank Statement',      description: 'Last 3 months bank statements', icon: 'business-outline' },
];

export default function FICAUploadScreen({ onNext, onBack }: Props) {
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setUploaded(u => ({ ...u, [key]: !u[key] }));
  const allUploaded = DOCS.every(d => uploaded[d.key]);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#2563eb" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>FICA Documents</Text>
      <Text style={styles.sub}>Upload the required documents to verify your identity</Text>

      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(Object.values(uploaded).filter(Boolean).length / DOCS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {Object.values(uploaded).filter(Boolean).length}/{DOCS.length} uploaded
        </Text>
      </View>

      <View style={styles.ficaNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#2563eb" />
        <Text style={styles.ficaNoteText}>
          All documents are encrypted and stored securely. Required by FICA (Financial Intelligence Centre Act).
        </Text>
      </View>

      {DOCS.map(doc => (
        <UploadCard
          key={doc.key}
          label={doc.label}
          description={doc.description}
          icon={doc.icon}
          uploaded={!!uploaded[doc.key]}
          onPress={() => toggle(doc.key)}
        />
      ))}

      {!allUploaded && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
          <Text style={styles.infoText}>All documents are required to process your application.</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextBtn, !allUploaded && styles.nextBtnDisabled]}
        onPress={onNext}
        activeOpacity={0.85}
        disabled={!allUploaded}
      >
        <Text style={styles.nextText}>Continue to Submit</Text>
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
  progressWrap: { gap: 6 },
  progressBar: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#64748b', textAlign: 'right' },
  ficaNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  ficaNoteText: { flex: 1, fontSize: 12, color: '#1e40af', lineHeight: 17 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f0f9ff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#bae6fd',
  },
  infoText: { flex: 1, fontSize: 12, color: '#0369a1' },
  nextBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#2563eb',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  nextBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
