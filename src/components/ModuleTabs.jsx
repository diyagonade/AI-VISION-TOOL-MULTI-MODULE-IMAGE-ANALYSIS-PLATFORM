import React from 'react';
import { MessageSquare, FileText, Sparkles } from 'lucide-react';

export default function ModuleTabs({ activeModule, onModuleChange }) {
  const modules = [
    { id: 'vqa', name: 'VQA', icon: MessageSquare },
    { id: 'ocr', name: 'OCR', icon: FileText },
    { id: 'enhancement', name: 'Enhancement', icon: Sparkles }
  ];

  return (
    <div className="flex gap-2 mb-6">
      {modules.map((module) => {
        const Icon = module.icon;
        return (
          <button
            key={module.id}
            onClick={() => onModuleChange(module.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeModule === module.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            {module.name}
          </button>
        );
      })}
    </div>
  );
}