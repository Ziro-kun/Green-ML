import { Leaf, Zap, Clock, Cpu, ChevronRight, TrendingDown } from "lucide-react";
import {
  getLatestSession,
  getGrade,
  formatDuration,
  formatDate,
  getComparisons,
  sessions,
} from "../data/mockData";

export function Dashboard() {
  const session = getLatestSession();
  const grade = getGrade(session.emissions);
  const comparisons = getComparisons(session.emissions);

  // Weekly trend (last 7 sessions simplified)
  const weeklyEmissions = sessions.slice(0, 5).reverse();
  const maxEmission = Math.max(...weeklyEmissions.map((s) => s.emissions));

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 px-5 pt-3 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Leaf size={18} className="text-green-200" />
            <span className="text-green-100 text-sm">Green-ML</span>
          </div>
          <span className="text-green-200 text-xs">실시간 연결 중 ●</span>
        </div>
        <h1 className="text-white text-xl mt-2">탄소 영수증</h1>
        <p className="text-green-200 text-xs mt-0.5">마지막 학습 세션 기준</p>
      </div>

      <div className="px-4 -mt-3">
        {/* Carbon Receipt Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
          {/* Receipt header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">프로젝트</p>
              <p className="text-white text-sm mt-0.5">{session.project_name}</p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: grade.bg, color: grade.color }}
            >
              {grade.grade}
            </div>
          </div>

          {/* Receipt dashed divider */}
          <div className="flex items-center px-4 py-1">
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <div className="w-3 h-3 rounded-full bg-gray-50 border-2 border-gray-200 mx-2" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
          </div>

          {/* Main emission value */}
          <div className="px-4 pb-4 pt-2 text-center">
            <p className="text-gray-400 text-xs mb-1">총 탄소 배출량</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-gray-900">
                {session.emissions.toFixed(4)}
              </span>
              <span className="text-gray-500 text-sm">kg CO₂-eq</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingDown size={12} className="text-green-500" />
              <span className="text-green-600 text-xs">평균 대비 15% 절감</span>
            </div>
          </div>

          {/* Receipt dashed divider */}
          <div className="flex items-center px-4 py-1">
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <div className="w-3 h-3 rounded-full bg-gray-50 border-2 border-gray-200 mx-2" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
          </div>

          {/* Detail rows */}
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Zap size={14} className="text-yellow-500" />
                </div>
                <span className="text-gray-600 text-sm">에너지 소비량</span>
              </div>
              <span className="text-gray-900 text-sm font-medium">
                {session.energy_consumed.toFixed(3)} kWh
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock size={14} className="text-blue-500" />
                </div>
                <span className="text-gray-600 text-sm">학습 시간</span>
              </div>
              <span className="text-gray-900 text-sm font-medium">
                {formatDuration(session.duration)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Cpu size={14} className="text-purple-500" />
                </div>
                <span className="text-gray-600 text-sm">GPU</span>
              </div>
              <span className="text-gray-900 text-sm font-medium">{session.gpu}</span>
            </div>
          </div>

          {/* Receipt footer */}
          <div className="bg-gray-50 px-4 py-2 flex justify-between">
            <span className="text-gray-400 text-xs">기록 시각</span>
            <span className="text-gray-600 text-xs">{formatDate(session.timestamp)}</span>
          </div>
        </div>

        {/* Equivalents */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-gray-700 text-sm font-medium mb-3">이만큼의 탄소는...</p>
          <div className="grid grid-cols-3 gap-2">
            {comparisons.map((c, i) => (
              <div key={i} className="bg-green-50 rounded-xl p-2.5 text-center">
                <p className="text-green-700 text-xs font-medium">
                  {c.value}
                  <span className="text-green-500"> {c.unit}</span>
                </p>
                <p className="text-gray-500 text-xs mt-0.5 leading-tight">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mini bar chart */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-700 text-sm font-medium">최근 5회 배출량</p>
            <button className="flex items-center gap-0.5 text-green-600 text-xs">
              전체 보기 <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex items-end gap-2 h-16">
            {weeklyEmissions.map((s, i) => {
              const heightPct = (s.emissions / maxEmission) * 100;
              const isLast = i === weeklyEmissions.length - 1;
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isLast ? "#16a34a" : "#bbf7d0",
                      minHeight: "4px",
                    }}
                  />
                  <span className="text-gray-400 text-xs">
                    {new Date(s.timestamp).getDate()}일
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
