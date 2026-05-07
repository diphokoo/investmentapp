import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  trend?: string;
  trendUp?: boolean;
}

export default function AnalyticsCard({ label, value, icon, color, bg, trend, trendUp }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <View style={styles.trendRow}>
          <Ionicons
            name={trendUp ? 'trending-up' : 'trending-down'}
            size={12}
            color={trendUp ? '#16a34a' : '#dc2626'}
          />
          <Text style={[styles.trend, { color: trendUp ? '#16a34a' : '#dc2626' }]}>{trend}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14,
    alignItems: 'flex-start', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  label: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trend: { fontSize: 11, fontWeight: '600' },
});
