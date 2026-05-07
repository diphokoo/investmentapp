import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AuthScreen from '@/components/auth/AuthScreen';
import DashboardScreen from '@/components/dashboard/DashboardScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import { NavTab } from '@/components/dashboard/BottomNav';

type AppScreen = 'auth' | 'dashboard' | 'settings';

export default function Index() {
  const [screen, setScreen] = useState<AppScreen>('auth');

  const handleNav = (tab: NavTab) => {
    if (tab === 'settings') setScreen('settings');
    if (tab === 'history')  setScreen('dashboard');
    // 'send' and 'logout' can be wired later
  };

  return (
    <View style={styles.root}>
      {screen === 'auth' && (
        <AuthScreen onLoginSuccess={() => setScreen('dashboard')} />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen onNavChange={handleNav} />
      )}
      {screen === 'settings' && (
        <SettingsScreen onNavChange={handleNav} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
