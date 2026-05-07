import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SubScreenShell from './shared/SubScreenShell';

interface Props { onBack: () => void }

function UploadBox({ label, icon }: { label: string; icon: string }) {
  return (
    <TouchableOpacity style={styles.uploadBox} activeOpacity={0.75}>
      <View style={styles.uploadIcon}>
        <Ionicons name={icon as any} size={28} color="#3b82f6" />
      </View>
      <Text style={styles.uploadLabel}>{label}</Text>
      <Text style={styles.uploadHint}>Tap to upload • JPG, PNG or PDF</Text>
    </TouchableOpacity>
  );
}

export default function KYCScreen({ onBack }: Props) {
  return (
    <SubScreenShell title="KYC Verification" onBack={onBack}>

      {/* Status banner */}
      <LinearGradient colors={['#14532d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Ionicons name="shield-checkmark" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Identity Verified</Text>
          <Text style={styles.bannerSub}>Your account is fully verified</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      </LinearGradient>

      {/* Info card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Verification Documents</Text>
        <Text style={styles.cardSub}>
          Keep your documents up to date to maintain full account access.
        </Text>
      </View>

      {/* Upload boxes */}
      <UploadBox label="National ID / Passport" icon="card-outline" />
      <UploadBox label="Proof of Address"        icon="home-outline" />

      {/* Submit */}
      <TouchableOpacity activeOpacity={0.85} style={styles.btnWrap}>
        <LinearGradient colors={['#1d4ed8', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          <Text style={styles.btnText}>Submit Documents</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 8,
  },
  bannerIcon: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  bannerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  verifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  verifiedText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  cardSub:   { fontSize: 13, color: '#64748b', lineHeight: 20 },
  uploadBox: {
    backgroundColor: '#fff', borderRadius: 18, padding: 20,
    alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
  },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  uploadHint:  { fontSize: 12, color: '#94a3b8' },
  btnWrap: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  btn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
