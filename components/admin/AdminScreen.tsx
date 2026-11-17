
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../lib/auth-context';
import {
  AdminCustomer,
  AdminDashboardStats,
  AdminLoanReviewFilter,
  AdminReviewApplication,
  fetchAdminCustomers,
  fetchAdminDashboardStats,
  fetchAdminLoanReviewQueue,
  reviewAdminLoan,
} from '../../lib/supabase';
import AnalyticsCard from '../shared/AnalyticsCard';

type AdminTab = 'dashboard' | 'clients' | 'review';
type LoanStatus = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Paid';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Approved: { bg: '#f0fdf4', text: '#16a34a' },
  Pending: { bg: '#fffbeb', text: '#d97706' },
  Rejected: { bg: '#fef2f2', text: '#dc2626' },
  Paid: { bg: '#eff6ff', text: '#2563eb' },
};

interface Props {
  onClose?: () => void;
}

function formatRand(value: number): string {
  return (Number(value || 0) / 100).toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  });
}

export default function AdminScreen({ onClose }: Props) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [statusFilter, setStatusFilter] = useState<LoanStatus>('All');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState('');

  // Live dashboard data
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [reviewFilter, setReviewFilter] = useState<AdminLoanReviewFilter>('pending');
  const [reviewApplications, setReviewApplications] = useState<AdminReviewApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<AdminReviewApplication | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [approvedAmountInput, setApprovedAmountInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [pendingReviewAction, setPendingReviewAction] = useState<'approve' | 'reject' | 'flag' | null>(null);


  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError('');

        const result = await fetchAdminDashboardStats();

        if (mounted) {
          setStats(result);
        }
      } catch (error: any) {
        if (mounted) {
          setStatsError(
            error?.message ?? 'Could not load dashboard statistics.'
          );
        }
      } finally {
        if (mounted) {
          setStatsLoading(false);
        }
      }
    };

    if (user?.id) {
      void loadStats();
    } else {
      setStatsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (activeTab !== 'clients') return;

    let mounted = true;
    const loadCustomers = async () => {
      try {
        setCustomersLoading(true);
        setCustomersError('');
        const result = await fetchAdminCustomers(customerSearch);
        if (mounted) setCustomers(result);
      } catch (error: any) {
        if (mounted) {
          setCustomersError(error?.message ?? 'Could not load customers.');
        }
      } finally {
        if (mounted) setCustomersLoading(false);
      }
    };

    void loadCustomers();
    return () => {
      mounted = false;
    };
  }, [activeTab, customerSearch]);


  useEffect(() => {
    if (activeTab !== 'review') return;
    let mounted = true;
    const loadQueue = async () => {
      try {
        setReviewLoading(true);
        setReviewError('');
        const rows = await fetchAdminLoanReviewQueue(reviewFilter);
        if (mounted) {
          setReviewApplications(rows);
          setSelectedApplication(current => current ? rows.find(row => row.id === current.id) ?? null : null);
        }
      } catch (error: any) {
        if (mounted) setReviewError(error?.message ?? 'Could not load loan applications.');
      } finally {
        if (mounted) setReviewLoading(false);
      }
    };
    void loadQueue();
    return () => { mounted = false; };
  }, [activeTab, reviewFilter]);

  const refreshDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const result = await fetchAdminDashboardStats();
      setStats(result);
    } catch (error: any) {
      setStatsError(error?.message ?? 'Could not refresh dashboard statistics.');
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshReviewQueue = async () => {
    setReviewLoading(true);
    setReviewError('');
    try {
      const rows = await fetchAdminLoanReviewQueue(reviewFilter);
      setReviewApplications(rows);
      setSelectedApplication(current => current ? rows.find(row => row.id === current.id) ?? null : null);
    } catch (error: any) {
      setReviewError(error?.message ?? 'Could not refresh loan applications.');
    } finally {
      setReviewLoading(false);
    }
  };

  const submitReviewAction = (action: 'approve' | 'reject' | 'flag') => {
    if (!selectedApplication || reviewActionLoading) return;
    const approvedAmount = Number(approvedAmountInput);
    if (action === 'approve' && (!Number.isFinite(approvedAmount) || approvedAmount <= 0)) {
      Alert.alert('Approval amount required', 'Enter a valid approved amount in rand.');
      return;
    }
    if (action === 'reject' && !rejectionReasonInput.trim()) {
      Alert.alert('Reason required', 'Enter a reason before rejecting this application.');
      return;
    }
    setPendingReviewAction(action);
  };

  const confirmReviewAction = async () => {
    const action = pendingReviewAction;
    if (!action || !selectedApplication || reviewActionLoading) return;
    const approvedAmount = Number(approvedAmountInput);
    try {
      setReviewActionLoading(true);
      setPendingReviewAction(null);
      await reviewAdminLoan({
        loanId: selectedApplication.id,
        action,
        approvedAmount: action === 'approve' ? Math.round(approvedAmount * 100) : undefined,
        rejectionReason: action === 'reject' ? rejectionReasonInput.trim() : undefined,
        adminNotes: adminNotesInput.trim() || undefined,
      });
      Alert.alert('Decision saved', `The application has been ${action === 'flag' ? 'flagged' : action === 'approve' ? 'approved' : 'rejected'}.`);
      setSelectedApplication(null);
      setApprovedAmountInput('');
      setRejectionReasonInput('');
      setAdminNotesInput('');
      await Promise.all([refreshReviewQueue(), refreshDashboardStats()]);
    } catch (error: any) {
      Alert.alert('Could not save decision', error?.message ?? 'Please try again.');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const filteredClients =
    statusFilter === 'All'
      ? customers
      : customers.filter(client =>
          client.loans?.some(
            loan => loan.status?.toLowerCase() === statusFilter.toLowerCase(),
          ),
        );

  const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString('en-ZA', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  };

  const formatCustomerName = (client: AdminCustomer) =>
    [client.first_name, client.last_name].filter(Boolean).join(' ') ||
    client.email ||
    'Unnamed customer';

  const formatLoanStatus = (status: string) =>
    status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : 'Unknown';

  const getStatusColors = (status: string) =>
    STATUS_COLORS[formatLoanStatus(status)] ?? {
      bg: '#f1f5f9',
      text: '#475569',
    };

  const analytics = stats
    ? [
        {
          label: 'Total Disbursed',
          value: formatRand(stats.transactions.total_disbursed),
          icon: 'cash-outline',
          color: '#2563eb',
          bg: '#eff6ff',
        },
        {
          label: 'Outstanding',
          value: formatRand(stats.loans.outstanding_balance),
          icon: 'alert-circle-outline',
          color: '#dc2626',
          bg: '#fef2f2',
        },
        {
          label: 'Total Repaid',
          value: formatRand(stats.transactions.total_repaid),
          icon: 'checkmark-circle-outline',
          color: '#16a34a',
          bg: '#f0fdf4',
        },
        {
          label: 'Overdue Loans',
          value: String(stats.loans.overdue),
          icon: 'close-circle-outline',
          color: '#d97706',
          bg: '#fffbeb',
        },
        {
          label: 'Active Loans',
          value: String(stats.loans.active),
          icon: 'document-text-outline',
          color: '#9333ea',
          bg: '#fdf4ff',
        },
        {
          label: 'Total Users',
          value: String(stats.customers.total),
          icon: 'people-outline',
          color: '#0891b2',
          bg: '#f0f9ff',
        },
      ]
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2d6b" />

      {/* Admin Header */}
      <LinearGradient
        colors={['#0f2d6b', '#1a56c4']}
        style={styles.adminHeader}
      >
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
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="rgba(255,255,255,0.8)"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Admin Tabs */}
        <View style={styles.adminTabs}>
          {([
            { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
            { key: 'clients', label: 'Clients', icon: 'people-outline' },
            { key: 'review', label: 'Review', icon: 'clipboard-outline' },
          ] as { key: AdminTab; label: string; icon: string }[]).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.adminTab,
                activeTab === tab.key && styles.adminTabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={
                  activeTab === tab.key
                    ? '#2563eb'
                    : 'rgba(255,255,255,0.7)'
                }
              />
              <Text
                style={[
                  styles.adminTabText,
                  activeTab === tab.key && styles.adminTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analytics Overview</Text>

            {statsLoading && (
              <Text style={styles.loadingText}>
                Loading live dashboard data...
              </Text>
            )}

            {!!statsError && (
              <View style={styles.errorCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#dc2626"
                />
                <Text style={styles.errorText}>{statsError}</Text>

                <TouchableOpacity
                  onPress={() => {
                    setStats(null);
                    setStatsLoading(true);
                    setStatsError('');

                    void fetchAdminDashboardStats()
                      .then(setStats)
                      .catch(error =>
                        setStatsError(
                          error?.message ?? 'Could not load dashboard data.'
                        )
                      )
                      .finally(() => setStatsLoading(false));
                  }}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {stats && (
              <>
                <View style={styles.analyticsGrid}>
                  {analytics.map(item => (
                    <AnalyticsCard
                      key={item.label}
                      {...item}
                    />
                  ))}
                </View>

                {/* Live Loan Portfolio */}
                <View style={styles.capitalCard}>
                  <LinearGradient
                    colors={['#0f2d6b', '#1a56c4']}
                    style={styles.capitalGradient}
                  >
                    <View style={styles.capitalRow}>
                      <View>
                        <Text style={styles.capitalLabel}>
                          TOTAL LOAN DISBURSEMENTS
                        </Text>
                        <Text style={styles.capitalValue}>
                          {formatRand(stats.transactions.total_disbursed)}
                        </Text>
                      </View>

                      <Ionicons
                        name="wallet"
                        size={32}
                        color="rgba(255,255,255,0.7)"
                      />
                    </View>

                    <View style={styles.capitalStats}>
                      <View style={styles.capitalStat}>
                        <Text style={styles.capitalStatLabel}>
                          Repaid
                        </Text>
                        <Text style={styles.capitalStatValue}>
                          {formatRand(stats.transactions.total_repaid)}
                        </Text>
                      </View>

                      <View style={styles.capitalStatSep} />

                      <View style={styles.capitalStat}>
                        <Text style={styles.capitalStatLabel}>
                          Outstanding
                        </Text>
                        <Text style={styles.capitalStatValue}>
                          {formatRand(stats.loans.outstanding_balance)}
                        </Text>
                      </View>

                      <View style={styles.capitalStatSep} />

                      <View style={styles.capitalStat}>
                        <Text style={styles.capitalStatLabel}>
                          Pending Apps
                        </Text>
                        <Text style={styles.capitalStatValue}>
                          {stats.loans.pending}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Additional live statistics */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>
                    Business Overview
                  </Text>

                  {[
                    {
                      label: 'Total Loan Applications',
                      value: stats.loans.total,
                    },
                    {
                      label: 'Flagged Applications',
                      value: stats.loans.flagged,
                    },
                    {
                      label: 'Approved Applications',
                      value: stats.loans.approved,
                    },
                    {
                      label: 'Rejected Applications',
                      value: stats.loans.rejected,
                    },
                    {
                      label: 'Registered Employers',
                      value: stats.employers.total,
                    },
                    {
                      label: 'Active Employers',
                      value: stats.employers.active,
                    },
                    {
                      label: 'New Customers (30 days)',
                      value: stats.customers.new_last_30_days,
                    },
                  ].map(item => (
                    <View key={item.label} style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        {item.label}
                      </Text>
                      <Text style={styles.summaryValue}>
                        {item.value.toLocaleString('en-ZA')}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Approved Loans</Text>
                  <View style={styles.approvedTotalRow}>
                    <Text style={styles.summaryLabel}>Total approved value</Text>
                    <Text style={styles.approvedTotalValue}>
                      {formatRand(stats.approved_loans.reduce((sum, loan) => sum + (loan.approved_amount ?? 0), 0))}
                    </Text>
                  </View>
                  <Text style={styles.customerCount}>
                    {stats.approved_loans.length} approved {stats.approved_loans.length === 1 ? 'application' : 'applications'}
                  </Text>
                  {stats.approved_loans.length === 0 ? (
                    <Text style={styles.chartPlaceholderSub}>Approved applications will appear here.</Text>
                  ) : stats.approved_loans.map(loan => {
                    const name = [loan.first_name, loan.last_name].filter(Boolean).join(' ') || loan.email || 'Customer';
                    return (
                      <View key={loan.id} style={styles.approvedLoanRow}>
                        <View style={styles.approvedLoanInfo}>
                          <Text style={styles.approvedLoanName}>{name}</Text>
                          <Text style={styles.approvedLoanMeta}>{loan.email || 'No email'} · {formatDate(loan.reviewed_at)}</Text>
                        </View>
                        <View style={styles.approvedLoanAmountWrap}>
                          <Text style={styles.approvedLoanAmount}>{formatRand(loan.approved_amount ?? 0)}</Text>
                          <Text style={styles.approvedLoanStatus}>Approved</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {!statsLoading && !stats && !statsError && (
              <View style={styles.chartPlaceholder}>
                <Ionicons
                  name="bar-chart-outline"
                  size={32}
                  color="#94a3b8"
                />
                <Text style={styles.chartPlaceholderText}>
                  No dashboard data available
                </Text>
              </View>
            )}

            {/* Monthly Growth Placeholder */}
            <View style={styles.chartPlaceholder}>
              <Ionicons
                name="bar-chart-outline"
                size={32}
                color="#94a3b8"
              />
              <Text style={styles.chartPlaceholderText}>
                Monthly Growth Chart
              </Text>
              <Text style={styles.chartPlaceholderSub}>
                Analytics integration coming soon
              </Text>
            </View>
          </View>
        )}

        {/* CLIENTS TAB */}
        {activeTab === 'clients' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registered Customers</Text>
            <Text style={styles.customerCount}>
              {customers.length.toLocaleString('en-ZA')} customers loaded
            </Text>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color="#64748b" />
              <TextInput
                value={customerSearch}
                onChangeText={setCustomerSearch}
                placeholder="Search name, email, phone, ID or employee number"
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {!!customerSearch && (
                <TouchableOpacity onPress={() => setCustomerSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {(['All', 'Pending', 'Approved', 'Rejected', 'Paid'] as LoanStatus[]).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    statusFilter === status && styles.filterChipActive,
                  ]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      statusFilter === status && styles.filterTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {customersLoading && (
              <View style={styles.customerState}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>Loading registered customers...</Text>
              </View>
            )}

            {!!customersError && (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{customersError}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCustomersError('');
                    setCustomersLoading(true);
                    void fetchAdminCustomers(customerSearch)
                      .then(setCustomers)
                      .catch(error =>
                        setCustomersError(error?.message ?? 'Could not load customers.'),
                      )
                      .finally(() => setCustomersLoading(false));
                  }}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!customersLoading && !customersError && filteredClients.length === 0 && (
              <View style={styles.chartPlaceholder}>
                <Ionicons name="people-outline" size={32} color="#94a3b8" />
                <Text style={styles.chartPlaceholderText}>
                  {customers.length === 0
                    ? 'No registered customers found'
                    : 'No customers match this filter'}
                </Text>
                <Text style={styles.chartPlaceholderSub}>
                  Try changing your search or loan status filter
                </Text>
              </View>
            )}

            <View style={styles.clientList}>
              {filteredClients.map((client, index) => {
                const latestLoan = client.loans?.[0];
                const initials = formatCustomerName(client)
                  .trim().split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(part => part[0])
                  .join('')
                  .toUpperCase();

                return (
                  <TouchableOpacity
                    key={client.id}
                    style={[
                      styles.clientRow,
                      index < filteredClients.length - 1 && styles.clientRowBorder,
                    ]}
                    onPress={() => {
                      setActiveTab('review');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.clientAvatar}>
                      <Text style={styles.clientAvatarText}>{initials || 'C'}</Text>
                    </View>

                    <View style={styles.clientInfo}>
                      <Text style={styles.clientName}>
                        {formatCustomerName(client)}
                      </Text>
                      <Text style={styles.clientCompany}>
                        {client.employer_name || 'No employer linked'}
                      </Text>
                      <Text style={styles.clientCompany}>{client.email}</Text>
                      {!!client.phone && (
                        <Text style={styles.clientCompany}>{client.phone}</Text>
                      )}
                      <Text style={styles.clientDue}>
                        {client.loan_count} {client.loan_count === 1 ? 'loan' : 'loans'}
                        {' · '}KYC: {formatLoanStatus(client.kyc_status)}
                      </Text>
                    </View>

                    <View style={styles.clientRight}>
                      <Text style={styles.clientAmount}>
                        {latestLoan
                          ? formatRand(
                              latestLoan.approved_amount ??
                                latestLoan.requested_amount ??
                                0,
                            )
                          : 'No loans'}
                      </Text>
                      {latestLoan ? (
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColors(latestLoan.status).bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusColors(latestLoan.status).text },
                            ]}
                          >
                            {formatLoanStatus(latestLoan.status)}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.clientCompany}>Registered</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* LIVE LOAN REVIEW TAB */}
        {activeTab === 'review' && (
          <View style={styles.section}>
            <View style={styles.reviewHeadingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Loan Applications</Text>
                <Text style={styles.customerCount}>Review and manage submitted applications</Text>
              </View>
              <TouchableOpacity onPress={() => void refreshReviewQueue()} style={styles.refreshButton}>
                <Ionicons name="refresh-outline" size={18} color="#2563eb" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {([
                { key: 'pending', label: 'Pending' },
                { key: 'flagged', label: 'Flagged' },
                { key: 'all', label: 'All reviewable' },
              ] as { key: AdminLoanReviewFilter; label: string }[]).map(item => (
                <TouchableOpacity key={item.key} style={[styles.filterChip, reviewFilter === item.key && styles.filterChipActive]} onPress={() => { setSelectedApplication(null); setReviewFilter(item.key); }}>
                  <Text style={[styles.filterText, reviewFilter === item.key && styles.filterTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {reviewLoading && <View style={styles.customerState}><ActivityIndicator color="#2563eb" /><Text style={styles.loadingText}>Loading applications...</Text></View>}
            {!!reviewError && <View style={styles.errorCard}><Ionicons name="alert-circle-outline" size={20} color="#dc2626" /><Text style={styles.errorText}>{reviewError}</Text><TouchableOpacity onPress={() => void refreshReviewQueue()}><Text style={styles.retryText}>Retry</Text></TouchableOpacity></View>}

            {!reviewLoading && !reviewError && reviewApplications.length === 0 && (
              <View style={styles.chartPlaceholder}>
                <Ionicons name="file-tray-outline" size={34} color="#94a3b8" />
                <Text style={styles.chartPlaceholderText}>No {reviewFilter === 'all' ? 'reviewable' : reviewFilter} applications</Text>
                <Text style={styles.chartPlaceholderSub}>New applications will appear here when submitted.</Text>
              </View>
            )}

            {!selectedApplication && reviewApplications.map(application => {
              const customerName = [application.customer?.first_name, application.customer?.last_name].filter(Boolean).join(' ') || application.customer?.email || 'Customer';
              const colors = getStatusColors(application.status);
              return (
                <TouchableOpacity key={application.id} style={styles.applicationListCard} onPress={() => {
                  setSelectedApplication(application);
                  setApprovedAmountInput((application.requested_amount / 100).toFixed(2));
                  setRejectionReasonInput('');
                  setAdminNotesInput(application.admin_notes ?? '');
                }} activeOpacity={0.85}>
                  <View style={styles.applicationListTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.applicationCustomer}>{customerName}</Text>
                      <Text style={styles.clientCompany}>{application.employer?.name ?? 'No employer linked'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}><Text style={[styles.statusText, { color: colors.text }]}>{formatLoanStatus(application.status)}</Text></View>
                  </View>
                  <View style={styles.applicationListBottom}>
                    <Text style={styles.applicationAmount}>{formatRand(application.requested_amount)}</Text>
                    <Text style={styles.clientCompany}>{application.term_days} days · {formatDate(application.submitted_at || application.created_at)}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                  </View>
                </TouchableOpacity>
              );
            })}

            {selectedApplication && (() => {
              const app = selectedApplication;
              const customerName = [app.customer?.first_name, app.customer?.last_name].filter(Boolean).join(' ') || app.customer?.email || 'Customer';
              return (
                <View style={styles.reviewCard}>
                  <TouchableOpacity style={styles.backToQueue} onPress={() => setSelectedApplication(null)}>
                    <Ionicons name="arrow-back" size={17} color="#2563eb" /><Text style={styles.moreInfoText}>Back to applications</Text>
                  </TouchableOpacity>
                  <View style={styles.reviewClientHeader}>
                    <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{customerName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</Text></View>
                    <View style={styles.customerHeaderInfo}>
                      <Text style={styles.reviewClientName}>{customerName}</Text>
                      <Text style={styles.reviewClientCompany}>{app.customer?.email}</Text>
                      <Text style={styles.reviewClientCompany}>{app.employer?.name ?? 'No employer linked'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColors(app.status).bg }]}><Text style={[styles.statusText, { color: getStatusColors(app.status).text }]}>{formatLoanStatus(app.status)}</Text></View>
                  </View>
                  <View style={styles.reviewDivider} />
                  <Text style={styles.reviewSubTitle}>Application details</Text>
                  {[
                    { label: 'Requested amount', value: formatRand(app.requested_amount) },
                    { label: 'Approved amount', value: app.approved_amount == null ? '—' : formatRand(app.approved_amount) },
                    { label: 'Total repayable', value: app.total_repayable == null ? '—' : formatRand(app.total_repayable) },
                    { label: 'Interest rate', value: `${(app.interest_rate_bps / 100).toFixed(2)}%` },
                    { label: 'Loan term', value: `${app.term_days} days` },
                    { label: 'Due date', value: formatDate(app.due_date) },
                    { label: 'Purpose', value: app.purpose || '—' },
                    { label: 'Employee number', value: app.employee_number || app.customer?.employee_number || '—' },
                    { label: 'Monthly salary', value: app.monthly_salary == null ? '—' : formatRand(app.monthly_salary) },
                    { label: 'Pay day', value: app.pay_day == null ? '—' : String(app.pay_day) },
                    { label: 'Customer phone', value: app.customer?.phone || '—' },
                    { label: 'ID number', value: app.customer?.id_number || '—' },
                    { label: 'KYC status', value: app.customer?.kyc_status || '—' },
                    { label: 'Credit score', value: app.credit_score == null ? '—' : String(app.credit_score) },
                    { label: 'Risk level', value: app.risk_level || '—' },
                    { label: 'Submitted', value: formatDate(app.submitted_at || app.created_at) },
                  ].map(row => <View key={row.label} style={styles.reviewRow}><Text style={styles.reviewLabel}>{row.label}</Text><Text style={styles.reviewValue}>{row.value}</Text></View>)}

                  <View style={styles.reviewDivider} />
                  <Text style={styles.reviewSubTitle}>Documents ({app.documents?.length ?? 0})</Text>
                  {app.documents?.length ? app.documents.map(doc => (
                    <View key={doc.id} style={styles.documentReviewRow}>
                      <View style={{ flex: 1 }}><Text style={styles.docName}>{doc.file_name || doc.document_type}</Text><Text style={styles.clientCompany}>{doc.document_type.replace(/_/g, ' ')} · {doc.status}</Text></View>
                      <TouchableOpacity onPress={() => { if (doc.file_url) Linking.openURL(doc.file_url).catch(() => Alert.alert('Unable to open document', 'The document link could not be opened.')); }}><Text style={styles.docView}>Open</Text></TouchableOpacity>
                    </View>
                  )) : <Text style={styles.emptyLoanText}>No loan documents were returned.</Text>}

                  <View style={styles.reviewDivider} />
                  <Text style={styles.reviewSubTitle}>Consents ({app.consents?.length ?? 0})</Text>
                  {app.consents?.length ? app.consents.map(consent => (
                    <View key={consent.id} style={styles.consentReviewRow}>
                      <View style={{ flex: 1 }}><Text style={styles.docName}>{consent.consent_type.replace(/_/g, ' ')}</Text><Text style={styles.clientCompany}>Version {consent.consent_version} · {consent.accepted_at ? formatDate(consent.accepted_at) : 'No date'}</Text></View>
                      <Text style={[styles.consentSigned, { color: consent.accepted ? '#16a34a' : '#dc2626' }]}>{consent.accepted ? 'Accepted' : 'Not accepted'}</Text>
                    </View>
                  )) : <Text style={styles.emptyLoanText}>No consent records were returned.</Text>}

                  <View style={styles.reviewDivider} />
                  <Text style={styles.reviewSubTitle}>Review decision</Text>
                  <Text style={styles.inputLabel}>Approved amount (cents)</Text>
                  <TextInput value={approvedAmountInput} onChangeText={setApprovedAmountInput} keyboardType="numeric" placeholder="Enter amount in cents" placeholderTextColor="#94a3b8" style={styles.reviewInput} />
                  <Text style={styles.inputLabel}>Rejection reason (required to reject)</Text>
                  <TextInput value={rejectionReasonInput} onChangeText={setRejectionReasonInput} placeholder="Explain why the application is rejected" placeholderTextColor="#94a3b8" multiline style={[styles.reviewInput, styles.multilineInput]} />
                  <Text style={styles.inputLabel}>Internal admin notes (optional)</Text>
                  <TextInput value={adminNotesInput} onChangeText={setAdminNotesInput} placeholder="Add internal notes" placeholderTextColor="#94a3b8" multiline style={[styles.reviewInput, styles.multilineInput]} />
                  {reviewActionLoading && <View style={styles.customerState}><ActivityIndicator color="#2563eb" /><Text style={styles.loadingText}>Saving decision...</Text></View>}
                  <View style={styles.actionBtns}>
                    <TouchableOpacity disabled={reviewActionLoading} style={[styles.approveBtn, reviewActionLoading && styles.disabledAction]} onPress={() => void submitReviewAction('approve')}><Ionicons name="checkmark-circle-outline" size={18} color="#fff" /><Text style={styles.approveBtnText}>Approve</Text></TouchableOpacity>
                    <TouchableOpacity disabled={reviewActionLoading} style={[styles.rejectBtn, reviewActionLoading && styles.disabledAction]} onPress={() => void submitReviewAction('reject')}><Ionicons name="close-circle-outline" size={18} color="#fff" /><Text style={styles.rejectBtnText}>Reject</Text></TouchableOpacity>
                  </View>
                  <TouchableOpacity disabled={reviewActionLoading} style={styles.flagButton} onPress={() => void submitReviewAction('flag')}><Ionicons name="flag-outline" size={17} color="#b45309" /><Text style={styles.flagButtonText}>Flag for further investigation</Text></TouchableOpacity>
                </View>
              );
            })()}
          </View>
        )}

      </ScrollView>

      <Modal
        visible={pendingReviewAction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingReviewAction(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Ionicons
                name={pendingReviewAction === 'approve' ? 'checkmark-circle-outline' : pendingReviewAction === 'reject' ? 'close-circle-outline' : 'flag-outline'}
                size={30}
                color={pendingReviewAction === 'approve' ? '#16a34a' : pendingReviewAction === 'reject' ? '#dc2626' : '#b45309'}
              />
            </View>
            <Text style={styles.confirmTitle}>Confirm decision</Text>
            <Text style={styles.confirmMessage}>
              {pendingReviewAction === 'approve'
                ? 'Are you sure you want to approve this loan application?'
                : pendingReviewAction === 'reject'
                  ? 'Are you sure you want to reject this loan application?'
                  : 'Are you sure you want to flag this application for further investigation?'}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                disabled={reviewActionLoading}
                onPress={() => setPendingReviewAction(null)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmSubmitButton, pendingReviewAction === 'reject' && styles.confirmRejectButton, pendingReviewAction === 'flag' && styles.confirmFlagButton]}
                disabled={reviewActionLoading}
                onPress={() => void confirmReviewAction()}
              >
                {reviewActionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmSubmitText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  adminHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 0 },
  adminHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  adminTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  adminSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  adminHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  closeBtn: { padding: 4 },
  adminTabs: { flexDirection: 'row', gap: 4 },
  adminTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  adminTabActive: { backgroundColor: '#f0f4f8' },
  adminTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  adminTabTextActive: { color: '#2563eb' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  section: { padding: 20, gap: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  loadingText: { fontSize: 12, color: '#64748b' },
  customerCount: { fontSize: 12, color: '#64748b', marginTop: -8 },
  searchBox: {
    minHeight: 46,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, color: '#1e293b', fontSize: 13, paddingVertical: 10 },
  customerState: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  customerHeaderInfo: { flex: 1 },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: { flex: 1, color: '#dc2626', fontSize: 12 },
  retryText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },
  capitalCard: { borderRadius: 18, overflow: 'hidden' },
  capitalGradient: { padding: 20, gap: 16 },
  capitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capitalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.2,
  },
  capitalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  capitalStats: { flexDirection: 'row', justifyContent: 'space-between' },
  capitalStat: { flex: 1, alignItems: 'center' },
  capitalStatSep: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  capitalStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  capitalStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  approvedTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  approvedTotalValue: { fontSize: 17, fontWeight: '800', color: '#16a34a' },
  approvedLoanRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12 },
  approvedLoanInfo: { flex: 1, gap: 3 },
  approvedLoanName: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  approvedLoanMeta: { fontSize: 10, color: '#64748b' },
  approvedLoanAmountWrap: { alignItems: 'flex-end', gap: 3 },
  approvedLoanAmount: { fontSize: 13, fontWeight: '800', color: '#16a34a' },
  approvedLoanStatus: { fontSize: 10, color: '#16a34a', fontWeight: '700' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: { fontSize: 12, color: '#64748b' },
  summaryValue: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  chartPlaceholderSub: { fontSize: 11, color: '#cbd5e1' },
  filterRow: { gap: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  clientList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  clientRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  clientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  reviewClientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: 18, fontWeight: '800', color: '#2563eb' },
  reviewClientName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  reviewClientCompany: { fontSize: 12, color: '#64748b' },
  reviewDivider: { height: 1, backgroundColor: '#f1f5f9' },
  loanHistoryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 13,
    gap: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loanHistoryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  loanHistoryAmount: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  loanHistoryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  emptyLoanText: { color: '#64748b', fontSize: 12, paddingVertical: 8 },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewLabel: { fontSize: 13, color: '#64748b' },
  reviewValue: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  reviewSubTitle: { fontSize: 13, fontWeight: '700', color: '#475569' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docName: { flex: 1, fontSize: 13, color: '#1e293b' },
  docBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  docBadgeText: { fontSize: 10, fontWeight: '600', color: '#16a34a' },
  docView: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  consentLabel: { flex: 1, fontSize: 13, color: '#1e293b' },
  consentSigned: { fontSize: 11, fontWeight: '600', color: '#16a34a' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  approveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rejectBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  moreInfoBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  moreInfoText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },
  actionResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 14,
  },
  actionResultText: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  reviewEmpty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  reviewEmptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  reviewEmptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  goClientsBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  reviewHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: '#eff6ff' },
  refreshButtonText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },
  applicationListCard: { backgroundColor: '#fff', borderRadius: 14, padding: 15, gap: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  applicationListTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  applicationListBottom: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  applicationCustomer: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  applicationAmount: { fontSize: 15, fontWeight: '800', color: '#0f172a', flex: 1 },
  backToQueue: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  documentReviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  consentReviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 3 },
  reviewInput: { minHeight: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#1e293b', backgroundColor: '#fff', fontSize: 13 },
  multilineInput: { minHeight: 76, textAlignVertical: 'top' },
  disabledAction: { opacity: 0.5 },
  flagButton: { minHeight: 44, borderRadius: 11, borderWidth: 1, borderColor: '#fcd34d', backgroundColor: '#fffbeb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  flagButtonText: { color: '#b45309', fontSize: 13, fontWeight: '700' },
  goClientsBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmCard: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 18, padding: 22, gap: 12, alignItems: 'center' },
  confirmIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  confirmTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  confirmMessage: { fontSize: 14, lineHeight: 21, color: '#64748b', textAlign: 'center' },
  confirmActions: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 },
  confirmCancelButton: { flex: 1, minHeight: 44, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  confirmCancelText: { color: '#334155', fontSize: 14, fontWeight: '700' },
  confirmSubmitButton: { flex: 1, minHeight: 44, borderRadius: 10, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' },
  confirmRejectButton: { backgroundColor: '#dc2626' },
  confirmFlagButton: { backgroundColor: '#b45309' },
  confirmSubmitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});