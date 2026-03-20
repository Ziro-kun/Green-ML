import { Outlet, NavLink } from "react-router";
import { LayoutDashboard, History, Lightbulb } from "lucide-react";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Mobile frame */}
      <div
        className="relative bg-white overflow-hidden shadow-2xl flex flex-col"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          border: "8px solid #1a1a1a",
        }}
      >
        {/* Status bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 pt-3 pb-1 bg-white">
          <span className="text-xs font-semibold text-gray-800">9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 items-end h-3">
              <div className="w-0.5 bg-gray-800 rounded-sm" style={{height: '4px'}}/>
              <div className="w-0.5 bg-gray-800 rounded-sm" style={{height: '7px'}}/>
              <div className="w-0.5 bg-gray-800 rounded-sm" style={{height: '10px'}}/>
              <div className="w-0.5 bg-gray-800 rounded-sm" style={{height: '12px'}}/>
            </div>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 2.4C10.2 2.4 12.2 3.3 13.6 4.8L15 3.3C13.2 1.3 10.7 0 8 0C5.3 0 2.8 1.3 1 3.3L2.4 4.8C3.8 3.3 5.8 2.4 8 2.4Z" fill="#1a1a1a"/>
              <path d="M8 5.6C9.5 5.6 10.8 6.2 11.8 7.2L13.2 5.7C11.8 4.4 9.9 3.6 8 3.6C6.1 3.6 4.2 4.4 2.8 5.7L4.2 7.2C5.2 6.2 6.5 5.6 8 5.6Z" fill="#1a1a1a"/>
              <circle cx="8" cy="10" r="2" fill="#1a1a1a"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#1a1a1a" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="17" height="8" rx="2" fill="#1a1a1a"/>
              <path d="M23 4.5V7.5C23.8 7.2 23.8 4.8 23 4.5Z" fill="#1a1a1a" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div
          className="flex-shrink-0 border-t border-gray-100 bg-white"
          style={{ paddingBottom: "16px" }}
        >
          <div className="flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                  isActive ? "text-green-600" : "text-gray-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-xs">{isActive ? "대시보드" : "대시보드"}</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                  isActive ? "text-green-600" : "text-gray-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <History size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-xs">이력</span>
                </>
              )}
            </NavLink>
            <NavLink
              to="/advisor"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                  isActive ? "text-green-600" : "text-gray-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Lightbulb size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-xs">어드바이저</span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
