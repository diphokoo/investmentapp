import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      {/* Illustration */}
      <View style={styles.iconCircle}>
        <View style={styles.iconInner}>
          <Ionicons name="receipt-outline" size={40} color="#3b82f6" />
        </View>
      </View>

      <Text style={styles.title}>No transactions found</Text>
      <Text style={styles.subtitle}>Your transactions will appear here once{'\n'}you start making payments</Text>

      {/* CTA */}
      <TouchableOpacity activeOpacity={0.85} style={styles.btnWrap}>
        <LinearGradient
          colors={['#1d4ed8', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          <Ionicons name="send-outline" size={16} color="#fff" />
          <Text style={styles.btnText}>Make a transaction</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  btnWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});
