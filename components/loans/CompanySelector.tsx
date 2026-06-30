import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export interface Company {
  id: string;
  name: string;
  sector: string;
  icon: string;
}

const COMPANIES: Company[] = [
  { id: '1', name: 'Acme Corporation',    sector: 'Manufacturing',    icon: '🏭' },
  { id: '2', name: 'Metro Municipality',  sector: 'Government',       icon: '🏛️' },
  { id: '3', name: 'Sunrise Retail',      sector: 'Retail',           icon: '🛒' },
  { id: '4', name: 'TechBridge SA',       sector: 'Technology',       icon: '💻' },
  { id: '5', name: 'HealthFirst Clinic',  sector: 'Healthcare',       icon: '🏥' },
  { id: '6', name: 'BuildRight Const.',   sector: 'Construction',     icon: '🏗️' },
];

interface Props {
  onSelect: (company: Company) => void;
  onBack: () => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function CompanySelector({ onSelect, onBack, search, onSearchChange }: Props) {
  const filtered = COMPANIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sector.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#2563eb" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Select Your Employer</Text>
      <Text style={styles.sub}>Choose the company you are employed by</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search company..."
          placeholderTextColor="#cbd5e1"
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      <View style={styles.grid}>
        {filtered.map(company => (
          <TouchableOpacity
            key={company.id}
            style={styles.card}
            onPress={() => onSelect(company)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>{company.icon}</Text>
            <Text style={styles.cardName}>{company.name}</Text>
            <Text style={styles.cardSector}>{company.sector}</Text>
            <View style={styles.selectBtn}>
              <Text style={styles.selectText}>Select</Text>
              <Ionicons name="chevron-forward" size={12} color="#2563eb" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub: { fontSize: 13, color: '#64748b', marginTop: -8 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 12, height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1e293b' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#e2e8f0', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardIcon: { fontSize: 28 },
  cardName: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  cardSector: { fontSize: 11, color: '#64748b' },
  selectBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  selectText: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
});
