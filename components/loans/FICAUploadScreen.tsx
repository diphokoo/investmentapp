import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StagedDocument, DocumentType } from '@/lib/supabase';

interface DocSlot {
  key:          DocumentType;
  label:        string;
  description:  string;
  icon:         string;
  required:     boolean;
}

const DOCS: DocSlot[] = [
  { key: 'sa_id',              label: 'South African ID',   description: 'Green ID book or Smart ID card (PDF/image)', icon: 'id-card-outline',       required: true },
  { key: 'payslip',            label: 'Latest Payslip',     description: 'Most recent payslip (PDF)',                  icon: 'document-text-outline', required: true },
  { key: 'proof_of_residence', label: 'Proof of Address',   description: 'Utility bill or bank statement (3 months)', icon: 'home-outline',          required: true },
  { key: 'bank_statement',     label: 'Bank Statement',     description: 'Last 3 months bank statements (PDF)',        icon: 'business-outline',      required: true },
];

const MAX_SIZE_MB = 10;

interface Props {
  onNext:        (docs: StagedDocument[]) => void;
  onBack:        () => void;
  initialDocs?:  StagedDocument[];
}

export default function FICAUploadScreen({ onNext, onBack, initialDocs = [] }: Props) {
  const [staged, setStaged] = useState<Record<string, StagedDocument>>(
    Object.fromEntries(initialDocs.map(d => [d.documentType, d]))
  );
  const [picking, setPicking] = useState<string | null>(null);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const uploadedCount = Object.keys(staged).length;
  const allUploaded   = DOCS.every(d => staged[d.key]);

  const pick = async (slot: DocSlot) => {
    setPicking(slot.key);
    setErrors(e => ({ ...e, [slot.key]: '' }));
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];

      if (asset.size && asset.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrors(e => ({ ...e, [slot.key]: `File must be under ${MAX_SIZE_MB} MB` }));
        return;
      }

      setStaged(s => ({
        ...s,
        [slot.key]: {
          documentType: slot.key,
          fileUri:      asset.uri,
          fileName:     asset.name,
          mimeType:     asset.mimeType ?? 'application/pdf',
        },
      }));
    } catch {
      setErrors(e => ({ ...e, [slot.key]: 'Could not open file picker.' }));
    } finally {
      setPicking(null);
    }
  };

  const remove = (key: string) => {
    setStaged(s => { const n = { ...s }; delete n[key]; return n; });
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#2563eb" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Supporting Documents</Text>
      <Text style={styles.sub}>Upload the required documents to verify your identity</Text>

      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(uploadedCount / DOCS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{uploadedCount}/{DOCS.length} uploaded</Text>
      </View>

      <View style={styles.ficaNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#2563eb" />
        <Text style={styles.ficaNoteText}>
          All documents are encrypted and stored securely. Required by FICA (Financial Intelligence Centre Act).
        </Text>
      </View>

      {DOCS.map(doc => {
        const file = staged[doc.key];
        const isPickingThis = picking === doc.key;
        return (
          <View key={doc.key}>
            {isPickingThis ? (
              <View style={styles.pickingRow}>
                <ActivityIndicator color="#2563eb" />
                <Text style={styles.pickingText}>Opening picker…</Text>
              </View>
            ) : file ? (
              <View style={styles.uploadedCard}>
                <View style={styles.uploadedIconWrap}>
                  <Ionicons name="document-text" size={22} color="#16a34a" />
                </View>
                <View style={styles.uploadedInfo}>
                  <Text style={styles.uploadedLabel}>{doc.label}</Text>
                  <Text style={styles.uploadedName} numberOfLines={1}>{file.fileName}</Text>
                </View>
                <TouchableOpacity onPress={() => remove(doc.key)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadCard}
                onPress={() => pick(doc)}
                activeOpacity={0.8}
                disabled={!!picking}
              >
                <View style={styles.uploadIconWrap}>
                  <Ionicons name={doc.icon as any} size={24} color="#2563eb" />
                </View>
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadLabel}>{doc.label}</Text>
                  <Text style={styles.uploadDesc}>{doc.description}</Text>
                </View>
                <Ionicons name="cloud-upload-outline" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
            {!!errors[doc.key] && (
              <Text style={styles.errText}>{errors[doc.key]}</Text>
            )}
          </View>
        );
      })}

      {!allUploaded && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
          <Text style={styles.infoText}>All documents are required to process your application.</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextBtn, !allUploaded && styles.nextBtnDisabled]}
        onPress={() => allUploaded && onNext(Object.values(staged))}
        activeOpacity={0.85}
        disabled={!allUploaded}
      >
        <Text style={styles.nextText}>Continue to Consent</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:         { gap: 14 },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText:     { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  title:        { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub:          { fontSize: 13, color: '#64748b', marginTop: -6 },
  progressWrap: { gap: 6 },
  progressBar:  { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#64748b', textAlign: 'right' },
  ficaNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  ficaNoteText: { flex: 1, fontSize: 12, color: '#1e40af', lineHeight: 17 },
  pickingRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  pickingText:  { fontSize: 13, color: '#64748b' },
  uploadCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed',
  },
  uploadIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  uploadInfo:     { flex: 1 },
  uploadLabel:    { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  uploadDesc:     { fontSize: 11, color: '#64748b', marginTop: 2 },
  uploadedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#86efac',
  },
  uploadedIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  uploadedInfo:     { flex: 1 },
  uploadedLabel:    { fontSize: 13, fontWeight: '700', color: '#14532d' },
  uploadedName:     { fontSize: 11, color: '#16a34a', marginTop: 2 },
  removeBtn:        { padding: 4 },
  errText:          { fontSize: 11, color: '#dc2626', marginTop: 2, marginLeft: 4 },
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
  nextText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
});
