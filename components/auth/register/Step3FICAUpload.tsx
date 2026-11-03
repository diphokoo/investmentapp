import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UploadCard from '../../shared/UploadCard';
import { uploadDocument } from '@/lib/supabase';

interface Props {
  userId:          string;
  uploadedId:      boolean;
  uploadedAddress: boolean;
  onUploadId:      () => void;
  onUploadAddress: () => void;
  onNext:          () => void;
  onSkip:          () => void;
  onBack:          () => void;
}

export default function Step3FICAUpload({
  userId,
  uploadedId, uploadedAddress,
  onUploadId, onUploadAddress,
  onNext, onSkip, onBack,
}: Props) {
  const [uploadingId, setUploadingId]           = useState(false);
  const [uploadingAddress, setUploadingAddress] = useState(false);
  const [error, setError]                       = useState('');
  const anyUploaded = uploadedId || uploadedAddress;

  const pickAndUpload = async (
    docType: 'sa_id' | 'proof_of_residence',
    onDone: () => void,
    setUploading: (v: boolean) => void,
  ) => {
    setError('');
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const asset    = result.assets[0];
    const fileName = asset.name;
    const mimeType = asset.mimeType ?? 'application/pdf';

    setUploading(true);
    try {
      await uploadDocument({
        userId,
        documentType: docType,
        fileUri:      asset.uri,
        fileName,
        mimeType,
        isRequired:   false,
      });
      onDone();
    } catch (err: any) {
      setError(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backRow} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#16a34a" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>FICA Documents</Text>
      <Text style={styles.sub}>
        Upload your identity documents to speed up your loan application. You can also do this later from your account.
      </Text>

      <View style={styles.ficaNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#16a34a" />
        <Text style={styles.ficaNoteText}>
          All documents are encrypted and stored securely as required by the Financial Intelligence Centre Act (FICA).
        </Text>
      </View>

      {uploadingId
        ? <View style={styles.uploadingRow}><ActivityIndicator color="#16a34a" /><Text style={styles.uploadingText}>Uploading SA ID…</Text></View>
        : (
          <UploadCard
            label="South African ID Document"
            description="Green ID book or Smart ID card (PDF/image)"
            icon="id-card-outline"
            uploaded={uploadedId}
            onPress={() => pickAndUpload('sa_id', onUploadId, setUploadingId)}
          />
        )
      }

      {uploadingAddress
        ? <View style={styles.uploadingRow}><ActivityIndicator color="#16a34a" /><Text style={styles.uploadingText}>Uploading proof of residence…</Text></View>
        : (
          <UploadCard
            label="Proof of Residential Address"
            description="Utility bill or bank statement (not older than 3 months)"
            icon="home-outline"
            uploaded={uploadedAddress}
            onPress={() => pickAndUpload('proof_of_residence', onUploadAddress, setUploadingAddress)}
          />
        )
      }

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={15} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.optionalNote}>
        <Ionicons name="information-circle-outline" size={15} color="#64748b" />
        <Text style={styles.optionalText}>
          Both documents are optional during registration. You can upload them later from Settings → KYC Documents.
        </Text>
      </View>

      {anyUploaded && (
        <TouchableOpacity style={styles.btn} onPress={onNext} activeOpacity={0.85}>
          <Text style={styles.btnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.8}>
        <Text style={styles.skipText}>Upload Later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:         { gap: 14 },
  backRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText:     { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  title:        { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub:          { fontSize: 13, color: '#64748b', lineHeight: 19 },
  ficaNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  ficaNoteText: { flex: 1, fontSize: 12, color: '#15803d', lineHeight: 17 },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  uploadingText:{ fontSize: 13, color: '#64748b' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText:    { flex: 1, fontSize: 12, color: '#dc2626' },
  optionalNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#f8fafc', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  optionalText: { flex: 1, fontSize: 12, color: '#64748b', lineHeight: 17 },
  btn: {
    height: 52, borderRadius: 14, backgroundColor: '#16a34a',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  btnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn:  { height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  skipText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
});
