import React from 'react';
import { Mood } from '../types';
import { 
  Frown, 
  Meh, 
  Smile, 
  SmilePlus, 
  Angry,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MoodCalculatorProps {
  moods: Mood[];
  onAddMood: (mood: Omit<Mood, 'id' | 'uid'>) => Promise<void>;
  onDeleteMood: (id: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 5;

export default function MoodCalculator({ moods, onAddMood, onDeleteMood }: MoodCalculatorProps) {
  const [rating, setRating] = React.useState<number>(3);
  const [note, setNote] = React.useState('');
  const [date, setDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  const moodOptions = [
    { value: 1, icon: <Angry size={32} />, label: 'Terrible', color: 'text-red-600', bg: 'bg-red-50' },
    { value: 2, icon: <Frown size={32} />, label: 'Bad', color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: 3, icon: <Meh size={32} />, label: 'Okay', color: 'text-amber-500', bg: 'bg-amber-50' },
    { value: 4, icon: <Smile size={32} />, label: 'Good', color: 'text-green-500', bg: 'bg-green-50' },
    { value: 5, icon: <SmilePlus size={32} />, label: 'Great', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddMood({ date, rating, note });
      setNote('');
      setRating(3);
      setCurrentPage(1); // Reset to first page when adding new
    } catch (error) {
      console.error('Failed to add mood', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedMoods = [...moods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedMoods.length / ITEMS_PER_PAGE);
  const paginatedMoods = sortedMoods.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Prepare data for mood chart: Last 10 days
  const last10Days = Array.from({ length: 10 }).map((_, i) => {
    const date = subDays(new Date(), 9 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayMoods = moods.filter(m => m.date === dateStr);
    const avgRating = dayMoods.length > 0 
      ? dayMoods.reduce((sum, m) => sum + m.rating, 0) / dayMoods.length 
      : null;

    return {
      date: format(date, 'MMM d'),
      rating: avgRating,
    };
  });

  return (
    <div className="space-y-8 pb-12">
      <h2 className="text-2xl font-bold">Mood Calculator</h2>

      {/* Add Mood Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-8"
      >
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-gray-900">How are you feeling?</h3>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            Especially after a long party, it's important to check in with yourself.
          </p>
        </div>

        <div className="flex justify-between items-center px-2">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRating(option.value)}
              className={`flex flex-col items-center gap-2 transition-all ${
                rating === option.value ? 'scale-125' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
              }`}
            >
              <div className={`${rating === option.value ? option.color : 'text-gray-400'}`}>
                {option.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${rating === option.value ? option.color : 'text-gray-400'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-800/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-red-800/20 min-h-[100px] resize-none"
              placeholder="How was the party? Any hangover symptoms?"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-red-800 text-white rounded-2xl font-bold shadow-lg hover:bg-red-900 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus size={20} />
            <span>{isSubmitting ? 'Saving...' : 'Save Mood Entry'}</span>
          </button>
        </form>
      </motion.section>

      {/* Mood Chart */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Smile size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Mood Trends (Last 10 Days)</h3>
        </div>
        <div className="h-48 w-full">
          {moods.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last10Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis 
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#8B0000" 
                  strokeWidth={3}
                  dot={{ fill: '#8B0000', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <Smile size={32} className="mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No mood data available</p>
            </div>
          )}
        </div>
      </section>

      {/* Mood History */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">History</h3>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-red-800 disabled:opacity-20"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-400 hover:text-red-800 disabled:opacity-20"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {paginatedMoods.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <Meh size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-gray-400 text-sm font-medium">No mood history yet.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {paginatedMoods.map((mood) => {
                const option = moodOptions.find(o => o.value === mood.rating);
                return (
                  <motion.div 
                    layout
                    key={mood.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${option?.bg} ${option?.color}`}>
                      {option?.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {format(new Date(mood.date.split('T')[0] + 'T12:00:00'), 'EEEE, MMM d')}
                          </p>
                          <h4 className={`font-bold ${option?.color}`}>{option?.label}</h4>
                        </div>
                        <button 
                          onClick={() => onDeleteMood(mood.id)}
                          className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {mood.note && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2 italic">"{mood.note}"</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <button 
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-800 hover:border-red-100 transition-all disabled:opacity-20 shadow-sm"
            >
              <ChevronLeft size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Prev</span>
            </button>
            
            <span className="text-sm font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              {currentPage} / {totalPages}
            </span>
            
            <button 
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-800 hover:border-red-100 transition-all disabled:opacity-20 shadow-sm"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
