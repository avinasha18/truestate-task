import { LayoutDashboard, Zap, Inbox, Layers, FileText, ChevronDown } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col min-h-screen flex-shrink-0">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <div className="font-semibold text-white text-sm">Assignment</div>
            <div className="text-xs text-gray-500">Tejassri Avinasha</div>
          </div>
          <ChevronDown size={16} className="ml-auto text-gray-500" />
        </div>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map(item => (
          <div key={item.id}>
            <div className={`flex items-center gap-3 px-4 py-2.5 text-sm ${item.id === 'dashboard' ? 'text-white' : 'text-gray-400'}`}>
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.sub && <ChevronDown size={14} className={item.open ? 'rotate-180' : ''} />}
            </div>

            {item.sub && item.open && (
              <div className="ml-6 border-l border-gray-800 pl-4">
                {item.sub.map(subItem => (
                  <div key={subItem} className="py-2 text-sm text-gray-500">
                    ○ {subItem}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
