import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// API 데이터 타입 정의
interface EmissionRecord {
  id: number;
  project_name: string;
  emissions: number;
  energy_consumed: number;
  duration: number;
  timestamp: string;
}

// 탄소 배출량에 따른 등급 계산 함수
const getCarbonGrade = (emissions: number) => {
  if (emissions < 0.01) return { label: "A+", color: "#2E7D32", bg: "#E8F5E9" };
  if (emissions < 0.05) return { label: "A", color: "#43A047", bg: "#F1F8E9" };
  if (emissions < 0.1) return { label: "B", color: "#FBC02D", bg: "#FFFDE7" };
  if (emissions < 0.5) return { label: "C", color: "#FB8C00", bg: "#FFF3E0" };
  return { label: "D", color: "#E53935", bg: "#FFEBEE" };
};

export default function DashboardScreen() {
  const [session, setSession] = useState<EmissionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // API 주소 설정 (Ngrok 주소 사용)
  const API_URL = "https://continently-shunnable-tripp.ngrok-free.dev";

  // 데이터 가져오기 함수
  const fetchLatestData = async () => {
    try {
      const response = await fetch(
        `${API_URL}/sessions?limit=1`,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        setSession(data[0]); // 최신 데이터
      }
      setError(false);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchLatestData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 12, color: "#666" }}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  // 연결은 되었으나 데이터가 한 개도 없는 경우
  if (!error && !session) {
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.center}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Ionicons name="document-text-outline" size={60} color="#CCC" />
        <Text style={{ marginTop: 20, fontSize: 16, color: "#333", fontWeight: "600" }}>기록된 세션이 없습니다</Text>
        <Text style={{ marginTop: 8, color: "#999", textAlign: "center", paddingHorizontal: 40 }}>
          기록된 데이터가 없습니다. 새로운 학습 세션을 시작하여 탄소 배출량을 측정해보세요.
        </Text>
      </ScrollView>
    );
  }

  // 진짜 연결 에러인 경우
  if (error) {
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.center}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Ionicons name="cloud-offline-outline" size={60} color="#CCC" />
        <Text style={{ marginTop: 20, fontSize: 16, color: "#333", fontWeight: "600" }}>서버 연결 실패</Text>
        <Text style={{ marginTop: 8, color: "#999", textAlign: "center", paddingHorizontal: 40 }}>
          서버와의 연결이 원활하지 않습니다. 네트워크 상태나 API 주소를 다시 확인해주세요.{"\n\n"}화면을 아래로 당겨서 다시 시도할 수 있습니다.
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
      {/* Dashboard Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <Ionicons name="leaf" size={18} color="#A5D6A7" />
            <Text style={styles.logoText}>Green-ML</Text>
          </View>
          <Text style={styles.statusText}>실시간 연결 ●</Text>
        </View>
        <Text style={styles.headerTitle}>탄소 영수증</Text>
        <Text style={styles.headerSub}>최근 AI 학습 세션 보고서</Text>
      </View>

      <View style={styles.content}>
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.receiptLabel}>프로젝트</Text>
              <Text style={styles.receiptProjectName}>
                {session?.project_name || "N/A"}
              </Text>
            </View>
            {session && (
              <View 
                style={[
                  styles.gradeBadge, 
                  { backgroundColor: getCarbonGrade(session.emissions).bg }
                ]}
              >
                <Text 
                  style={[
                    styles.gradeText, 
                    { color: getCarbonGrade(session.emissions).color }
                  ]}
                >
                  {getCarbonGrade(session.emissions).label}
                </Text>
              </View>
            )}
          </View>

          {/* Dotted Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dottedLine} />
            <View style={styles.dot} />
            <View style={styles.dottedLine} />
          </View>

          {/* Main Emission */}
          <View style={styles.emissionSection}>
            <Text style={styles.receiptLabel}>총 탄소 배출량</Text>
            <View style={styles.emissionValueRow}>
              <Text style={styles.emissionValue}>
                {session?.emissions ? session.emissions.toFixed(6) : "0.000000"}
              </Text>
              <Text style={styles.unitText}>kg CO₂-eq</Text>
            </View>
          </View>

          {/* Dotted Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dottedLine} />
            <View style={styles.dot} />
            <View style={styles.dottedLine} />
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <DetailRow
              icon="flash"
              label="에너지 소비량"
              value={`${session?.energy_consumed ? session.energy_consumed.toFixed(4) : "0"} kWh`}
              iconColor="#FBC02D"
              bgColor="#FFFDE7"
            />
            <DetailRow
              icon="time"
              label="학습 시간"
              value={`${session?.duration ? Math.floor(session.duration) : "0"}초`}
              iconColor="#1976D2"
              bgColor="#E3F2FD"
            />
          </View>

          {/* Footer */}
          <View style={styles.receiptFooter}>
            <Text style={styles.footerLabel}>기록 시각</Text>
            <Text style={styles.footerValue}>
              {session?.timestamp ? new Date(session.timestamp).toLocaleString("ko-KR") : "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, iconColor, bgColor }: any) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <Ionicons name={icon as any} size={14} color={iconColor} />
        </View>
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { color: "#C8E6C9", fontSize: 14, fontWeight: "600" },
  statusText: { color: "#A5D6A7", fontSize: 12 },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 15,
  },
  headerSub: { color: "#A5D6A7", fontSize: 12, marginTop: 4 },

  content: { paddingHorizontal: 16, marginTop: -20, paddingBottom: 30 },
  receiptCard: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
    marginBottom: 24,
  },
  receiptHeader: {
    backgroundColor: "#333",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: { color: "#999", fontSize: 12 },
  receiptProjectName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  gradeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  gradeText: { fontSize: 20, fontWeight: "800" },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 20,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 10,
  },

  emissionSection: { padding: 20, alignItems: "center" },
  emissionValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 8,
  },
  emissionValue: { fontSize: 32, fontWeight: "800", color: "#212121" },
  unitText: { fontSize: 14, color: "#757575" },

  detailsSection: { padding: 20, gap: 16 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: { fontSize: 14, color: "#616161" },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#212121" },

  receiptFooter: {
    backgroundColor: "#FAFAFA",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  footerLabel: { fontSize: 11, color: "#BDBDBD" },
  footerValue: { fontSize: 11, color: "#757575" },
});
