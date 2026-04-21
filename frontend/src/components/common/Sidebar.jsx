import { CircleHelp, Search } from 'lucide-react';

export default function Sidebar({
  brand = 'HealthCheck',
  menuItems = [],
  activeLabel = 'Overview',
  searchPlaceholder = 'Search here...',
  helpLabel = 'Help Center',
}) {
  return (
    <aside className="hidden h-screen w-[240px] shrink-0 flex-col overflow-hidden bg-[#0f1b35] px-3 py-3 text-[#c9d3e8] shadow-xl lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:flex">
      <div className="mb-4 flex items-center gap-2 px-2 pt-1 text-white">
        <div className="h-6 w-6 rounded-full bg-[#2b79ff]" />
        <span className="text-[19px] font-semibold italic tracking-tight">{brand}</span>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#8ea1c7]">
        <Search size={13} />
        <span>{searchPlaceholder}</span>
        <span className="ml-auto text-[11px]">⌘K</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-hidden">
        {menuItems.map((item) => {
          const isActive = item.active ?? item.label === activeLabel;

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                isActive ? 'bg-[#1a2d52] text-white' : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={15} className="opacity-90" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] leading-4 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-3 shrink-0 rounded-2xl bg-white/8 p-2.5">
        <div className="mb-2 flex h-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9ea7be] via-[#59637e] to-[#2b344f]">
          <div className="h-7 w-7 rounded-full border border-white/30" />
        </div>
        <button type="button" className="flex w-full items-center gap-2 rounded-xl bg-[#1a2d52] px-3 py-2 text-sm text-white">
          <CircleHelp size={14} />
          {helpLabel}
        </button>
      </div>
    </aside>
  );
}
