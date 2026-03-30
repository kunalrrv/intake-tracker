import React from 'react';
import { Bottle, BottleStatus } from '../types';
import { 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO, 
  format, 
  startOfYear,
  subMonths,
  subYears
} from 'date-fns';
import { 
  Filter, 
  Calendar, 
  Tag, 
  DollarSign, 
  ChevronDown, 
  X,
  BarChart3,
  TrendingDown,
  Zap,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ITEMS_PER_PAGE = 5;

interface ReportsProps {
  bottles: Bottle[];
  onDelete: (id: string) => void;
  currency: string;
}

export default function Reports({ bottles, onDelete, currency }: ReportsProps) {
  const [showFilters, setShowFilters] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filters, setFilters] = React.useState({
    month: '', // YYYY-MM
    startDate: '',
    endDate: '',
    type: '',
    minPrice: '',
    maxPrice: ''
  });

  const getFontSize = (val: string) => {
    if (val.length > 8) return 'text-lg';
    if (val.length > 6) return 'text-xl';
    return 'text-3xl';
  };

  const types = Array.from(new Set(bottles.map(b => b.type))).sort();
  
  const filteredBottles = bottles.filter(bottle => {
    const purchaseDate = parseISO(bottle.purchaseDate);
    
    // Month filter
    if (filters.month) {
      const [year, month] = filters.month.split('-').map(Number);
      if (purchaseDate.getFullYear() !== year || purchaseDate.getMonth() !== month - 1) {
        return false;
      }
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      const start = filters.startDate ? parseISO(filters.startDate) : startOfYear(new Date(0));
      const end = filters.endDate ? parseISO(filters.endDate) : new Date();
      if (!isWithinInterval(purchaseDate, { start, end })) {
        return false;
      }
    }

    // Type filter
    if (filters.type && bottle.type !== filters.type) {
      return false;
    }

    // Price filter
    if (filters.minPrice && bottle.price < Number(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && bottle.price > Number(filters.maxPrice)) {
      return false;
    }

    return true;
  });

  const totalSpent = filteredBottles.reduce((sum, b) => sum + b.price, 0);
  const totalCount = filteredBottles.length;
  const finishedCount = filteredBottles.filter(b => b.status === BottleStatus.FINISHED).length;
  const averagePrice = totalCount > 0 ? totalSpent / totalCount : 0;

  const resetFilters = () => {
    setFilters({
      month: '',
      startDate: '',
      endDate: '',
      type: '',
      minPrice: '',
      maxPrice: ''
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const setQuickFilter = (type: 'this-month' | 'last-month' | 'this-year') => {
    const now = new Date();
    resetFilters();
    
    if (type === 'this-month') {
      setFilters(prev => ({ ...prev, month: format(now, 'yyyy-MM') }));
    } else if (type === 'last-month') {
      setFilters(prev => ({ ...prev, month: format(subMonths(now, 1), 'yyyy-MM') }));
    } else if (type === 'this-year') {
      setFilters(prev => ({
        ...prev,
        startDate: format(startOfYear(now), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd')
      }));
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  // Generate last 12 months for the dropdown
  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return {
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy')
    };
  });

  const totalPages = Math.ceil(filteredBottles.length / ITEMS_PER_PAGE);
  const paginatedBottles = filteredBottles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <button 
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-800 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-red-100"
            >
              <X size={14} />
              <span>Reset All</span>
            </button>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              showFilters 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-red-800 text-white shadow-lg'
            }`}
          >
            <Filter size={18} />
            <span className="text-xs uppercase tracking-widest">{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              {/* Quick Filters */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 ml-1">
                  <Zap size={14} />
                  <label className="text-[10px] font-bold uppercase tracking-widest">Quick Select</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setQuickFilter('this-month')}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-800 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    This Month
                  </button>
                  <button 
                    onClick={() => setQuickFilter('last-month')}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-800 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Last Month
                  </button>
                  <button 
                    onClick={() => setQuickFilter('this-year')}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-800 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    This Year
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Month Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">By Month</label>
                  <div className="relative">
                    <select
                      value={filters.month}
                      onChange={(e) => handleFilterChange({ month: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 appearance-none focus:ring-2 focus:ring-red-800/20"
                    >
                      <option value="">All Months</option>
                      {monthOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Type Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">By Type</label>
                  <div className="relative">
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange({ type: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 appearance-none focus:ring-2 focus:ring-red-800/20"
                    >
                      <option value="">All Types</option>
                      {types.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                      className="w-1/2 bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-red-800/20 text-sm"
                    />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                      className="w-1/2 bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-red-800/20 text-sm"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price Range</label>
                  <div className="flex gap-2">
                    <div className="relative w-1/2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-red-800/20 text-sm"
                      />
                    </div>
                    <div className="relative w-1/2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-red-800/20 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <DollarSign size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Spent</span>
          </div>
          <div className={`font-black text-gray-900 ${getFontSize(`${currency}${totalSpent.toFixed(2)}`)}`}>
            {currency}{totalSpent.toFixed(2)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">In selected period</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <BarChart3 size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Bottles</span>
          </div>
          <div className="text-3xl font-black text-gray-900">{totalCount}</div>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Purchased</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <TrendingDown size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Consumed</span>
          </div>
          <div className="text-3xl font-black text-gray-900">{finishedCount}</div>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Bottles finished</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Tag size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Avg. Price</span>
          </div>
          <div className={`font-black text-gray-900 ${getFontSize(`${currency}${averagePrice.toFixed(2)}`)}`}>
            {currency}{averagePrice.toFixed(2)}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Per bottle</p>
        </div>
      </div>

      {/* List of filtered items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Detailed Section ({filteredBottles.length})</h3>
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

        {filteredBottles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
            <p>No bottles match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {paginatedBottles.map(bottle => (
                <motion.div 
                  layout
                  key={bottle.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-gray-900">{bottle.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                      <span>{bottle.type}</span>
                      <span>•</span>
                      <span>{format(parseISO(bottle.purchaseDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-black text-red-800">{currency}{bottle.price.toFixed(2)}</div>
                      <div className={`text-[9px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full inline-block ${
                        bottle.status === BottleStatus.FINISHED ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {bottle.status}
                      </div>
                    </div>
                    <button 
                      onClick={() => onDelete(bottle.id)}
                      className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                      title="Delete Bottle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

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
      </div>
    </div>
  );
}
