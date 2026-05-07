import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  availableCredit?: number;
  outstanding?: number;
  nextDueDate?: string;
}

export default function BalanceCard({
  availableCredit = 5000,
  outstanding = 2500,
  nextDueDate = '30 Jul 2025',
}: Props) {
  const hasOutstanding = outstanding > 0;

  return (
    <LinearGradient
      colors={['#0f2d6b', '#1a56c4', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>AVAILABLE CREDIT</Text>
          <Text style={styles.amount}>R{availableCredit.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</Text>
          <Text style={styles.updated}>PayAdvance · Salary Advance</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="card-outline" size={30} color="rgba(255,255,255,0.85)" />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.stat}>
          <Ionicons name="alert-circle-outline" size={15} color={hasOutstanding ? '#fbbf24' : 'rgba(255,255,255,0.6)'} />
          <Text style={styles.statLabel}>Outstanding</Text>
          <Text style={[styles.statValue, hasOutstanding && styles.statDanger]}>
            {hasOutstanding ? `-R${outstanding.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : 'R0.00'}
          </Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={15} color="rgba(255,255,255,0.6)" />
          <Text style={styles.statLabel}>Due Date</Text>
          <Text style={styles.statValue}>{hasOutstanding ? nextDueDate : '—'}</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Ionicons name="checkmark-circle-outline" size={15} color="rgba(255,255,255,0.6)" />
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, hasOutstanding ? styles.statWarn : styles.statGood]}>
            {hasOutstanding ? 'Active' : 'Clear'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20, padding: 22, marginHorizontal: 20,
    shadowColor: '#1a56c4', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5, marginBottom: 6 },
  amount: { fontSize: 34, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
  updated: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  iconWrap: {
    width: 54, height: 54, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statSep: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statValue: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  statDanger: { color: '#fbbf24' },
  statWarn: { color: '#fbbf24' },
  statGood: { color: '#4ade80' },
});
