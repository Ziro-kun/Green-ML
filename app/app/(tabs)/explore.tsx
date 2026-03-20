import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const tips = [
  {
    id: 1,
    icon: "time-outline",
    color: "#3b82f6",
    bg: "#eff6ff",
    category: "학습 최적화",
    title: "조기 종료(Early Stopping) 적용",
    desc: "과적합 감지 시 학습을 자동 중단하여 불필요한 연산을 최대 40% 줄일 수 있습니다.",
    impact: "높음",
    saving: "~0.07 kg CO₂",
    detail:
      "patience=10 설정으로 검증 손실이 개선되지 않으면 자동 종료합니다. GPT-2 Fine-tune 세션에서 특히 효과적입니다.",
  },
  {
    id: 2,
    icon: "server-outline",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    category: "인프라",
    title: "재생에너지 데이터센터 활용",
    desc: "AWS us-west-2 (오리건) 리전은 탄소 집약도가 낮아 동일 작업 대비 배출량을 60% 감소시킵니다.",
    impact: "매우 높음",
    saving: "~0.15 kg CO₂",
    detail:
      "현재 사용 중인 리전의 Carbon Intensity: 210 gCO₂/kWh → us-west-2: 45 gCO₂/kWh",
  },
  {
    id: 3,
    icon: "zap-outline",
    color: "#f59e0b",
    bg: "#fffbeb",
    category: "배치 최적화",
    title: "혼합 정밀도(Mixed Precision) 학습",
    desc: "FP16/BF16 사용으로 메모리 사용량을 절반으로 줄이고 학습 속도를 25% 향상시킵니다.",
    impact: "중간",
    saving: "~0.03 kg CO₂",
    detail:
      "torch.cuda.amp.autocast() 또는 trainer.use_amp=True 설정으로 활성화하세요.",
  },
];

export default function AdvisorScreen() {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set([2]));

  const toggleTip = (id: number) => {
    setSelectedTip(selectedTip === id ? null : id);
  };

  const toggleApply = (id: number) => {
    const next = new Set(applied);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setApplied(next);
  };

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.headerSub}>3개 개선 항목 발견</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.banner}>
          <View style={styles.bannerDoc}>
            <Text style={styles.bannerLabel}>모든 권장사항 적용 시</Text>
            <Text style={styles.bannerValue}>0.34 kg CO₂</Text>
            <Text style={styles.bannerSub}>현재 대비 약 24% 절감 가능</Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="bulb" size={32} color="white" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>개선 권장사항</Text>
        {tips.map((tip) => (
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
                      예상 절감: {tip.saving}
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
                      applied.has((id) => id === tip.id)
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
    fontSize: 24,
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
