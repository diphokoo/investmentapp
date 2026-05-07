import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav, { NavTab } from '../dashboard/BottomNav';
import BalanceCard from '../dashboard/BalanceCard';

type Filter = 'All' | 'Loans' | 'Repayments' | 'Transfers';

const TRANSACTIONS = [
  { id: '1', type: 'Loan Disbursed',    amount: '+R3,000.00', date: '15 Jul 2025', status: 'Completed', icon: 'arrow-down-circle', color: '#16a34a', bg: '#f0fdf4', filter: 'Loans' },
  { id: '2', type: 'Loan Repayment',    amount: '-R1,200.00', date: '01 Jul 2025', status: 'Completed', icon: 'arrow-up-circle',   color: '#dc2626', bg: '#fef2f2', filter: 'Repayments' },
  { id: '3', type: 'Service Fee',       amount: '-R150.00',   date: '01 Jul 2025', status: 'Completed', icon: 'receipt-outline',   color: '#d97706', bg: '#fffbeb', filter: 'Repayments' },
  { id: '4', type: 'Salary Advance',    amount: '+R5,000.00', date: '01 Jun 2025', status: 'Completed', icon: 'cash-outline',      color: '#2563eb', bg: '#eff6ff', filter: 'Loans' },
  { id: '5', type: 'P2P Transfer',      amount: '-R500.00',   date: '28 May 2025', status: 'Completed', icon: 'paper-plane',       color: '#9333ea', bg: '#fdf4ff', filter: 'Transfers' },
  { id: '6', type: 'Loan Repayment',    amount: '-R2,000.00', date: '01 May 2025', status: 'Completed', icon: 'arrow-up-circle',   color: '#dc2626', bg: '#fef2f2', filter: 'Repayments' },
  { id: '7', type: 'Bank Withdrawal',   amount: '-R1,000.00', date: '15 Apr 2025', status: 'Pending',   icon: 'business-outline',  color: '#64748b', bg: '#f8fafc', filter: 'Transfers' },
];

const FILTERS: Filter[] = ['All', 'Loans', 'Repayments', 'Transfers'];

interface Props { onNavChange?: (tab: NavTab) => void }

export default function HistoryScreen({ onNavChange }: Props) {
  const [activeNav, setActiveNav] = useState<NavTab>('history');
  const [filter, setFilter] = useState<Filter>('All');

  const handleNav = (tab: NavTab) => { setActiveNav(tab); onNavChange?.(tab); };

  const filtered = filter === 'All' ? TRANSACTIONS : TRANSACTIONS.filter(t => t.filter === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Ionicons name="time-outline" size={24} color="#2563eb" />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <BalanceCard availableCredit={5000} outstanding={2500} nextDueDate="30 Jul 2025" />

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Transactions */}
          <View style={styles.txList}>
            {filtered.map((tx, i) => (
              <View key={tx.id} style={[styles.txRow, i < filtered.length - 1 && styles.txRowBorder]}>
                <View style={[styles.txIcon, { backgroundColor: tx.bg }]}>
                  <Ionicons name={tx.icon as any} size={20} color={tx.color} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txType}>{tx.type}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: tx.color }]}>{tx.amount}</Text>
                  <View style={[styles.statusBadge, tx.status === 'Pending' && styles.statusBadgePending]}>
                    <Text style={[styles.statusText, tx.status === 'Pending' && styles.statusTextPending]}>
                      {tx.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="document-outline" size={40} color="#cbd5e1" />
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <BottomNav active={activeNav} onChange={handleNav} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  root: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, gap: 16 },
  filterScroll: { paddingLeft: 20 },
  filterContent: { gap: 8, paddingRight: 20 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  txList: {
    backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, overflow: 'hidden',
  },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  txIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txType: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  txDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  statusBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgePending: { backgroundColor: '#fffbeb' },
  statusText: { fontSize: 10, fontWeight: '600', color: '#16a34a' },
  statusTextPending: { color: '#d97706' },
  empty: { padding: 32, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, color: '#94a3b8' },
});
