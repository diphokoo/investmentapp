import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnalyticsCard from '../shared/AnalyticsCard';

type AdminTab = 'dashboard' | 'clients' | 'review';
type LoanStatus = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Paid';

const ANALYTICS = [
  { label: 'Total Loaned',    value: 'R248,500', icon: 'cash-outline',           color: '#2563eb', bg: '#eff6ff', trend: '+12%', trendUp: true },
  { label: 'Outstanding',     value: 'R87,200',  icon: 'alert-circle-outline',   color: '#dc2626', bg: '#fef2f2', trend: '-3%',  trendUp: false },
  { label: 'Total Repaid',    value: 'R161,300', icon: 'checkmark-circle-outline',color: '#16a34a', bg: '#f0fdf4', trend: '+18%', trendUp: true },
  { label: 'Defaulted',       value: 'R12,400',  icon: 'close-circle-outline',   color: '#d97706', bg: '#fffbeb', trend: '+2%',  trendUp: false },
  { label: 'Active Loans',    value: '34',       icon: 'document-text-outline',  color: '#9333ea', bg: '#fdf4ff', trend: '+5',   trendUp: true },
  { label: 'Total Users',     value: '128',      icon: 'people-outline',         color: '#0891b2', bg: '#f0f9ff', trend: '+8',   trendUp: true },
];

const CLIENTS = [
  { id: '1', name: 'Thabo Nkosi',    company: 'Acme Corporation',   amount: 'R3,000', status: 'Approved', due: '30 Jul 2025' },
  { id: '2', name: 'Priya Pillay',   company: 'Metro Municipality', amount: 'R5,000', status: 'Pending',  due: '—' },
  { id: '3', name: 'Johan van Wyk',  company: 'TechBridge SA',      amount: 'R2,500', status: 'Paid',     due: '—' },
  { id: '4', name: 'Nomsa Dlamini',  company: 'Sunrise Retail',     amount: 'R1,500', status: 'Rejected', due: '—' },
  { id: '5', name: 'Sipho Mahlangu', company: 'HealthFirst Clinic',  amount: 'R4,000', status: 'Approved', due: '15 Aug 2025' },
  { id: '6', name: 'Fatima Adams',   company: 'BuildRight Const.',  amount: 'R2,000', status: 'Pending',  due: '—' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Approved: { bg: '#f0fdf4', text: '#16a34a' },
  Pending:  { bg: '#fffbeb', text: '#d97706' },
  Rejected: { bg: '#fef2f2', text: '#dc2626' },
  Paid:     { bg: '#eff6ff', text: '#2563eb' },
};

interface Props { onClose?: () => void }

export default function AdminScreen({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [statusFilter, setStatusFilter] = useState<LoanStatus>('All');
  const [selectedClient, setSelectedClient] = useState<typeof CLIENTS[0] | null>(null);
  const [reviewAction, setReviewAction] = useState<string | null>(null);

  const filteredClients = statusFilter === 'All' ? CLIENTS : CLIENTS.filter(c => c.status === statusFilter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2d6b" />

      {/* Admin Header */}
      <LinearGradient colors={['#0f2d6b', '#1a56c4']} style={styles.adminHeader}>
        <View style={styles.adminHeaderRow}>
          <View>
            <Text style={styles.adminTitle}>Admin Panel</Text>
            <Text style={styles.adminSub}>PayAdvance Management</Text>
          </View>
          <View style={styles.adminHeaderRight}>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Admin Tabs */}
        <View style={styles.adminTabs}>
          {([
            { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
            { key: 'clients',   label: 'Clients',   icon: 'people-outline' },
            { key: 'review',    label: 'Review',    icon: 'clipboard-outline' },
          ] as { key: AdminTab; label: string; icon: string }[]).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.adminTab, activeTab === tab.key && styles.adminTabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? '#2563eb' : 'rgba(255,255,255,0.7)'} />
              <Text style={[styles.adminTabText, activeTab === tab.key && styles.adminTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analytics Overview</Text>
            <View style={styles.analyticsGrid}>
              {ANALYTICS.map(a => (
                <AnalyticsCard key={a.label} {...a} />
              ))}
            </View>

            {/* Capital Pool */}
            <View style={styles.capitalCard}>
              <LinearGradient colors={['#0f2d6b', '#1a56c4']} style={styles.capitalGradient}>
                <View style={styles.capitalRow}>
                  <View>
                    <Text style={styles.capitalLabel}>AVAILABLE CAPITAL POOL</Text>
                    <Text style={styles.capitalValue}>R512,000.00</Text>
                  </View>
                  <Ionicons name="wallet" size={32} color="rgba(255,255,255,0.7)" />
                </View>
                <View style={styles.capitalStats}>
                  <View style={styles.capitalStat}>
                    <Text style={styles.capitalStatLabel}>Deployed</Text>
                    <Text style={styles.capitalStatValue}>R248,500</Text>
                  </View>
                  <View style={styles.capitalStatSep} />
                  <View style={styles.capitalStat}>
                    <Text style={styles.capitalStatLabel}>Available</Text>
                    <Text style={styles.capitalStatValue}>R263,500</Text>
                  </View>
                  <View style={styles.capitalStatSep} />
                  <View style={styles.capitalStat}>
                    <Text style={styles.capitalStatLabel}>Pending Apps</Text>
                    <Text style={styles.capitalStatValue}>2</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Monthly Growth Placeholder */}
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={32} color="#94a3b8" />
              <Text style={styles.chartPlaceholderText}>Monthly Growth Chart</Text>
              <Text style={styles.chartPlaceholderSub}>Analytics integration coming soon</Text>
            </View>
          </View>
        )}

        {/* ── CLIENTS TAB ── */}
        {activeTab === 'clients' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client List</Text>

            {/* Status Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {(['All', 'Pending', 'Approved', 'Rejected', 'Paid'] as LoanStatus[]).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
                  onPress={() => setStatusFilter(s)}
                >
                  <Text style={[styles.filterText, statusFilter === s && styles.filterTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.clientList}>
              {filteredClients.map((client, i) => (
                <TouchableOpacity
                  key={client.id}
                  style={[styles.clientRow, i < filteredClients.length - 1 && styles.clientRowBorder]}
                  onPress={() => { setSelectedClient(client); setActiveTab('review'); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientAvatarText}>{client.name.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientCompany}>{client.company}</Text>
                    {client.due !== '—' && <Text style={styles.clientDue}>Due: {client.due}</Text>}
                  </View>
                  <View style={styles.clientRight}>
                    <Text style={styles.clientAmount}>{client.amount}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[client.status].bg }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[client.status].text }]}>{client.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── REVIEW TAB ── */}
        {activeTab === 'review' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loan Review</Text>

            {selectedClient ? (
              <View style={styles.reviewCard}>
                {/* Client Header */}
                <View style={styles.reviewClientHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {selectedClient.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.reviewClientName}>{selectedClient.name}</Text>
                    <Text style={styles.reviewClientCompany}>{selectedClient.company}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[selectedClient.status].bg, marginLeft: 'auto' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[selectedClient.status].text }]}>{selectedClient.status}</Text>
                  </View>
                </View>

                <View style={styles.reviewDivider} />

                {/* Loan Details */}
                {[
                  { label: 'Loan Amount', value: selectedClient.amount },
                  { label: 'Due Date', value: selectedClient.due },
                  { label: 'Employer', value: selectedClient.company },
                  { label: 'Application Date', value: '10 Jul 2025' },
                  { label: 'Credit Score', value: '680 / Good' },
                  { label: 'Affordability', value: 'R4,200 / month' },
                ].map(row => (
                  <View key={row.label} style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>{row.label}</Text>
                    <Text style={styles.reviewValue}>{row.value}</Text>
                  </View>
                ))}

                <View style={styles.reviewDivider} />

                {/* Documents */}
                <Text style={styles.reviewSubTitle}>Uploaded Documents</Text>
                {['SA ID', 'Payslip', 'Proof of Address', 'Bank Statement'].map(doc => (
                  <View key={doc} style={styles.docRow}>
                    <Ionicons name="document-text-outline" size={16} color="#2563eb" />
                    <Text style={styles.docName}>{doc}</Text>
                    <View style={styles.docBadge}>
                      <Text style={styles.docBadgeText}>Uploaded</Text>
                    </View>
                    <TouchableOpacity>
                      <Text style={styles.docView}>View</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.reviewDivider} />

                {/* Consent Status */}
                <Text style={styles.reviewSubTitle}>Consent Status</Text>
                {['Payroll Deduction Consent', 'DebiCheck Mandate', 'Terms & Conditions'].map(c => (
                  <View key={c} style={styles.consentRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text style={styles.consentLabel}>{c}</Text>
                    <Text style={styles.consentSigned}>Signed</Text>
                  </View>
                ))}

                <View style={styles.reviewDivider} />

                {/* Action Buttons */}
                {reviewAction ? (
                  <View style={[styles.actionResult, { backgroundColor: reviewAction === 'Approved' ? '#f0fdf4' : reviewAction === 'Rejected' ? '#fef2f2' : '#fffbeb' }]}>
                    <Ionicons
                      name={reviewAction === 'Approved' ? 'checkmark-circle' : reviewAction === 'Rejected' ? 'close-circle' : 'information-circle'}
                      size={20}
                      color={reviewAction === 'Approved' ? '#16a34a' : reviewAction === 'Rejected' ? '#dc2626' : '#d97706'}
                    />
                    <Text style={styles.actionResultText}>Application {reviewAction}</Text>
                  </View>
                ) : (
                  <View style={styles.actionBtns}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => setReviewAction('Approved')} activeOpacity={0.85}>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => setReviewAction('Rejected')} activeOpacity={0.85}>
                      <Ionicons name="close" size={18} color="#fff" />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreInfoBtn} onPress={() => setReviewAction('More Info Requested')} activeOpacity={0.85}>
                      <Ionicons name="help-circle-outline" size={18} color="#2563eb" />
                      <Text style={styles.moreInfoText}>More Info</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.reviewEmpty}>
                <Ionicons name="clipboard-outline" size={48} color="#cbd5e1" />
                <Text style={styles.reviewEmptyTitle}>No Application Selected</Text>
                <Text style={styles.reviewEmptySub}>Go to Clients tab and select an application to review</Text>
                <TouchableOpacity style={styles.goClientsBtn} onPress={() => setActiveTab('clients')}>
                  <Text style={styles.goClientsBtnText}>View Clients</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  adminHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 0 },
  adminHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  adminTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  adminSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  adminHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  closeBtn: { padding: 4 },
  adminTabs: { flexDirection: 'row', gap: 4 },
  adminTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderTopLeftRadius: 10, borderTopRightRadius: 10,
  },
  adminTabActive: { backgroundColor: '#f0f4f8' },
  adminTabText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  adminTabTextActive: { color: '#2563eb' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  section: { padding: 20, gap: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  capitalCard: { borderRadius: 18, overflow: 'hidden' },
  capitalGradient: { padding: 20, gap: 16 },
  capitalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  capitalLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.65)', letterSpacing: 1.2 },
  capitalValue: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 },
  capitalStats: { flexDirection: 'row', justifyContent: 'space-between' },
  capitalStat: { flex: 1, alignItems: 'center' },
  capitalStatSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  capitalStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  capitalStatValue: { fontSize: 14, fontWeight: '700', color: '#fff', marginTop: 2 },
  chartPlaceholder: {
    backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 8, borderWidth: 1.5,
    borderColor: '#e2e8f0', borderStyle: 'dashed',
  },
  chartPlaceholderText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  chartPlaceholderSub: { fontSize: 11, color: '#cbd5e1' },
  filterRow: { gap: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  clientList: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  clientRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  clientAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
  },
  clientAvatarText: { fontSize: 14, fontWeight: '800', color: '#2563eb' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  clientCompany: { fontSize: 11, color: '#64748b', marginTop: 1 },
  clientDue: { fontSize: 10, color: '#d97706', marginTop: 1 },
  clientRight: { alignItems: 'flex-end', gap: 4 },
  clientAmount: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  reviewClientHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: 18, fontWeight: '800', color: '#2563eb' },
  reviewClientName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  reviewClientCompany: { fontSize: 12, color: '#64748b' },
  reviewDivider: { height: 1, backgroundColor: '#f1f5f9' },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewLabel: { fontSize: 13, color: '#64748b' },
  reviewValue: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  reviewSubTitle: { fontSize: 13, fontWeight: '700', color: '#475569' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docName: { flex: 1, fontSize: 13, color: '#1e293b' },
  docBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  docBadgeText: { fontSize: 10, fontWeight: '600', color: '#16a34a' },
  docView: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  consentLabel: { flex: 1, fontSize: 13, color: '#1e293b' },
  consentSigned: { fontSize: 11, fontWeight: '600', color: '#16a34a' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    flex: 1, height: 46, borderRadius: 12, backgroundColor: '#16a34a',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  approveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rejectBtn: {
    flex: 1, height: 46, borderRadius: 12, backgroundColor: '#dc2626',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  rejectBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  moreInfoBtn: {
    flex: 1, height: 46, borderRadius: 12, backgroundColor: '#eff6ff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#bfdbfe',
  },
  moreInfoText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },
  actionResult: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, padding: 14,
  },
  actionResultText: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  reviewEmpty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  reviewEmptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  reviewEmptySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  goClientsBtn: {
    backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 10, marginTop: 4,
  },
  goClientsBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
