import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarDays, CheckSquare, Settings, Calendar as CalendarIcon, BarChart3, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import TaskModal from './TaskModal';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'My Day', path: '/my-day', icon: CalendarDays },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <h1 className="text-xl font-bold text-brand-600 tracking-tight">LifeFlow</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-brand-50 text-brand-600" : "text-textSecondary hover:bg-gray-100 hover:text-textPrimary"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <NavLink
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              location.pathname === '/settings' ? "bg-brand-50 text-brand-600" : "text-textSecondary hover:bg-gray-100 hover:text-textPrimary"
            )}
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative">
          <div className="max-w-4xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
        
        {/* Mobile Floating Action Button */}
        <button 
          onClick={() => setTaskModalOpen(true)}
          className="md:hidden absolute bottom-20 right-4 w-14 h-14 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-700 active:scale-95 transition-transform z-10"
        >
          <span className="text-3xl font-light leading-none">+</span>
        </button>
      </main>

      {/* Mobile More Menu Overlay */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setShowMoreMenu(false)}>
          <div 
            className="absolute bottom-16 right-0 bg-card w-48 border border-border shadow-xl rounded-tl-xl rounded-tr-xl overflow-hidden animate-in slide-in-from-bottom-5"
            onClick={e => e.stopPropagation()}
          >
            <NavLink
              to="/analytics"
              onClick={() => setShowMoreMenu(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-b border-border transition-colors",
                location.pathname === '/analytics' ? "bg-brand-50 text-brand-600 font-medium" : "text-textSecondary hover:bg-gray-50"
              )}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => setShowMoreMenu(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                location.pathname === '/settings' ? "bg-brand-50 text-brand-600 font-medium" : "text-textSecondary hover:bg-gray-50"
              )}
            >
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center h-16 z-30 pb-safe">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                isActive ? "text-brand-600" : "text-textSecondary hover:text-textPrimary"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            showMoreMenu ? "text-brand-600" : "text-textSecondary"
          )}
        >
          {showMoreMenu ? <X className="w-5 h-5 stroke-[2.5px]" /> : <Menu className="w-5 h-5 stroke-2" />}
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  );
}
