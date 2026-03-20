import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmissionRecord {
  id: number;
  project_name: string;
  emissions: number;
  energy_consumed: number;
  duration: number;
  timestamp: string;
}

const API_URL = "https://continently-shunnable-tripp.ngrok-free.dev";

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<EmissionRecord[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${API_URL}/sessions?limit=20`,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      if (data) {
        setSessions([...data].sort((a, b) => b.id - a.id));
      }
      setError(false);
    } catch (err) {
      console.error("이력 로드 실패:", err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const totalEmissions = sessions.reduce((acc, s) => acc + s.emissions, 0);
  const totalEnergy = sessions.reduce((acc, s) => acc + s.energy_consumed, 0);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 12, color: "#666" }}>이력을 가져오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.center}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Ionicons name="alert-circle-outline" size={60} color="#CCC" />
        <Text style={{ marginTop: 16, color: "#666" }}>이력을 불러올 수 없습니다.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="leaf" size={16} color="#4CAF50" />
          <Text style={styles.logoText}>Green-ML</Text>
        </View>
        <Text style={styles.headerTitle}>학습 이력</Text>
        <Text style={styles.headerSub}>총 {sessions.length}개 세션 기록 완료</Text>
      </View>

      <View style={styles.content}>
        {/* Cumulative Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#2E7D32' }]}>
            <Text style={styles.statLabelWhite}>누적 탄소 배출</Text>
            <Text style={styles.statValueWhite}>{totalEmissions.toFixed(3)}</Text>
            <Text style={styles.statUnitWhite}>kg CO₂-eq</Text>
          </View>
          <View style={styles.statCardWhite}>
            <Text style={styles.statLabel}>누적 에너지 소비</Text>
            <Text style={styles.statValue}>{totalEnergy.toFixed(3)}</Text>
            <Text style={styles.statUnit}>kWh</Text>
          </View>
        </View>

        {/* Session List */}
        <Text style={styles.sectionTitle}>전체 세션 목록</Text>
        {sessions.map((s) => {
          const isExpanded = expanded === s.id;
          return (
            <View key={s.id} style={styles.sessionCard}>
              <TouchableOpacity 
                style={styles.sessionHeader} 
                onPress={() => setExpanded(isExpanded ? null : s.id)}
                activeOpacity={0.7}
              >
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>A</Text>
                </View>
                <View style={styles.sessionMain}>
                  <Text style={styles.projectName} numberOfLines={1}>{s.project_name}</Text>
                  <Text style={styles.timestamp}>{new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.emissionValue}>{s.emissions.toFixed(4)}</Text>
                  <Text style={styles.emissionUnit}>kg CO₂</Text>
                </View>
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#DDD" 
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedDetail}>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>에너지</Text>
                      <Text style={styles.detailValue}>{s.energy_consumed.toFixed(3)} kWh</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>학습 시간</Text>
                      <Text style={styles.detailValue}>{Math.floor(s.duration)}초</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
  headerSub: { color: '#999', fontSize: 12, marginTop: 4 },

  content: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 20, padding: 16 },
  statCardWhite: { flex: 1, borderRadius: 20, padding: 16, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statLabel: { color: '#999', fontSize: 11, fontWeight: '600' },
  statLabelWhite: { color: '#A5D6A7', fontSize: 11, fontWeight: '600' },
  statValue: { color: '#1A1A1A', fontSize: 20, fontWeight: '800', marginTop: 4 },
  statValueWhite: { color: 'white', fontSize: 20, fontWeight: '800', marginTop: 4 },
  statUnit: { color: '#999', fontSize: 11, marginTop: 2 },
  statUnitWhite: { color: '#A5D6A7', fontSize: 11, marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#444', marginBottom: 12 },
  sessionCard: { backgroundColor: 'white', borderRadius: 18, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, overflow: 'hidden' },
  sessionHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  gradeBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  gradeText: { fontSize: 16, fontWeight: '800', color: '#2E7D32' },
  sessionMain: { flex: 1 },
  projectName: { fontSize: 14, fontWeight: '600', color: '#333' },
  timestamp: { fontSize: 10, color: '#999', marginTop: 2 },
  sessionInfo: { alignItems: 'flex-end', marginRight: 4 },
  emissionValue: { fontSize: 14, fontWeight: '700', color: '#212121' },
  emissionUnit: { fontSize: 10, color: '#757575', marginTop: 2 },

  expandedDetail: { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#F9F9F9' },
  detailGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  detailItem: { flex: 1, backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10 },
  detailLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  detailValue: { fontSize: 12, fontWeight: '600', color: '#444' },
});
