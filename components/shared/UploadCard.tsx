import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  description: string;
  icon: string;
  uploaded?: boolean;
  fileName?: string;
  onPress?: () => void;
}

export default function UploadCard({ label, description, icon, uploaded, fileName, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, uploaded && styles.cardUploaded]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconWrap, { backgroundColor: uploaded ? '#f0fdf4' : '#eff6ff' }]}>
        <Ionicons name={icon as any} size={24} color={uploaded ? '#16a34a' : '#2563eb'} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.desc}>{uploaded ? (fileName ?? 'Uploaded ✓') : description}</Text>
      </View>
      <View style={[styles.badge, uploaded && styles.badgeUploaded]}>
        <Ionicons
          name={uploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
          size={20}
          color={uploaded ? '#16a34a' : '#94a3b8'}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardUploaded: { borderColor: '#86efac', borderStyle: 'solid', backgroundColor: '#f0fdf4' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  desc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  badge: { padding: 4 },
  badgeUploaded: {},
});
