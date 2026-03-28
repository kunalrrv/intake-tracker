import React, { useState } from 'react';
import { ALCOHOL_TYPES } from '../constants';
import { Bottle, BottleStatus } from '../types';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddBottleFormProps {
  onAdd: (bottle: Omit<Bottle, 'id'>) => void;
}

export default function AddBottleForm({ onAdd }: AddBottleFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Beer',
    price: '',
    volume: '750',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      type: formData.type,
      price: parseFloat(formData.price) || 0,
      volume: parseInt(formData.volume) || 0,
      purchaseDate: new Date(formData.purchaseDate).toISOString(),
      status: BottleStatus.UNOPENED,
    });
    setFormData({
      name: '',
      type: 'Beer',
      price: '',
      volume: '750',
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-800 text-white rounded-2xl font-semibold shadow-lg hover:bg-red-900 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Add New Bottle</span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl relative"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <h3 className="text-xl font-bold mb-4 text-gray-900">New Purchase</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bottle Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Jack Daniels, Heineken"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                >
                  {ALCOHOL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
                <input
                  required
                  type="number"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="750"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  required
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-red-800 text-white rounded-xl font-semibold hover:bg-red-900 transition-colors shadow-md"
            >
              Save Purchase
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
