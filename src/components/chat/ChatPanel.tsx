import React from 'react';

interface ChatPanelProps {
  type: string;
  itemId: string;
  title: string;
  counterpartName: string;
  onClose: () => void;
}

export default function ChatPanel({ type, itemId, title, counterpartName, onClose }: ChatPanelProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{title}</h3>
        <button onClick={onClose} className="absolute right-4 top-4">×</button>
      </div>
      <div className="p-4">
        <p className="text-gray-600">Chat functionality is currently being updated.</p>
      </div>
    </div>
  );
} 