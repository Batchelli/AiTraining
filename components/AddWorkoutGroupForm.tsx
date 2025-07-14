import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

interface AddWorkoutGroupFormProps {
  onAddGroup: (name: string) => void;
}

export const AddWorkoutGroupForm: React.FC<AddWorkoutGroupFormProps> = ({ onAddGroup }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddGroup(name.trim());
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Dia de Perna, Costas e Bíceps..."
        className="flex-grow bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
      />
      <button
        type="submit"
        className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
        disabled={!name.trim()}
      >
        <FiPlus className="w-5 h-5" />
        <span>Adicionar Grupo</span>
      </button>
    </form>
  );
};