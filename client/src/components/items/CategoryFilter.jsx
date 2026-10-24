import React from 'react';
import { Layers, Cpu, Sparkles, BookOpen, Wrench, Trophy } from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Gear', icon: Layers },
  { id: 'Electronics & Kits', label: 'Electronics & Kits', icon: Cpu },
  { id: 'Lab Gear', label: 'Lab Gear', icon: Sparkles },
  { id: 'Textbooks & Notes', label: 'Textbooks & Notes', icon: BookOpen },
  { id: 'Drafting & Tools', label: 'Drafting & Tools', icon: Wrench },
  { id: 'Sports & Events', label: 'Sports & Events', icon: Trophy },
];

export const CategoryFilter = ({ selectedCategory = 'All', onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80'
            }`}
          >
            <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
