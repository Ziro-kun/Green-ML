import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Tip {
  id: number;
  icon: string;
  color: string;
  bg: string;
  category: string;
  title: string;
  desc: string;
  impact: string;
  saving: string;
  detail: string;
}

interface AdvisorData {
  summary: string;
  total_savings_kg: number;
  tips: Tip[];
}

const API_URL = "https://continently-shunnable-tripp.ngrok-free.dev";

export default function AdvisorScreen() {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set());
  const [data, setData] = useState<AdvisorData | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 세션 목록 가져오기
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions?limit=10`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const json = await res.json();
      setSessions(json);
      // 만약 선택된 세션이 없으면 가장 최신 세션을 기본값으로 설정
      if (json.length > 0 && selectedSessionId === null) {
        setSelectedSessionId(json[0].id);
      }
    } catch (err) {
      console.error("세션 목록 로드 실패:", err);
    }
  };

  const fetchAdvisorData = async (sessionId: number | null) => {
    try {
      setLoading(true);
      const url = sessionId 
        ? `${API_URL}/advisor?session_id=${sessionId}`
        : `${API_URL}/advisor`;
        
      const res = await fetch(url, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      if (!res.ok) throw new Error("Response fail");
      const json = await res.json();
      setData(json);
      setError(false);
    } catch (err) {
      console.error("어드바이저 로드 실패:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions().then(() => {
      fetchAdvisorData(selectedSessionId);
    });
  }, [selectedSessionId]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchSessions();
    await fetchAdvisorData(selectedSessionId);
    setRefreshing(false);
  }, [selectedSessionId]);

  const toggleTip = (id: number) => {
    setSelectedTip(selectedTip === id ? null : id);
  };

  const toggleApply = (id: number) => {
    const next = new Set(applied);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setApplied(next);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, color: "#666" }}>AI 분석 중...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.center}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#CCC" />
        <Text style={{ marginTop: 16, color: "#666", textAlign: 'center', paddingHorizontal: 40 }}>
          AI 분석 데이터를 가져올 수 없습니다.{"\n"}네트워크 연결 상태를 확인하고 다시 시도해주세요.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="leaf" size={16} color="#4CAF50" />
          <Text style={styles.logoText}>Green-ML</Text>
        </View>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>AI 어드바이저</Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={10} color="#9C27B0" />
            <Text style={styles.aiBadgeText}>AI 분석</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>{data.summary}</Text>
      </View>

      {/* 세션 선택 Picker 추가 */}
      <View style={styles.sessionPickerContainer}>
        <Text style={styles.pickerTitle}>분석할 세션 선택</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sessionScrollEnv}>
          {sessions.map((s) => (
            <TouchableOpacity 
              key={s.id} 
              onPress={() => setSelectedSessionId(s.id)}
              style={[
                styles.sessionChip, 
                selectedSessionId === s.id && styles.sessionChipActive
              ]}
            >
              <Text style={[
                styles.sessionChipText,
                selectedSessionId === s.id && styles.sessionChipTextActive
              ]}>
                #{s.id} {s.project_name.substring(0, 15)}...
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <View style={styles.banner}>
          <View style={styles.bannerDoc}>
            <Text style={styles.bannerLabel}>권장사항 모두 적용 시 예상 절감</Text>
            <Text style={styles.bannerValue}>{(data.total_savings_kg || 0).toFixed(4)} kg CO₂</Text>
            <Text style={styles.bannerSub}>현재 학습 패턴 분석 결과</Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="bulb" size={32} color="white" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>사용자 맞춤 개선 권장사항</Text>
        {data.tips.map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <TouchableOpacity
              style={styles.tipHeader}
              onPress={() => toggleTip(tip.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.tipIconBox, { backgroundColor: tip.bg }]}>
                <Ionicons name={tip.icon as any} size={20} color={tip.color} />
              </View>
              <View style={styles.tipMain}>
                <View style={styles.tipBadgeRow}>
                  <View
                    style={[styles.categoryBadge, { backgroundColor: tip.bg }]}
                  >
                    <Text style={[styles.categoryText, { color: tip.color }]}>
                      {tip.category}
                    </Text>
                  </View>
                  <Text style={styles.impactText}>● {tip.impact}</Text>
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc} numberOfLines={2}>
                  {tip.desc}
                </Text>
              </View>
              <Ionicons
                name={selectedTip === tip.id ? "chevron-up" : "chevron-forward"}
                size={18}
                color="#DDD"
              />
            </TouchableOpacity>

            {selectedTip === tip.id && (
              <View style={styles.tipDetail}>
                <View style={styles.detailBox}>
                  <Text style={styles.detailText}>{tip.detail}</Text>
                  <View style={styles.savingRow}>
                    <Ionicons name="leaf" size={12} color="#4CAF50" />
                    <Text style={styles.savingText}>
                      예상 효과: {tip.saving}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    applied.has(tip.id) && styles.appliedButton,
                  ]}
                  onPress={() => toggleApply(tip.id)}
                >
                  <Ionicons
                    name={
                      applied.has(tip.id)
                        ? "checkmark-circle"
                        : "add-circle-outline"
                    }
                    size={18}
                    color={applied.has(tip.id) ? "#4CAF50" : "white"}
                  />
                  <Text
                    style={[
                      styles.applyButtonText,
                      applied.has(tip.id) && styles.appliedButtonText,
                    ]}
                  >
                    {applied.has(tip.id) ? "적용 완료" : "적용 표시하기"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { color: "#4CAF50", fontSize: 13, fontWeight: "600" },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E5F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  aiBadgeText: { color: "#9C27B0", fontSize: 10, fontWeight: "700" },
  headerSub: { color: "#999", fontSize: 12, marginTop: 4 },
  sessionPickerContainer: {
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pickerTitle: {
    fontSize: 11,
    color: "#666",
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sessionScrollEnv: { paddingHorizontal: 16, gap: 8 },
  sessionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sessionChipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  sessionChipText: { fontSize: 12, color: "#666", fontWeight: "600" },
  sessionChipTextActive: { color: "white" },
  content: { padding: 16 },
  banner: {
    backgroundColor: "#2E7D32",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  bannerDoc: { flex: 1 },
  bannerLabel: { color: "#A5D6A7", fontSize: 11, fontWeight: "600" },
  bannerValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  bannerSub: { color: "#A5D6A7", fontSize: 12, marginTop: 4 },
  bannerIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: "white",
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  tipMain: { flex: 1 },
  tipBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: "700" },
  impactText: { fontSize: 10, color: "#FF9800", fontWeight: "600" },
  tipTitle: { fontSize: 15, fontWeight: "700", color: "#333", marginTop: 6 },
  tipDesc: { fontSize: 12, color: "#888", marginTop: 4 },
  tipDetail: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F9F9F9",
  },
  detailBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  detailText: { fontSize: 12, color: "#666" },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  savingText: { fontSize: 11, color: "#4CAF50", fontWeight: "600" },
  applyButton: {
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  appliedButton: { backgroundColor: "#E8F5E9" },
  applyButtonText: { color: "white", fontSize: 14, fontWeight: "700" },
  appliedButtonText: { color: "#4CAF50" },
});
