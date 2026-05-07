import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import SubScreenShell from './shared/SubScreenShell';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

interface Props { onBack: () => void }

const FAQS = [
  { q: 'How do I send money?',           a: 'Tap the "Send" button on the dashboard, enter the recipient details and amount, then confirm with your PIN.' },
  { q: 'How do I reset my PIN?',          a: 'Go to Settings → Security → Transaction PIN and enter a new 6-digit PIN.' },
  { q: 'Why is my account limited?',      a: 'Account limits are applied when KYC verification is incomplete. Visit Settings → KYC Verification to upload your documents.' },
  { q: 'How long do transfers take?',     a: 'Instant transfers are processed within seconds. Bank transfers may take 1–2 business days.' },
  { q: 'How do I contact support?',       a: 'Use the "Contact Support" button below or email support@finvest.app.' },
  { q: 'Is my data secure?',             a: 'Yes. We use 256-bit encryption and two-factor authentication to keep your account safe.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  };
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqHeader} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.faqQ}>{q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#94a3b8" />
      </TouchableOpacity>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </View>
  );
}

export default function HelpScreen({ onBack }: Props) {
  return (
    <SubScreenShell title="Help Center" onBack={onBack}>

      {/* Hero */}
      <LinearGradient colors={['#1d4ed8', '#7c3aed']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="help-buoy-outline" size={30} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>How can we help?</Text>
        <Text style={styles.heroSub}>Browse FAQs or reach out to our team</Text>
      </LinearGradient>

      {/* FAQ */}
      <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
      <View style={styles.card}>
        {FAQS.map((f, i) => (
          <View key={i}>
            <FAQItem q={f.q} a={f.a} />
            {i < FAQS.length - 1 && <View style={styles.sep} />}
          </View>
        ))}
      </View>

      {/* Contact */}
      <TouchableOpacity activeOpacity={0.85} style={styles.btnWrap}>
        <LinearGradient colors={['#1d4ed8', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Contact Support</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20, padding: 24, alignItems: 'center', gap: 8,
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  heroIcon: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  heroSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase' },
  card: {
    backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  faqItem: { paddingVertical: 14, gap: 8 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b' },
  faqA: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  sep: { height: 1, backgroundColor: '#f1f5f9' },
  btnWrap: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  btn: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
