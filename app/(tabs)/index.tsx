import { useState } from 'react';
import AuthScreen from '@/components/auth/AuthScreen';
import DashboardScreen from '@/components/dashboard/DashboardScreen';
import SendScreen from '@/components/send/SendScreen';
import HistoryScreen from '@/components/history/HistoryScreen';
import LoansScreen from '@/components/loans/LoansScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import AdminScreen from '@/components/admin/AdminScreen';
import { NavTab } from '@/components/dashboard/BottomNav';
import { Modal, StyleSheet, View } from 'react-native';

type Screen = 'auth' | 'dashboard' | NavTab;

export default function Index() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [showAdmin, setShowAdmin] = useState(false);

  const handleNav = (tab: NavTab) => {
    if (tab === 'logout') {
      setScreen('auth');
      return;
    }
    setScreen(tab);
  };

  if (screen === 'auth') {
    return <AuthScreen onLoginSuccess={() => setScreen('history')} />;
  }

  return (
    <View style={styles.root}>
      {screen === 'history'  && <DashboardScreen onNavChange={handleNav} />}
      {screen === 'send'     && <SendScreen      onNavChange={handleNav} />}
      {screen === 'loans'    && <LoansScreen     onNavChange={handleNav} />}
      {screen === 'settings' && <SettingsScreen  onNavChange={handleNav} />}

      {/* Admin Panel Modal — accessible from Settings */}
      <Modal visible={showAdmin} animationType="slide" onRequestClose={() => setShowAdmin(false)}>
        <AdminScreen onClose={() => setShowAdmin(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
