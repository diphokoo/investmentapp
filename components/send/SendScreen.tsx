import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav, { NavTab } from '../dashboard/BottomNav';
import InputField from '../shared/InputField';
import TransactionPINInput from '../shared/TransactionPINInput';
import GradientButton from '../shared/GradientButton';

type TransferType = 'p2p' | 'bank' | null;

const BANKS = ['ABSA', 'FNB', 'Standard Bank', 'Nedbank', 'Capitec', 'African Bank', 'TymeBank'];

interface Props { onNavChange?: (tab: NavTab) => void }

export default function SendScreen({ onNavChange }: Props) {
  const [activeNav, setActiveNav] = useState<NavTab>('send');
  const [transferType, setTransferType] = useState<TransferType>(null);
  const [showPIN, setShowPIN] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankPicker, setShowBankPicker] = useState(false);

  const handleNav = (tab: NavTab) => { setActiveNav(tab); onNavChange?.(tab); };

  const handleConfirm = () => { setShowPIN(true); };
  const handlePINComplete = () => { setShowPIN(false); setShowSuccess(true); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Send / Transfer</Text>
          <Ionicons name="paper-plane-outline" size={24} color="#2563eb" />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Balance Chip */}
          <LinearGradient colors={['#0f2d6b', '#1a56c4']} style={styles.balanceChip}>
            <Text style={styles.balanceLabel}>Available Credit</Text>
            <Text style={styles.balanceAmount}>R5,000.00</Text>
          </LinearGradient>

          {/* Transfer Type Selection */}
          {!transferType && (
            <View style={styles.typeSection}>
              <Text style={styles.sectionTitle}>Choose Transfer Type</Text>
              <TouchableOpacity style={styles.typeCard} onPress={() => setTransferType('p2p')} activeOpacity={0.85}>
                <View style={[styles.typeIcon, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="people-outline" size={28} color="#2563eb" />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeTitle}>Peer to Peer</Text>
                  <Text style={styles.typeSub}>Send to another PayAdvance wallet user</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.typeCard} onPress={() => setTransferType('bank')} activeOpacity={0.85}>
                <View style={[styles.typeIcon, { backgroundColor: '#f0fdf4' }]}>
                  <Ionicons name="business-outline" size={28} color="#16a34a" />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeTitle}>Bank Withdrawal</Text>
                  <Text style={styles.typeSub}>Withdraw to your personal bank account</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          )}

          {/* P2P Form */}
          {transferType === 'p2p' && (
            <View style={styles.formSection}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setTransferType(null)}>
                <Ionicons name="arrow-back" size={18} color="#2563eb" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Peer to Peer Transfer</Text>
              <View style={styles.formCard}>
                <InputField label="Recipient Username or Phone" icon="person-outline" placeholder="@username or 082..." />
                <InputField label="Amount (R)" icon="cash-outline" placeholder="0.00" keyboardType="numeric" />
                <InputField label="Reference / Note" icon="chatbubble-outline" placeholder="e.g. Loan repayment" />
                <GradientButton label="Confirm Transfer" onPress={handleConfirm} />
              </View>
            </View>
          )}

          {/* Bank Withdrawal Form */}
          {transferType === 'bank' && (
            <View style={styles.formSection}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setTransferType(null)}>
                <Ionicons name="arrow-back" size={18} color="#2563eb" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Bank Withdrawal</Text>
              <View style={styles.formCard}>
                {/* Bank Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Select Bank</Text>
                  <TouchableOpacity style={styles.bankSelector} onPress={() => setShowBankPicker(true)}>
                    <Ionicons name="business-outline" size={18} color="#94a3b8" />
                    <Text style={[styles.bankSelectorText, !selectedBank && styles.bankSelectorPlaceholder]}>
                      {selectedBank || 'Choose your bank'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                <InputField label="Account Holder Name" icon="person-outline" placeholder="Full name as per bank" />
                <InputField label="Account Number" icon="card-outline" placeholder="1234567890" keyboardType="numeric" />
                <InputField label="Branch Code" icon="code-outline" placeholder="e.g. 632005" keyboardType="numeric" />
                <InputField label="Amount (R)" icon="cash-outline" placeholder="0.00" keyboardType="numeric" />
                <View style={styles.warningBox}>
                  <Ionicons name="information-circle-outline" size={16} color="#d97706" />
                  <Text style={styles.warningText}>Withdrawals are processed within 1–2 business days.</Text>
                </View>
                <GradientButton label="Confirm Withdrawal" onPress={handleConfirm} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* PIN Modal */}
        <Modal visible={showPIN} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pinCard}>
              <Text style={styles.pinTitle}>Confirm Transaction</Text>
              <Text style={styles.pinSub}>Enter your 6-digit transaction PIN</Text>
              <TransactionPINInput onComplete={handlePINComplete} />
              <TouchableOpacity onPress={() => setShowPIN(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
              <Text style={styles.successTitle}>Transfer Successful!</Text>
              <Text style={styles.successSub}>Your transaction has been processed successfully.</Text>
              <GradientButton label="Done" variant="success" onPress={() => { setShowSuccess(false); setTransferType(null); }} />
            </View>
          </View>
        </Modal>

        {/* Bank Picker Modal */}
        <Modal visible={showBankPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Select Bank</Text>
              {BANKS.map(bank => (
                <TouchableOpacity
                  key={bank}
                  style={[styles.bankOption, selectedBank === bank && styles.bankOptionActive]}
                  onPress={() => { setSelectedBank(bank); setShowBankPicker(false); }}
                >
                  <Text style={[styles.bankOptionText, selectedBank === bank && styles.bankOptionTextActive]}>{bank}</Text>
                  {selectedBank === bank && <Ionicons name="checkmark" size={18} color="#2563eb" />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowBankPicker(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  balanceChip: {
    borderRadius: 14, padding: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  balanceAmount: { fontSize: 20, fontWeight: '800', color: '#fff' },
  typeSection: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  typeIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  typeInfo: { flex: 1 },
  typeTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  typeSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  formSection: { gap: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  formCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  bankSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#e2e8f0', paddingHorizontal: 12, height: 50,
  },
  bankSelectorText: { flex: 1, fontSize: 15, color: '#1e293b' },
  bankSelectorPlaceholder: { color: '#cbd5e1' },
  warningBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fffbeb', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#fde68a',
  },
  warningText: { flex: 1, fontSize: 11, color: '#92400e' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pinCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, gap: 16, alignItems: 'center',
  },
  pinTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  pinSub: { fontSize: 13, color: '#64748b' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', width: '100%' },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  successCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 32, gap: 14, alignItems: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  successSub: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  pickerCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 4,
  },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  bankOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10,
  },
  bankOptionActive: { backgroundColor: '#eff6ff' },
  bankOptionText: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
  bankOptionTextActive: { color: '#2563eb', fontWeight: '700' },
});
