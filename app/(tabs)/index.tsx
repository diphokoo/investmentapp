import { useState, useEffect } from 'react';
import { Image, Modal, StyleSheet, View } from 'react-native';
import AuthScreen from '@/components/auth/AuthScreen';
import DashboardScreen from '@/components/dashboard/DashboardScreen';
import HistoryScreen from '@/components/history/HistoryScreen';
import LoansScreen from '@/components/loans/LoansScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import AdminScreen from '@/components/admin/AdminScreen';
import { NavTab } from '@/components/dashboard/BottomNav';
import { AuthProvider, useAuth } from '@/lib/auth-context';

type Screen = 'auth' | NavTab;

function AppContent() {
  const { user, logout } = useAuth();
  const [screen, setScreen]     = useState<Screen>('auth');
  const [showAdmin, setShowAdmin] = useState(false);
  const [splash, setSplash]       = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // If user logs out from anywhere, return to auth
  useEffect(() => {
    if (!user) setScreen('auth');
  }, [user]);

  if (splash) {
    return (
      <View style={styles.splash}>
        <Image source={require('../../assets/images/logo.png')} style={styles.splashLogo} resizeMode="contain" />
      </View>
    );
  }

  const handleNav = async (tab: NavTab) => {
    if (tab === 'logout') {
      await logout();
      return;
    }
    setScreen(tab);
  };

  if (screen === 'auth' || !user) {
    return <AuthScreen onLoginSuccess={() => setScreen('history')} />;
  }

  return (
    <View style={styles.root}>
      {screen === 'history'  && <DashboardScreen onNavChange={handleNav} />}
      {screen === 'loans'    && <LoansScreen     onNavChange={handleNav} />}
      {screen === 'settings' && <SettingsScreen  onNavChange={handleNav} />}

      <Modal visible={showAdmin} animationType="slide" onRequestClose={() => setShowAdmin(false)}>
        <AdminScreen onClose={() => setShowAdmin(false)} />
      </Modal>
    </View>
  );
}

export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  splash:     { flex: 1, backgroundColor: '#14532d', alignItems: 'center', justifyContent: 'center' },
  splashLogo: { width: 220, height: 160 },
});
