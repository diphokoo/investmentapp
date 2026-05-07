import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type Tab = 'login' | 'register';

interface Props { onLoginSuccess?: () => void; }

export default function AuthScreen({ onLoginSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('login');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💎 Finvest</Text>
          <Text style={styles.tagline}>Your premium investment companion</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Segmented Tabs */}
          <View style={styles.tabBar}>
            {(['login', 'register'] as Tab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          {activeTab === 'login'
            ? <LoginForm onLoginSuccess={onLoginSuccess} />
            : <RegisterForm />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#dbeafe', // fallback; gradient via LinearGradient if needed
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    // Soft gradient simulation via background
    backgroundColor: '#eff6ff',
  },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 26, fontWeight: '800', color: '#1e3a8a', letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: '#64748b', marginTop: 4 },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    gap: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  tabTextActive: { color: '#1e293b' },
});
