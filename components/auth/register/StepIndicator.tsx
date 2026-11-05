import { StyleSheet, Text, View } from 'react-native';

const STEPS = [
  { label: 'Personal Info' },
  { label: 'Documents' },
  { label: 'Complete' },
];

interface Props { current: number; }

export default function StepIndicator({ current }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {STEPS.map((_, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <View key={i} style={styles.stepWrap}>
              <View style={[styles.circle, done && styles.circleDone, active && styles.circleActive]}>
                <Text style={[styles.num, (done || active) && styles.numActive]}>
                  {done ? '✓' : i + 1}
                </Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.line, done && styles.lineDone]} />
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.title}>{STEPS[current].label}</Text>
      <Text style={styles.sub}>Step {current + 1} of {STEPS.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:        { alignItems: 'center', gap: 8, marginBottom: 4 },
  track:       { flexDirection: 'row', alignItems: 'center' },
  stepWrap:    { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center', justifyContent: 'center',
  },
  circleActive: { borderColor: '#16a34a', backgroundColor: '#16a34a' },
  circleDone:   { borderColor: '#16a34a', backgroundColor: '#16a34a' },
  num:          { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  numActive:    { color: '#fff' },
  line:         { width: 28, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 2 },
  lineDone:     { backgroundColor: '#16a34a' },
  title:        { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  sub:          { fontSize: 11, color: '#94a3b8' },
});
