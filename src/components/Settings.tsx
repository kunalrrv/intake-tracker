import React from 'react';
import { User } from 'firebase/auth';
import { 
  User as UserIcon, 
  Database, 
  Download, 
  Upload,
  Trash2, 
  Save,
  Globe,
  Camera,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { Bottle } from '../types';

interface SettingsProps {
  user: User;
  bottles: Bottle[];
  onClearData: () => Promise<void>;
  onImportData?: (data: Bottle[]) => Promise<void>;
  onLoadSampleData?: () => Promise<void>;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  onUpdateProfile: (displayName: string, photoURL: string) => Promise<void>;
  deferredPrompt?: any;
  setDeferredPrompt?: (prompt: any) => void;
  onBack: () => void;
}

export default function Settings({ 
  user, 
  bottles, 
  onClearData, 
  onImportData,
  onLoadSampleData,
  currency, 
  onCurrencyChange, 
  onUpdateProfile,
  deferredPrompt,
  setDeferredPrompt,
  onBack
}: SettingsProps) {
  const [displayName, setDisplayName] = React.useState(user.displayName || '');
  const [photoURL, setPhotoURL] = React.useState(user.photoURL || '');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const fileImportRef = React.useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      await onUpdateProfile(displayName, photoURL);
      setUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to update profile', error);
      setUpdateMessage({ type: 'error', text: error.message || 'Failed to update profile. Image might be too large.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 72;
        const MAX_HEIGHT = 72;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/webp', 0.5);
        setPhotoURL(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportData) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          await onImportData(data);
          alert('Data imported successfully!');
        } else {
          alert('Invalid data format. Expected an array of bottles.');
        }
      } catch (error) {
        alert('Failed to parse the file. Please ensure it is a valid JSON export.');
      }
      if (fileImportRef.current) fileImportRef.current.value = '';
    };
    reader.readAsText(file);
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
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Profile Section */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-red-800">
          <UserIcon size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Profile Customization</h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img 
                src={photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=random`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tap image to upload or paste URL below</p>
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

          {updateMessage && (
            <div className={`p-3 rounded-xl text-sm font-bold text-center ${
              updateMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {updateMessage.text}
            </div>
          )}
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

      {/* App Installation Section */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-indigo-600">
          <Smartphone size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">App Installation</h3>
        </div>

        <div className="space-y-3">
          {deferredPrompt ? (
            <button 
              onClick={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    if (setDeferredPrompt) setDeferredPrompt(null);
                  }
                }
              }}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="text-indigo-600" size={20} />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Install App</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Add to your home screen</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                <Download size={14} />
              </div>
            </button>
          ) : (
            <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600">
              <p className="font-bold text-gray-900 mb-1">How to install on your device:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>iOS (Safari):</strong> Tap the Share button (<span className="text-xl leading-none inline-block align-middle">⍗</span>) and select "Add to Home Screen".</li>
                <li><strong>Android (Chrome):</strong> Tap the menu (⋮) and select "Install app" or "Add to Home screen".</li>
                <li><strong>Desktop:</strong> Look for the install icon (⤓) in your browser's address bar.</li>
              </ul>
            </div>
          )}
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

          <input
            type="file"
            accept=".json"
            ref={fileImportRef}
            onChange={handleImportFileChange}
            className="hidden"
          />
          <button 
            onClick={() => fileImportRef.current?.click()}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-2xl transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Upload className="text-green-600" size={20} />
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Import Data</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Restore from JSON</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform">
              <Upload size={14} />
            </div>
          </button>

          {onLoadSampleData && (
            <button 
              onClick={onLoadSampleData}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Database className="text-purple-600" size={20} />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Load Sample Data</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Populate with test data</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                <Database size={14} />
              </div>
            </button>
          )}

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
    </div>
  );
}
