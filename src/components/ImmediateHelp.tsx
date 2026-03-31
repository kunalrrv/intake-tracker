import React from 'react';
import { MessageSquare, Phone } from 'lucide-react';

export default function ImmediateHelp() {
  return (
    <div className="mt-12 p-8 bg-gray-900 text-white rounded-3xl text-center">
      <MessageSquare className="mx-auto mb-4 text-red-500" size={32} />
      <h3 className="text-lg font-bold mb-2">Need immediate help?</h3>
      <p className="text-gray-400 text-sm mb-6">
        If you are in a crisis or life-threatening situation, please contact your local emergency services immediately.
      </p>
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-800 rounded-xl font-bold hover:bg-red-900 transition-colors cursor-pointer">
        <Phone size={18} />
        <span>Call Emergency Services</span>
      </div>
    </div>
  );
}
