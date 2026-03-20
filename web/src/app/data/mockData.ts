export interface Session {
  id: number;
  project_name: string;
  emissions: number; // kg CO2-eq
  energy_consumed: number; // kWh
  duration: number; // seconds
  timestamp: string;
  model_type: string;
  gpu: string;
}

export const sessions: Session[] = [
  {
    id: 1,
    project_name: "ResNet-50 ImageNet",
    emissions: 0.0312,
    energy_consumed: 0.142,
    duration: 3720,
    timestamp: "2026-03-20T09:15:00",
    model_type: "CNN",
    gpu: "NVIDIA A100",
  },
  {
    id: 2,
    project_name: "GPT-2 Fine-tune",
    emissions: 0.1847,
    energy_consumed: 0.839,
    duration: 18240,
    timestamp: "2026-03-19T14:30:00",
    model_type: "Transformer",
    gpu: "NVIDIA V100",
  },
  {
    id: 3,
    project_name: "BERT Sentiment",
    emissions: 0.0521,
    energy_consumed: 0.237,
    duration: 6480,
    timestamp: "2026-03-18T11:00:00",
    model_type: "Transformer",
    gpu: "NVIDIA A100",
  },
  {
    id: 4,
    project_name: "YOLOv8 Detection",
    emissions: 0.0894,
    energy_consumed: 0.406,
    duration: 10800,
    timestamp: "2026-03-17T16:45:00",
    model_type: "CNN",
    gpu: "NVIDIA RTX 3090",
  },
  {
    id: 5,
    project_name: "Stable Diffusion",
    emissions: 0.2631,
    energy_consumed: 1.196,
    duration: 28800,
    timestamp: "2026-03-16T08:00:00",
    model_type: "Diffusion",
    gpu: "NVIDIA A100",
  },
  {
    id: 6,
    project_name: "XGBoost Tabular",
    emissions: 0.0087,
    energy_consumed: 0.040,
    duration: 1200,
    timestamp: "2026-03-15T13:20:00",
    model_type: "Boosting",
    gpu: "CPU Only",
  },
  {
    id: 7,
    project_name: "ViT-Base Pretraining",
    emissions: 0.1423,
    energy_consumed: 0.647,
    duration: 14400,
    timestamp: "2026-03-14T10:00:00",
    model_type: "Transformer",
    gpu: "NVIDIA V100",
  },
];

export const getLatestSession = (): Session => sessions[0];

export const getTotalEmissions = (): number =>
  sessions.reduce((sum, s) => sum + s.emissions, 0);

export const getTotalEnergy = (): number =>
  sessions.reduce((sum, s) => sum + s.energy_consumed, 0);

export const getGrade = (emissions: number): { grade: string; color: string; bg: string } => {
  if (emissions < 0.01) return { grade: "A+", color: "#16a34a", bg: "#dcfce7" };
  if (emissions < 0.05) return { grade: "A", color: "#22c55e", bg: "#f0fdf4" };
  if (emissions < 0.1) return { grade: "B", color: "#84cc16", bg: "#f7fee7" };
  if (emissions < 0.2) return { grade: "C", color: "#eab308", bg: "#fefce8" };
  return { grade: "D", color: "#ef4444", bg: "#fef2f2" };
};

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
};

export const formatDate = (timestamp: string): string => {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

// Equivalent CO2 comparisons
export const getComparisons = (emissions: number) => [
  { label: "승용차 주행", value: (emissions * 4.7).toFixed(2), unit: "km" },
  { label: "스마트폰 충전", value: Math.round(emissions * 121), unit: "회" },
  { label: "나무 흡수 필요", value: (emissions * 0.0385).toFixed(3), unit: "그루/년" },
];
