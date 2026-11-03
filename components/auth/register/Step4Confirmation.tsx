import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  fullName:        string;
  email:           string;
  emailVerified:   boolean;
  idUploaded:      boolean;
  addressUploaded: boolean;
  onContinue:      () => void;
}

function StatusRow({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusIcon, done ? styles.statusIconDone : styles.statusIconPending]}>
        <Ionicons
          name={done ? 'checkmark' : 'time-outline'}
          size={14}
          color={done ? '#fff' : '#94a3b8'}
        />
      </View>
      <Text style={[styles.statusLabel, !done && styles.statusLabelPending]}>{label}</Text>
      <Text style={[styles.statusBadge, done ? styles.badgeDone : styles.badgePending]}>
        {done ? 'Complete' : 'Pending'}
      </Text>
    </View>
  );
}

export default function Step4Confirmation({
  fullName, email, emailVerified, idUploaded, addressUploaded, onContinue,
}: Props) {
  const firstName = fullName.split(' ')[0] || fullName;

  return (
    <View style={styles.wrap}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
      </View>

      <Text style={styles.heading}>Welcome, {firstName}!</Text>
      <Text style={styles.sub}>Your account has been created successfully.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registration Status</Text>

        <StatusRow label="Account Created"    done={true} />
        <StatusRow label="Email Verified"     done={emailVerified} />
        <StatusRow label="SA ID Document"     done={idUploaded} />
        <StatusRow label="Proof of Address"   done={addressUploaded} />
      </View>

      {(!idUploaded || !addressUploaded) && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#16a34a" />
          <Text style={styles.infoText}>
            You can upload your outstanding documents anytime from{' '}
            <Text style={styles.infoLink}>Settings → KYC Documents</Text>.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={onContinue} activeOpacity={0.85}>
        <Text style={styles.btnText}>Continue to Employment Info</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:        { gap: 16, alignItems: 'center' },
  successIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  heading:  { fontSize: 22, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  sub:      { fontSize: 13, color: '#64748b', textAlign: 'center' },
  card: {
    width: '100%', backgroundColor: '#f8fafc', borderRadius: 14,
    borderWidth: 1, borderColor: '#e2e8f0', padding: 16, gap: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusIcon: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  statusIconDone:    { backgroundColor: '#16a34a' },
  statusIconPending: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  statusLabel:        { flex: 1, fontSize: 13, fontWeight: '600', color: '#1e293b' },
  statusLabelPending: { color: '#94a3b8' },
  statusBadge:  { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeDone:    { backgroundColor: '#dcfce7', color: '#15803d' },
  badgePending: { backgroundColor: '#f1f5f9', color: '#94a3b8' },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#bbf7d0', width: '100%',
  },
  infoText: { flex: 1, fontSize: 12, color: '#15803d', lineHeight: 17 },
  infoLink: { fontWeight: '700' },
  btn: {
    height: 52, borderRadius: 14, backgroundColor: '#16a34a',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5, width: '100%',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
