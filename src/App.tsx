/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Bottle, BottleStatus } from './types';
import Dashboard from './components/Dashboard';
import AddBottleForm from './components/AddBottleForm';
import BottleCard from './components/BottleCard';
import { Wine, History, LayoutDashboard, Settings, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, User, handleFirestoreError, OperationType } from './firebase';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-800 text-white rounded-xl font-semibold hover:bg-red-900 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AlcoholTrackerApp />
    </ErrorBoundary>
  );
}

function AlcoholTrackerApp() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [bottles, setBottles] = React.useState<Bottle[]>([]);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'inventory' | 'history'>('dashboard');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (!currentUser) {
        setBottles([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!isAuthReady || !user) return;

    setIsLoading(true);
    const q = query(collection(db, 'bottles'), where('uid', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bottlesData = snapshot.docs.map(doc => doc.data() as Bottle);
      // Sort by purchaseDate descending
      bottlesData.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      setBottles(bottlesData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bottles');
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleAddBottle = async (newBottle: Omit<Bottle, 'id'>) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const bottleWithId: Bottle = {
      ...newBottle,
      id,
      uid: user.uid,
    } as Bottle;

    try {
      await setDoc(doc(db, 'bottles', id), bottleWithId);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `bottles/${id}`);
    }
  };

  const handleMarkAsFinished = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'bottles', id), {
        status: BottleStatus.FINISHED,
        finishedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bottles/${id}`);
    }
  };

  const handleDeleteBottle = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteDoc(doc(db, 'bottles', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `bottles/${id}`);
      }
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-800 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
            <Wine size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-gray-900 mb-2">Intake Tracker</h1>
          <p className="text-gray-500 mb-8">Track your purchases, spending, and alcohol intake with ease.</p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-800 text-white rounded-2xl font-bold shadow-lg hover:bg-red-900 transition-all active:scale-95"
          >
            <LogIn size={20} />
            <span>Sign in with Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  const activeBottles = bottles.filter((b) => b.status !== BottleStatus.FINISHED);
  const historyBottles = bottles.filter((b) => b.status === BottleStatus.FINISHED);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center text-white">
              <Wine size={18} />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">Intake Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Dashboard bottles={bottles} />
                <AddBottleForm onAdd={handleAddBottle} />
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-4">Current Inventory</h2>
                {activeBottles.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                    <Wine size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Your bar is empty. Add a bottle!</p>
                  </div>
                ) : (
                  activeBottles.map((bottle) => (
                    <BottleCard
                      key={bottle.id}
                      bottle={bottle}
                      onMarkAsFinished={handleMarkAsFinished}
                      onDelete={handleDeleteBottle}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-4">Consumption History</h2>
                {historyBottles.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                    <History size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No finished bottles yet.</p>
                  </div>
                ) : (
                  historyBottles.map((bottle) => (
                    <BottleCard
                      key={bottle.id}
                      bottle={bottle}
                      onMarkAsFinished={handleMarkAsFinished}
                      onDelete={handleDeleteBottle}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-8 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <NavButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={20} />}
            label="Home"
          />
          <NavButton
            active={activeTab === 'inventory'}
            onClick={() => setActiveTab('inventory')}
            icon={<Wine size={20} />}
            label="Bar"
          />
          <NavButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<History size={20} />}
            label="History"
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        active ? 'text-red-800 scale-110' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className={`p-1 rounded-lg ${active ? 'bg-red-50' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

