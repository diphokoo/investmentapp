import { LinearGradient } from 'expo-linear-gradient';
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
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#0f2d6b', '#1a56c4', '#eff6ff']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>💼</Text>
            </View>
            <Text style={styles.logo}>PayAdvance</Text>
            <Text style={styles.tagline}>Salary Advance & Payday Loans</Text>
            <Text style={styles.sub}>Fast · Secure · Compliant</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabBar}>
              {(['login', 'register'] as Tab[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab === 'login' ? 'Sign In' : 'Register'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {activeTab === 'login'
              ? <LoginForm onLoginSuccess={onLoginSuccess} />
              : <RegisterForm />}
          </View>

          <Text style={styles.legal}>
            By continuing, you agree to our Terms of Service and Privacy Policy.{'\n'}
            Registered Credit Provider — NCR Reg. No. NCRCP0000
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 28 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoIcon: { fontSize: 36 },
  logo: { fontSize: 28, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  card: {
    width: '100%', maxWidth: 400, backgroundColor: '#ffffff',
    borderRadius: 22, padding: 24,
    shadowColor: '#0f2d6b', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 28, elevation: 12, gap: 20,
  },
  tabBar: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  tabTextActive: { color: '#1e293b', fontWeight: '700' },
  legal: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 20, lineHeight: 16 },
});
