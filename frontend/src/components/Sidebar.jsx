import {
  LayoutDashboard,
  Users,
  FileUp,
  BarChart3,
  Settings,
  HelpCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

function Sidebar({ activePage = "dashboard", onNavigate }) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "candidates",
      label: "Candidates",
      icon: Users,
    },
    {
      id: "upload",
      label: "Upload Resume",
      icon: FileUp,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  const systemItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
    },
  ];

  const handleNavigation = (id) => {
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[260px] flex-col border-r border-slate-800 bg-[#0b1220] text-white lg:flex">

      {/* =========================================
          LOGO
      ========================================== */}

      <div className="flex h-[82px] items-center border-b border-slate-800 px-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">

            <FileText
              size={21}
              strokeWidth={2.5}
            />

          </div>

          <div>

            <h1 className="text-[17px] font-bold tracking-tight">
              ResumeIQ
            </h1>

            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
              Talent Intelligence
            </p>

          </div>

        </div>

      </div>


      {/* =========================================
          NAVIGATION
      ========================================== */}

      <div className="flex-1 overflow-y-auto px-4 py-7">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Workspace
        </p>


        <nav className="space-y-1.5">

          {menuItems.map((item) => {

            const Icon = item.icon;

            const active = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                }`}
              >

                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 2}
                  className={
                    active
                      ? "text-white"
                      : "text-slate-500 transition-colors group-hover:text-slate-300"
                  }
                />

                <span className="flex-1">
                  {item.label}
                </span>

                {active && (
                  <ChevronRight
                    size={14}
                    className="text-indigo-200"
                  />
                )}

              </button>
            );
          })}

        </nav>


        {/* =========================================
            DIVIDER
        ========================================== */}

        <div className="my-7 h-px bg-slate-800" />


        {/* =========================================
            SYSTEM
        ========================================== */}

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          System
        </p>


        <nav className="space-y-1.5">

          {systemItems.map((item) => {

            const Icon = item.icon;

            const active = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                }`}
              >

                <Icon
                  size={18}
                  className={
                    active
                      ? "text-indigo-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }
                />

                <span>
                  {item.label}
                </span>

              </button>
            );
          })}

        </nav>

      </div>


      {/* =========================================
          BOTTOM PLAN CARD
      ========================================== */}

      <div className="border-t border-slate-800 p-4">

        <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-800/60 p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-semibold text-white">
                ResumeIQ R&D
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Prototype v1.0
              </p>

            </div>


            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">

              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />

            </div>

          </div>


          <div className="mt-4 flex items-center gap-2">

            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">

              <div className="h-full w-full rounded-full bg-indigo-500" />

            </div>

            <span className="text-[10px] font-medium text-slate-500">
              Active
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;