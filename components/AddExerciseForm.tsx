import React, { useState } from 'react';
import { Exercise } from '../types';
import { FiPlus } from 'react-icons/fi';

interface AddExerciseFormProps {
  onAddExercise: (exercise: Omit<Exercise, 'id' | 'history'>) => void;
  onCancel: () => void;
}

export const AddExerciseForm: React.FC<AddExerciseFormProps> = ({ onAddExercise, onCancel }) => {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && sets.trim() && reps.trim()) {
      onAddExercise({ name, sets, reps, currentTargetWeight: weight || '0' });
      setName('');
      setSets('');
      setReps('');
      setWeight('');
    }
  };
  
  const canSubmit = name.trim() && sets.trim() && reps.trim();

  return (
    <form onSubmit={handleSubmit} className="bg-slate-700/50 p-4 rounded-lg mt-4 animate-fade-in-down">
        <h4 className="text-lg font-semibold mb-3 text-slate-200">Novo Exercício</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do Exercício"
            className="col-span-1 md:col-span-2 bg-slate-800 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
            type="number"
            value={sets}
            onChange={e => setSets(e.target.value)}
            placeholder="Séries"
            className="bg-slate-800 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder="Repetições"
            className="bg-slate-800 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="Carga Inicial (KG)"
            className="col-span-1 md:col-span-2 bg-slate-800 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
        </div>
        <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                Cancelar
            </button>
            <button type="submit" disabled={!canSubmit} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed">
                <FiPlus className="w-5 h-5"/>
                Adicionar
            </button>
      </div>
    </form>
  );
};