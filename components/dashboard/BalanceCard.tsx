import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function BalanceCard() {
  return (
    <LinearGradient
      colors={['#0f2d6b', '#1a56c4', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>TOTAL BALANCE</Text>
          <Text style={styles.amount}>R15,000.00</Text>
          <Text style={styles.updated}>Updated 01:35 PM</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="wallet-outline" size={32} color="rgba(255,255,255,0.85)" />
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row — quick stats */}
      <View style={styles.bottomRow}>
        <View style={styles.stat}>
          <Ionicons name="arrow-up-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.statLabel}>Sent</Text>
          <Text style={styles.statValue}>R3,200</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Ionicons name="arrow-down-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.statLabel}>Received</Text>
          <Text style={styles.statValue}>R8,500</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>R450</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 22,
    marginHorizontal: 20,
    shadowColor: '#1a56c4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  updated: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statSep: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statValue: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
});
