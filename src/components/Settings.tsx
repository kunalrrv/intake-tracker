import React from 'react';
import { User } from 'firebase/auth';
import { 
  User as UserIcon, 
  Database, 
  Download, 
  Trash2, 
  Save,
  Globe,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import { Bottle } from '../types';

interface SettingsProps {
  user: User;
  bottles: Bottle[];
  onClearData: () => Promise<void>;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  onUpdateProfile: (displayName: string, photoURL: string) => Promise<void>;
}

export default function Settings({ 
  user, 
  bottles, 
  onClearData, 
  currency, 
  onCurrencyChange, 
  onUpdateProfile
}: SettingsProps) {
  const [displayName, setDisplayName] = React.useState(user.displayName || '');
  const [photoURL, setPhotoURL] = React.useState(user.photoURL || '');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onUpdateProfile(displayName, photoURL);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(bottles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `alcohol-tracker-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const currencies = [
    { symbol: '$', label: 'USD - Dollar' },
    { symbol: '€', label: 'EUR - Euro' },
    { symbol: '£', label: 'GBP - Pound' },
    { symbol: '₹', label: 'INR - Rupee' },
    { symbol: '¥', label: 'JPY - Yen' },
    { symbol: 'A$', label: 'AUD - Australian Dollar' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Profile Section */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-red-800">
          <UserIcon size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Profile Customization</h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative group">
              <img 
                src={photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=random`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tap image to change (URL only)</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-red-800/20"
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Avatar URL</label>
            <input 
              type="url" 
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-red-800/20"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <button 
            type="submit"
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-800 text-white rounded-xl font-bold shadow-md hover:bg-red-900 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            <span>{isUpdating ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      </section>

      {/* Preferences Section */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-amber-600">
          <Globe size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Currency Symbol</label>
            <div className="grid grid-cols-3 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.symbol}
                  onClick={() => onCurrencyChange(curr.symbol)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    currency === curr.symbol 
                      ? 'bg-red-800 text-white border-red-800 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-100 hover:border-red-200'
                  }`}
                >
                  {curr.symbol} {curr.label.split(' - ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600">
          <Database size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Data Management</h3>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Download className="text-blue-600" size={20} />
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Export Data</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Download as JSON</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
              <Download size={14} />
            </div>
          </button>

          <button 
            onClick={onClearData}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-2xl transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="text-red-600" size={20} />
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Clear All Data</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Permanently delete all records</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-600 shadow-sm group-hover:scale-110 transition-transform">
              <Trash2 size={14} />
            </div>
          </button>
        </div>
      </section>

      <div className="text-center pt-4">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Intake Tracker v1.2.0</p>
        <p className="text-[9px] text-gray-300 mt-1 uppercase tracking-tighter">Built with care for your bar</p>
      </div>
    </div>
  );
}
