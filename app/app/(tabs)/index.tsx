import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
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

export default function DashboardScreen() {
  const [session, setSession] = useState<EmissionRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 데이터 가져오기 함수
  const fetchLatestData = async () => {
    try {
      const response = await fetch(
        "https://continently-shunnable-tripp.ngrok-free.dev/sessions?limit=1",
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setSession(data[data.length - 1]);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
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

  if (!session) {
    return (
      <View style={styles.center}>
        <Text>데이터를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <Ionicons name="leaf" size={18} color="#A5D6A7" />
            <Text style={styles.logoText}>Green-ML</Text>
          </View>
          <Text style={styles.statusText}>실시간 연결 중 ●</Text>
        </View>
        <Text style={styles.headerTitle}>탄소 영수증</Text>
        <Text style={styles.headerSub}>마지막 학습 세션 기준</Text>
      </View>

      <View style={styles.content}>
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.receiptLabel}>프로젝트</Text>
              <Text style={styles.receiptProjectName}>
                {session.project_name}
              </Text>
            </View>
            <View style={[styles.gradeBadge, { backgroundColor: "#E8F5E9" }]}>
              <Text style={[styles.gradeText, { color: "#2E7D32" }]}>A</Text>
            </View>
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
                {session.emissions.toFixed(6)}
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
              value={`${session.energy_consumed.toFixed(4)} kWh`}
              iconColor="#FBC02D"
              bgColor="#FFFDE7"
            />
            <DetailRow
              icon="time"
              label="학습 시간"
              value={`${Math.floor(session.duration)}초`}
              iconColor="#1976D2"
              bgColor="#E3F2FD"
            />
          </View>

          {/* Footer */}
          <View style={styles.receiptFooter}>
            <Text style={styles.footerLabel}>기록 시각</Text>
            <Text style={styles.footerValue}>
              {new Date(session.timestamp).toLocaleString("ko-KR")}
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
