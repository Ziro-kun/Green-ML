import { useState } from "react";
import { Leaf, Filter, ChevronDown, ChevronUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  sessions,
  getGrade,
  formatDuration,
  formatDate,
  getTotalEmissions,
  getTotalEnergy,
} from "../data/mockData";

const chartData = sessions
  .slice()
  .reverse()
  .map((s, i) => ({
    name: `${new Date(s.timestamp).getMonth() + 1}/${new Date(s.timestamp).getDate()}`,
    id: `session-${s.id}-${i}`,
    emissions: parseFloat(s.emissions.toFixed(4)),
    energy: parseFloat(s.energy_consumed.toFixed(3)),
    label: s.project_name,
  }));

export function History() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "CNN" | "Transformer" | "Diffusion">("all");

  const filtered =
    filter === "all" ? sessions : sessions.filter((s) => s.model_type === filter);

  const totalEmissions = getTotalEmissions();
  const totalEnergy = getTotalEnergy();

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-1">
          <Leaf size={16} className="text-green-500" />
          <span className="text-green-600 text-sm">Green-ML</span>
        </div>
        <h1 className="text-gray-900 text-xl">학습 이력</h1>
        <p className="text-gray-400 text-xs mt-0.5">총 {sessions.length}개 세션 기록</p>
      </div>

      <div className="px-4 pt-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-600 rounded-2xl p-4">
            <p className="text-green-200 text-xs">누적 탄소 배출</p>
            <p className="text-white text-xl font-bold mt-0.5">
              {totalEmissions.toFixed(3)}
            </p>
            <p className="text-green-300 text-xs">kg CO₂-eq</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-400 text-xs">누적 에너지 소비</p>
            <p className="text-gray-900 text-xl font-bold mt-0.5">
              {totalEnergy.toFixed(3)}
            </p>
            <p className="text-gray-400 text-xs">kWh</p>
          </div>
        </div>

        {/* Area chart */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-gray-700 text-sm font-medium mb-3">배출량 추이 (kg CO₂-eq)</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="emissionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "11px",
                  padding: "6px 10px",
                }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={(value: number) => [`${value} kg`, "배출량"]}
              />
              <Area
                key="area-emissions"
                type="monotone"
                dataKey="emissions"
                name="emissions"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#emissionsGrad)"
                dot={{ fill: "#16a34a", r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {(["all", "CNN", "Transformer", "Diffusion"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 ${
                filter === f
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 shadow-sm border border-gray-100"
              }`}
            >
              {f === "all" ? (
                <>
                  <Filter size={10} /> 전체
                </>
              ) : (
                f
              )}
            </button>
          ))}
        </div>

        {/* Session list */}
        <div className="space-y-2 mb-6">
          {filtered.map((s) => {
            const grade = getGrade(s.emissions);
            const isExpanded = expanded === s.id;
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  className="w-full px-4 py-3 flex items-center gap-3 text-left"
                  onClick={() => setExpanded(isExpanded ? null : s.id)}
                >
                  {/* Grade badge */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: grade.bg, color: grade.color }}
                  >
                    {grade.grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm truncate">{s.project_name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{formatDate(s.timestamp)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-900 text-sm font-medium">
                      {s.emissions.toFixed(4)}
                    </p>
                    <p className="text-gray-400 text-xs">kg CO₂</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 border-t border-gray-50">
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-gray-400 text-xs">에너지</p>
                        <p className="text-gray-800 text-sm font-medium mt-0.5">
                          {s.energy_consumed.toFixed(3)} kWh
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-gray-400 text-xs">학습 시간</p>
                        <p className="text-gray-800 text-sm font-medium mt-0.5">
                          {formatDuration(s.duration)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-gray-400 text-xs">모델 타입</p>
                        <p className="text-gray-800 text-sm font-medium mt-0.5">
                          {s.model_type}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-gray-400 text-xs">GPU</p>
                        <p className="text-gray-800 text-sm font-medium mt-0.5">
                          {s.gpu}
                        </p>
                      </div>
                    </div>
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