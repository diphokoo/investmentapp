import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav, { NavTab } from '../dashboard/BottomNav';
import BalanceCard from '../dashboard/BalanceCard';
import { useAuth } from '@/lib/auth-context';
import { fetchDashboardData, DashboardData, LoanRecord, supabase } from '@/lib/supabase';

type Filter = 'All' | 'Loans' | 'Repayments' | 'Transfers';
const FILTERS: Filter[] = ['All', 'Loans', 'Repayments', 'Transfers'];

interface TxRow {
  id:     string;
  type:   string;
  amount: string;
  date:   string;
  status: string;
  icon:   string;
  color:  string;
  bg:     string;
  filter: Filter;
}

function centsToRand(cents: number, sign: '+' | '-' = '+') {
  return `${sign}R${(Math.abs(cents) / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function loansToRows(loans: LoanRecord[]): TxRow[] {
  return loans.map(l => {
    const isDisbursed = ['active', 'disbursed', 'approved'].includes(l.status);
    return {
      id:     l.id,
      type:   'Loan Application',
      amount: l.approved_amount != null
        ? centsToRand(l.approved_amount, isDisbursed ? '+' : '+')
        : centsToRand(l.requested_amount, '+'),
      date:   fmtDate(l.submitted_at ?? l.created_at),
      status: l.status.charAt(0).toUpperCase() + l.status.slice(1),
      icon:   isDisbursed ? 'arrow-down-circle' : 'time-outline',
      color:  isDisbursed ? '#16a34a' : '#d97706',
      bg:     isDisbursed ? '#f0fdf4' : '#fffbeb',
      filter: 'Loans',
    };
  });
}

interface TransactionRecord {
  id:          string;
  type:        string;
  amount:      number;
  created_at:  string;
  status:      string;
}

function txToRows(txs: TransactionRecord[]): TxRow[] {
  return txs.map(tx => {
    const isCredit = tx.amount > 0;
    const isRepayment = tx.type?.toLowerCase().includes('repayment') || tx.type?.toLowerCase().includes('fee');
    return {
      id:     tx.id,
      type:   tx.type ?? 'Transaction',
      amount: centsToRand(tx.amount, isCredit ? '+' : '-'),
      date:   fmtDate(tx.created_at),
      status: tx.status ?? 'Completed',
      icon:   isRepayment ? 'arrow-up-circle' : isCredit ? 'arrow-down-circle' : 'receipt-outline',
      color:  isRepayment ? '#dc2626' : isCredit ? '#16a34a' : '#d97706',
      bg:     isRepayment ? '#fef2f2' : isCredit ? '#f0fdf4' : '#fffbeb',
      filter: isRepayment ? 'Repayments' : 'Loans',
    };
  });
}

interface Props { onNavChange?: (tab: NavTab) => void }

export default function HistoryScreen({ onNavChange }: Props) {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState<NavTab>('history');
  const [filter, setFilter]       = useState<Filter>('All');
  const [dashData, setDashData]   = useState<DashboardData | null>(null);
  const [rows, setRows]           = useState<TxRow[]>([]);
  const [loading, setLoading]     = useState(false);

  const handleNav = (tab: NavTab) => { setActiveNav(tab); onNavChange?.(tab); };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dash, txResult] = await Promise.all([
        fetchDashboardData(user.id, user.credit_limit ?? 0),
        supabase.rpc('fetch_user_transactions', { p_user_id: user.id }),
      ]);
      setDashData(dash);
      const loanRows = loansToRows(dash.recentLoans);
      const txRows   = txToRows((txResult.data ?? []) as TransactionRecord[]);
      // Merge and sort by date descending, deduplicate by id
      const merged = [...loanRows, ...txRows].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRows(merged);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'All' ? rows : rows.filter(r => r.filter === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Ionicons name="time-outline" size={24} color="#2563eb" />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <BalanceCard
            availableCredit={dashData?.availableCredit ?? 0}
            outstanding={dashData?.outstanding ?? 0}
            nextDueDate={dashData?.nextDueDate ?? undefined}
          />

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
            {loading ? (
              <View style={styles.empty}>
                <ActivityIndicator color="#16a34a" />
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="document-outline" size={40} color="#cbd5e1" />
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            ) : (
              filtered.map((tx, i) => (
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
              ))
            )}
          </View>
        </ScrollView>

        <BottomNav active={activeNav} onChange={handleNav} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#f0f4f8' },
  root:          { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle:   { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 24, gap: 16 },
  filterScroll:  { paddingLeft: 20 },
  filterContent: { gap: 8, paddingRight: 20 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText:       { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  txList: {
    backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, overflow: 'hidden',
  },
  txRow:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  txIcon:      { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo:      { flex: 1 },
  txType:      { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  txDate:      { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  txRight:     { alignItems: 'flex-end', gap: 4 },
  txAmount:    { fontSize: 14, fontWeight: '700' },
  statusBadge:        { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgePending: { backgroundColor: '#fffbeb' },
  statusText:         { fontSize: 10, fontWeight: '600', color: '#16a34a' },
  statusTextPending:  { color: '#d97706' },
  empty:     { padding: 32, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, color: '#94a3b8' },
});
