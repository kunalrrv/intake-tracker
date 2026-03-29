import React from 'react';
import { Bottle, BottleStatus } from '../types';
import { format } from 'date-fns';
import { CheckCircle, Trash2, Calendar, DollarSign, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

interface BottleCardProps {
  bottle: Bottle;
  onMarkAsFinished: (id: string) => void;
  onDelete: (id: string) => void;
  currency: string;
}

const BottleCard: React.FC<BottleCardProps> = ({ bottle, onMarkAsFinished, onDelete, currency }) => {
  const isFinished = bottle.status === BottleStatus.FINISHED;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative p-4 rounded-2xl border ${
        isFinished ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold text-lg text-gray-900">{bottle.name}</h3>
          <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
            {bottle.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isFinished && (
            <button
              onClick={() => onMarkAsFinished(bottle.id)}
              className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
              title="Mark as Finished"
            >
              <CheckCircle size={20} />
            </button>
          )}
          <button
            onClick={() => onDelete(bottle.id)}
            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            title="Delete Record"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{format(new Date(bottle.purchaseDate), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} />
          <span>{currency}{bottle.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets size={14} />
          <span>{bottle.volume}ml</span>
        </div>
        {isFinished && bottle.finishedAt && (
          <div className="flex items-center gap-1.5 text-green-600 font-medium">
            <CheckCircle size={14} />
            <span>Finished: {format(new Date(bottle.finishedAt), 'MMM d')}</span>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default BottleCard;
