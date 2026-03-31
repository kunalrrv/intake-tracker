/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Bottle, BottleStatus, Mood } from './types';
import Dashboard from './components/Dashboard';
import AddBottleForm from './components/AddBottleForm';
import BottleCard from './components/BottleCard';
import Reports from './components/Reports';
import SettingsComponent from './components/Settings';
import HelpMe from './components/HelpMe';
import MoodCalculator from './components/MoodCalculator';
import ImmediateHelp from './components/ImmediateHelp';
import { Wine, History, LayoutDashboard, Settings, LogIn, LogOut, AlertCircle, BarChart3, HeartHandshake, Smile, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User, 
  handleFirestoreError, 
  OperationType, 
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from './firebase';
import { Mail, Lock, User as UserIcon, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';

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
  const [moods, setMoods] = React.useState<Mood[]>([]);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'inventory' | 'history' | 'reports' | 'settings' | 'help' | 'mood'>('dashboard');
  const [inventoryPage, setInventoryPage] = React.useState(1);
  const ITEMS_PER_PAGE = 5;
  const [isLoading, setIsLoading] = React.useState(true);
  const [currency, setCurrency] = React.useState(localStorage.getItem('currency') || '$');
  
  // Auth state
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(false);
  const [verificationSent, setVerificationSent] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (!currentUser) {
        setBottles([]);
        setMoods([]);
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

  React.useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(collection(db, 'moods'), where('uid', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moodsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Mood));
      setMoods(moodsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'moods');
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      setAuthError(error.message);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setIsAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
      } catch (error: any) {
        setAuthError(error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleAddBottle = async (newBottle: Omit<Bottle, 'id' | 'uid'>) => {
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
    try {
      await deleteDoc(doc(db, 'bottles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bottles/${id}`);
    }
  };

  const handleAddMood = async (newMood: Omit<Mood, 'id' | 'uid'>) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const moodWithId: Mood = {
      ...newMood,
      id,
      uid: user.uid,
    };

    try {
      await setDoc(doc(db, 'moods', id), moodWithId);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `moods/${id}`);
    }
  };

  const handleDeleteMood = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'moods', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `moods/${id}`);
    }
  };

  const handleClearData = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'bottles'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'bottles/all');
    }
  };

  const handleUpdateProfile = async (displayName: string, photoURL: string) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName, photoURL });
      // Force a re-render by updating local user state if needed, 
      // but auth.currentUser is updated. 
      // We can just clone the user object to trigger re-render.
      setUser({...auth.currentUser} as User);
    } catch (error) {
      console.error('Profile update failed', error);
      throw error;
    }
  };

  const handleCheckVerification = async () => {
    if (auth.currentUser) {
      setIsAuthLoading(true);
      try {
        await auth.currentUser.reload();
        setUser({...auth.currentUser} as User);
      } catch (error: any) {
        setAuthError(error.message);
      } finally {
        setIsAuthLoading(false);
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
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-800 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <Wine size={32} />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase text-gray-900 mb-1">Intake Tracker</h1>
            <p className="text-gray-500 text-sm">Manage your alcohol inventory and spending.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? handleEmailSignIn : handleEmailRegister} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-800/20"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-800/20"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-800/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-800/20"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center pt-2">
                  Please check your spam/junk folder for the email verification email.
                </p>
              </div>
            )}

            {authError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-800 text-white rounded-2xl font-bold shadow-lg hover:bg-red-900 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAuthLoading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6 shadow-sm">
            <Mail size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Verify Your Email</h2>
          <p className="text-gray-500 mb-8">
            We've sent a verification link to <span className="font-bold text-gray-900">{user.email}</span>. 
            Please check your inbox and click the link to activate your account.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleCheckVerification}
              disabled={isAuthLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-800 text-white rounded-2xl font-bold shadow-lg hover:bg-red-900 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAuthLoading ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
              <span>I've Verified My Email</span>
            </button>
            <button
              onClick={handleResendVerification}
              className="w-full py-3 text-gray-500 font-bold uppercase tracking-widest text-xs hover:text-gray-700 transition-colors"
            >
              Resend Verification Email
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 text-red-600 font-bold uppercase tracking-widest text-xs hover:text-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {verificationSent && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-green-50 text-green-600 text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} />
              <span>Verification email sent!</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  const activeBottles = bottles.filter((b) => b.status !== BottleStatus.FINISHED);
  const totalInventoryPages = Math.ceil(activeBottles.length / ITEMS_PER_PAGE);
  const paginatedInventory = activeBottles.slice((inventoryPage - 1) * ITEMS_PER_PAGE, inventoryPage * ITEMS_PER_PAGE);
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
            <div 
              className="flex items-center gap-2 mr-2 cursor-pointer"
              onClick={() => setActiveTab('settings')}
            >
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                referrerPolicy="no-referrer"
              />
              <span className="hidden sm:inline text-xs font-bold text-gray-600 truncate max-w-[80px]">
                {user.displayName?.split(' ')[0]}
              </span>
            </div>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-2 transition-colors ${activeTab === 'settings' ? 'text-red-800' : 'text-gray-400 hover:text-gray-600'}`}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Logout">
              <LogOut size={20} />
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
                <AddBottleForm onAdd={handleAddBottle} currency={currency} />
                <Dashboard bottles={bottles} moods={moods} currency={currency} />
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Current Inventory</h2>
                  {totalInventoryPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
                        disabled={inventoryPage === 1}
                        className="p-1 text-gray-400 hover:text-red-800 disabled:opacity-20"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-sm font-bold text-gray-600">
                        {inventoryPage} / {totalInventoryPages}
                      </span>
                      <button 
                        onClick={() => setInventoryPage(p => Math.min(totalInventoryPages, p + 1))}
                        disabled={inventoryPage === totalInventoryPages}
                        className="p-1 text-gray-400 hover:text-red-800 disabled:opacity-20"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
                {activeBottles.length === 0 ? (
                  <div className="text-center py-12 px-6 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wine size={32} className="text-gray-300 opacity-50" />
                    </div>
                    <h3 className="text-gray-900 font-bold mb-2">Your bar is currently clear</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[240px] mx-auto">
                      A clear space can be a peaceful one. If you're on a journey to reduce your intake, we're here to support your mindful tracking whenever you're ready.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {paginatedInventory.map((bottle) => (
                          <motion.div
                            layout
                            key={bottle.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <BottleCard
                              bottle={bottle}
                              onMarkAsFinished={handleMarkAsFinished}
                              onDelete={handleDeleteBottle}
                              currency={currency}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Bottom Pagination */}
                    {totalInventoryPages > 1 && (
                      <div className="flex justify-center items-center gap-4 pt-4">
                        <button 
                          onClick={() => {
                            setInventoryPage(p => Math.max(1, p - 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={inventoryPage === 1}
                          className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-800 hover:border-red-100 transition-all disabled:opacity-20 shadow-sm"
                        >
                          <ChevronLeft size={18} />
                          <span className="text-xs font-bold uppercase tracking-widest">Prev</span>
                        </button>
                        
                        <span className="text-sm font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                          {inventoryPage} / {totalInventoryPages}
                        </span>
                        
                        <button 
                          onClick={() => {
                            setInventoryPage(p => Math.min(totalInventoryPages, p + 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={inventoryPage === totalInventoryPages}
                          className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-800 hover:border-red-100 transition-all disabled:opacity-20 shadow-sm"
                        >
                          <span className="text-xs font-bold uppercase tracking-widest">Next</span>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </>
                )}
                <div className="pt-4">
                  <AddBottleForm onAdd={handleAddBottle} currency={currency} />
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Reports bottles={bottles} onDelete={handleDeleteBottle} currency={currency} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <SettingsComponent 
                  user={user} 
                  bottles={bottles} 
                  onClearData={handleClearData}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  onUpdateProfile={handleUpdateProfile}
                />
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
                      currency={currency}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <HelpMe />
              </motion.div>
            )}

            {activeTab === 'mood' && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <MoodCalculator 
                  moods={moods} 
                  onAddMood={handleAddMood} 
                  onDeleteMood={handleDeleteMood} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        <ImmediateHelp />
        
        <div className="text-center pt-8 pb-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Intake Tracker v1.2.0</p>
        </div>
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
            active={activeTab === 'mood'}
            onClick={() => setActiveTab('mood')}
            icon={<Smile size={20} />}
            label="Mood"
          />
          <NavButton
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
            icon={<BarChart3 size={20} />}
            label="Reports"
          />
          <NavButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<History size={20} />}
            label="History"
          />
          <NavButton
            active={activeTab === 'help'}
            onClick={() => setActiveTab('help')}
            icon={<HeartHandshake size={20} />}
            label="Help Me"
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

