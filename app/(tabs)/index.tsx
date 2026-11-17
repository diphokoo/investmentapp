
import AdminScreen from '@/components/admin/AdminScreen';
import AuthScreen from '@/components/auth/AuthScreen';
import { NavTab } from '@/components/dashboard/BottomNav';
import DashboardScreen from '@/components/dashboard/DashboardScreen';
import LoansScreen from '@/components/loans/LoansScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Screen = 'auth' | 'admin' | NavTab;

function hasAdminAccess(role?: string | null): boolean {
  const normalizedRole = role?.toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'super_admin';
}

function AppContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const [screen, setScreen] = useState<Screen>('auth');
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Select the correct landing screen after login or session restoration.
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setScreen('auth');
      return;
    }

    setScreen(hasAdminAccess(user.role) ? 'admin' : 'history');
  }, [authLoading, user?.id, user?.role]);

  if (splash || authLoading) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
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

  if (!user || screen === 'auth') {
    return <AuthScreen />;
  }

  if (screen === 'admin') {
    if (!hasAdminAccess(user.role)) {
      return <AuthScreen />;
    }

    return <AdminScreen onClose={() => setScreen('history')} />;
  }

  return (
    <View style={styles.root}>
      {screen === 'history' && (
        <DashboardScreen onNavChange={handleNav} />
      )}

      {screen === 'loans' && (
        <LoansScreen onNavChange={handleNav} />
      )}

      {screen === 'settings' && (
        <SettingsScreen onNavChange={handleNav} />
      )}
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
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    backgroundColor: '#14532d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 220,
    height: 160,
  },
});
