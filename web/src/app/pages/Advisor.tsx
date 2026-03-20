import { useState } from "react";
import {
  Lightbulb,
  Leaf,
  ChevronRight,
  Zap,
  Server,
  Clock,
  BarChart3,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { sessions, getTotalEmissions } from "../data/mockData";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

const tips = [
  {
    id: 1,
    icon: Clock,
    color: "#3b82f6",
    bg: "#eff6ff",
    category: "학습 최적화",
    title: "조기 종료(Early Stopping) 적용",
    desc: "과적합 감지 시 학습을 자동 중단하여 불필요한 연산을 최대 40% 줄일 수 있습니다.",
    impact: "높음",
    saving: "~0.07 kg CO₂",
    applied: false,
    detail:
      "patience=10 설정으로 검증 손실이 개선되지 않으면 자동 종료합니다. GPT-2 Fine-tune 세션에서 특히 효과적입니다.",
  },
  {
    id: 2,
    icon: Server,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    category: "인프라",
    title: "재생에너지 데이터센터 활용",
    desc: "AWS us-west-2 (오리건) 리전은 탄소 집약도가 낮아 동일 작업 대비 배출량을 60% 감소시킵니다.",
    impact: "매우 높음",
    saving: "~0.15 kg CO₂",
    applied: true,
    detail:
      "현재 사용 중인 리전의 Carbon Intensity: 210 gCO₂/kWh → us-west-2: 45 gCO₂/kWh",
  },
  {
    id: 3,
    icon: Zap,
    color: "#f59e0b",
    bg: "#fffbeb",
    category: "배치 최적화",
    title: "혼합 정밀도(Mixed Precision) 학습",
    desc: "FP16/BF16 사용으로 메모리 사용량을 절반으로 줄이고 학습 속도를 25% 향상시킵니다.",
    impact: "중간",
    saving: "~0.03 kg CO₂",
    applied: false,
    detail:
      "torch.cuda.amp.autocast() 또는 trainer.use_amp=True 설정으로 활성화하세요.",
  },
  {
    id: 4,
    icon: BarChart3,
    color: "#10b981",
    bg: "#ecfdf5",
    category: "모델 경량화",
    title: "지식 증류(Knowledge Distillation)",
    desc: "대형 Teacher 모델의 지식을 소형 Student 모델로 전이하여 성능 손실 없이 연산량을 줄입니다.",
    impact: "높음",
    saving: "~0.09 kg CO₂",
    applied: false,
    detail:
      "DistilBERT는 BERT 대비 60% 빠르고, 탄소 배출량은 40% 적으면서 성능은 97% 유지합니다.",
  },
];

const radarData = [
  { metric: "학습 효율", value: 72, id: "radar-0" },
  { metric: "에너지 절감", value: 58, id: "radar-1" },
  { metric: "인프라", value: 85, id: "radar-2" },
  { metric: "모델 경량화", value: 45, id: "radar-3" },
  { metric: "스케줄링", value: 63, id: "radar-4" },
];

const impactColor: Record<string, string> = {
  "매우 높음": "#ef4444",
  "높음": "#f59e0b",
  "중간": "#3b82f6",
};

export function Advisor() {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set([2]));
  const totalEmissions = getTotalEmissions();
  const potentialSaving = 0.34; // kg CO2

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-1">
          <Leaf size={16} className="text-green-500" />
          <span className="text-green-600 text-sm">Green-ML</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-gray-900 text-xl">AI 어드바이저</h1>
          <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full">
            <Sparkles size={11} className="text-purple-500" />
            <span className="text-purple-600 text-xs">AI 분석</span>
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-0.5">
          {sessions.length}개 세션 분석 완료 · {tips.filter((t) => !applied.has(t.id)).length}개 개선 항목
        </p>
      </div>

      <div className="px-4 pt-4">
        {/* Potential saving banner */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-200 text-xs">모든 권장사항 적용 시</p>
              <p className="text-white text-2xl font-bold mt-0.5">
                {potentialSaving} kg CO₂
              </p>
              <p className="text-green-300 text-xs mt-0.5">절감 가능 (현재 대비 {((potentialSaving / totalEmissions) * 100).toFixed(0)}%↓)</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2">
              <Lightbulb size={28} className="text-white" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-200">적용 완료</span>
              <span className="text-white">{applied.size}/{tips.length}</span>
            </div>
            <div className="h-1.5 bg-green-700 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${(applied.size / tips.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-gray-700 text-sm font-medium mb-2">최적화 현황</p>
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Radar
                key="radar-current"
                name="현재"
                dataKey="value"
                stroke="#16a34a"
                fill="#16a34a"
                fillOpacity={0.25}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Tips list */}
        <p className="text-gray-700 text-sm font-medium mb-3">개선 권장사항</p>
        <div className="space-y-3 mb-6">
          {tips.map((tip) => {
            const Icon = tip.icon;
            const isApplied = applied.has(tip.id);
            const isSelected = selectedTip === tip.id;

            return (
              <div key={tip.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-start gap-3 text-left"
                  onClick={() => setSelectedTip(isSelected ? null : tip.id)}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: tip.bg }}
                  >
                    <Icon size={18} style={{ color: tip.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: tip.bg, color: tip.color }}
                      >
                        {tip.category}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: impactColor[tip.impact] ?? "#6b7280" }}
                      >
                        ● {tip.impact}
                      </span>
                    </div>
                    <p className="text-gray-900 text-sm mt-1">{tip.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed line-clamp-2">
                      {tip.desc}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-gray-300 flex-shrink-0 mt-1 transition-transform ${
                      isSelected ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isSelected && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <div className="bg-gray-50 rounded-xl p-3 mt-3">
                      <p className="text-gray-600 text-xs leading-relaxed">{tip.detail}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Leaf size={12} className="text-green-500" />
                          <span className="text-green-600 text-xs font-medium">
                            예상 절감: {tip.saving}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`w-full mt-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        isApplied
                          ? "bg-green-50 text-green-600"
                          : "bg-green-600 text-white active:bg-green-700"
                      }`}
                      onClick={() => {
                        setApplied((prev) => {
                          const next = new Set(prev);
                          if (next.has(tip.id)) next.delete(tip.id);
                          else next.add(tip.id);
                          return next;
                        });
                      }}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 size={16} />
                          적용 완료
                        </>
                      ) : (
                        <>
                          <Circle size={16} />
                          적용 표시하기
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}