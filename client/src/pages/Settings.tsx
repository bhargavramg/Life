import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { logout } = useContext(AuthContext);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-textPrimary">Settings</h1>
        <p className="text-textSecondary mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xl font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-lg text-textPrimary">{user?.name}</div>
              <div className="text-textSecondary">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-textPrimary">Theme</div>
                <div className="text-sm text-textSecondary">Choose your preferred visual style</div>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-1.5 bg-white shadow-sm rounded-md text-sm font-medium flex items-center gap-2 text-brand-600">
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button className="px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 text-textSecondary cursor-not-allowed opacity-50">
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-textPrimary">Start week on</div>
                <div className="text-sm text-textSecondary">First day of the week for calendars</div>
              </div>
              <select className="border border-border rounded-lg px-3 py-1.5 text-sm bg-transparent outline-none">
                <option>Monday</option>
                <option>Sunday</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4">Account</h2>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-red-600 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors -ml-4"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
