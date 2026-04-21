import { CircleHelp, Search } from 'lucide-react';

export default function Sidebar({
  brand = 'HealthCheck',
  menuItems = [],
  activeLabel = 'Overview',
  searchPlaceholder = 'Search here...',
  helpLabel = 'Help Center',
}) {
  return (
    <aside className="hidden w-[248px] shrink-0 bg-[#0f1b35] p-4 text-[#c9d3e8] shadow-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="mb-7 flex items-center gap-2 px-2 pt-1 text-white">
        <div className="h-7 w-7 rounded-full bg-[#2b79ff]" />
        <span className="text-[21px] font-semibold italic tracking-tight">{brand}</span>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#8ea1c7]">
        <Search size={14} />
        <span>{searchPlaceholder}</span>
        <span className="ml-auto text-[11px]">⌘K</span>
      </div>

      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive = item.active ?? item.label === activeLabel;

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive ? 'bg-[#1a2d52] text-white' : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={16} className="opacity-90" />
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

      <div className="mt-auto rounded-2xl bg-white/8 p-3">
        <div className="mb-2 flex h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9ea7be] via-[#59637e] to-[#2b344f]">
          <div className="h-8 w-8 rounded-full border border-white/30" />
        </div>
        <button type="button" className="flex w-full items-center gap-2 rounded-xl bg-[#1a2d52] px-3 py-2 text-sm text-white">
          <CircleHelp size={15} />
          {helpLabel}
        </button>
      </div>
    </aside>
  );
}
