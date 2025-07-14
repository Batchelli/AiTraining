
import React, { useState } from 'react';
import { Exercise } from '../types';
import { FiTrash2, FiEdit, FiCheck, FiBarChart2 } from 'react-icons/fi';
import { ProgressModal } from './ProgressModal';

interface ExerciseItemProps {
  exercise: Exercise;
  onDelete: (id: string) => void;
  onUpdate: (exercise: Exercise) => void;
  onAddWeight: (weight: string) => void;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, onDelete, onUpdate, onAddWeight }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExercise, setEditedExercise] = useState(exercise);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdate = () => {
      onUpdate(editedExercise);
      setIsEditing(false);
  };
  
  const handleInputChange = <K extends keyof Omit<Exercise, 'id' | 'history'>>(key: K, value: Exercise[K]) => {
      setEditedExercise(prev => ({...prev, [key]: value}));
  };

  const handleAddWeightToHistory = (weight: string) => {
    onAddWeight(weight);
  };

  const inputClass = "bg-slate-800 border border-slate-600 rounded-md py-1 px-2 w-full focus:outline-none focus:ring-1 focus:ring-cyan-500";

  return (
    <>
    <div className="bg-slate-700/70 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300">
        {isEditing ? (
            <div className="flex-grow grid grid-cols-2 gap-3">
                <input type="text" value={editedExercise.name} onChange={e => handleInputChange('name', e.target.value)} className={`${inputClass} col-span-2`} placeholder="Nome do Exercício"/>
                <input type="number" value={editedExercise.sets} onChange={e => handleInputChange('sets', e.target.value)} className={inputClass} placeholder="Séries"/>
                <input type="number" value={editedExercise.reps} onChange={e => handleInputChange('reps', e.target.value)} className={inputClass} placeholder="Reps"/>
                <input type="number" value={editedExercise.currentTargetWeight} onChange={e => handleInputChange('currentTargetWeight', e.target.value)} className={`${inputClass} col-span-2`} placeholder="Carga Atual (KG)"/>
            </div>
        ) : (
            <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 items-center gap-x-4 gap-y-2">
                <p className="col-span-2 sm:col-span-1 text-lg font-semibold text-white">{exercise.name}</p>
                <p className="text-slate-300"><span className="font-medium text-slate-400">Séries:</span> {exercise.sets}</p>
                <p className="text-slate-300"><span className="font-medium text-slate-400">Reps:</span> {exercise.reps}</p>
                {exercise.currentTargetWeight && <p className="col-span-2 sm:col-span-3 text-slate-300"><span className="font-medium text-slate-400">Carga:</span> {exercise.currentTargetWeight} KG</p>}
            </div>
        )}
      <div className="flex items-center justify-end gap-2 shrink-0">
          <button onClick={() => setIsModalOpen(true)} className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-600 rounded-full transition-colors" aria-label="Ver progresso">
              <FiBarChart2 className="w-5 h-5" />
          </button>
          {isEditing ? (
            <button onClick={handleUpdate} className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-600 rounded-full transition-colors" aria-label="Confirmar edição">
              <FiCheck className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-600 rounded-full transition-colors" aria-label="Editar exercício">
              <FiEdit className="w-5 h-5" />
            </button>
          )}
        <button onClick={() => onDelete(exercise.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-full transition-colors" aria-label="Excluir exercício">
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
    <ProgressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        exerciseName={exercise.name}
        history={exercise.history}
        onAddWeight={handleAddWeightToHistory}
    />
    </>
  );
};
