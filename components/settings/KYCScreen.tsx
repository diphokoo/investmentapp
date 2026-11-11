import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import SubScreenShell from './shared/SubScreenShell';
import { useAuth } from '@/lib/auth-context';

interface Props { onBack: () => void }

const statusText: Record<string, { title: string; message: string }> = {
  verified: { title: 'Identity Verified', message: 'Your account is fully verified.' },
  approved: { title: 'Identity Verified', message: 'Your account is fully verified.' },
  pending: { title: 'Verification Pending', message: 'Your verification is being reviewed.' },
  rejected: { title: 'Verification Requires Attention', message: 'Please contact support for assistance with your verification.' },
  unverified: { title: 'Not Yet Verified', message: 'Your identity verification has not been completed.' },
};

export default function KYCScreen({ onBack }: Props) {
  const { user } = useAuth();
  const status = (user?.kyc_status || 'pending').toLowerCase();
  const details = statusText[status] || { title: `Verification: ${status}`, message: 'Your current verification status is shown below.' };
  const verified = status === 'verified' || status === 'approved';

  return (
    <SubScreenShell title="KYC Verification" onBack={onBack}>
      <LinearGradient colors={verified ? ['#14532d', '#16a34a'] : ['#92400e', '#d97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <View style={styles.bannerIcon}><Ionicons name={verified ? 'shield-checkmark' : 'time-outline'} size={28} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>{details.title}</Text>
          <Text style={styles.bannerSub}>{details.message}</Text>
        </View>
        <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>{status}</Text></View>
      </LinearGradient>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Verification Status</Text>
        <Text style={styles.cardSub}>This status is read from your account record. Document submission is not available from this screen yet.</Text>
      </View>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  bannerIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' }, bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  verifiedBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedText: { fontSize: 12, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' }, cardSub: { fontSize: 13, color: '#64748b', lineHeight: 20 },
});
