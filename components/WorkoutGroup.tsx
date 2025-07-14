
import React, { useState } from 'react';
import { WorkoutGroup as WorkoutGroupType, Exercise } from '../types';
import { ExerciseItem } from './ExerciseItem';
import { AddExerciseForm } from './AddExerciseForm';
import { FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiEdit, FiCheck } from 'react-icons/fi';

interface WorkoutGroupProps {
  group: WorkoutGroupType;
  onDeleteGroup: (id: string) => void;
  onUpdateGroupName: (id: string, newName: string) => void;
  onAddExercise: (groupId: string, exercise: Omit<Exercise, 'id' | 'history'>) => void;
  onDeleteExercise: (groupId: string, exerciseId: string) => void;
  onUpdateExercise: (groupId: string, exercise: Exercise) => void;
  onAddWeightToHistory: (groupId: string, exerciseId: string, weight: string) => void;
}

export const WorkoutGroup: React.FC<WorkoutGroupProps> = ({ 
    group, 
    onDeleteGroup,
    onUpdateGroupName,
    onAddExercise, 
    onDeleteExercise,
    onUpdateExercise,
    onAddWeightToHistory
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(group.name);

  const handleAddExercise = (exercise: Omit<Exercise, 'id' | 'history'>) => {
    onAddExercise(group.id, exercise);
    setIsAddingExercise(false);
  };
  
  const handleUpdateName = () => {
    if (groupName.trim() && groupName.trim() !== group.name) {
        onUpdateGroupName(group.id, groupName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg transition-all duration-300 animate-fade-in">
      <header className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-4 flex-grow min-w-0">
            {isEditingName ? (
                <input 
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onBlur={handleUpdateName}
                    onKeyDown={(e) => {if (e.key === 'Enter') handleUpdateName()}}
                    className="text-xl font-bold bg-slate-700 text-white rounded-md py-1 px-2 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    autoFocus
                />
            ) : (
                <h3 className="text-xl font-bold text-white truncate" title={group.name}>{group.name}</h3>
            )}
            
            {isEditingName ? (
                 <button onClick={handleUpdateName} className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0" aria-label="Confirmar nome do grupo">
                    <FiCheck className="w-5 h-5"/>
                </button>
            ) : (
                 <button onClick={() => setIsEditingName(true)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0" aria-label="Editar nome do grupo">
                    <FiEdit className="w-5 h-5"/>
                </button>
            )}

        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onDeleteGroup(group.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors" aria-label="Excluir grupo">
            <FiTrash2 className="w-5 h-5" />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label={isExpanded ? 'Recolher grupo' : 'Expandir grupo'}>
            {isExpanded ? <FiChevronUp className="w-6 h-6" /> : <FiChevronDown className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 space-y-4">
          {group.exercises.length > 0 ? (
            <div className="space-y-3">
              {group.exercises.map(exercise => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  onDelete={(exerciseId) => onDeleteExercise(group.id, exerciseId)}
                  onUpdate={(updatedExercise) => onUpdateExercise(group.id, updatedExercise)}
                  onAddWeight={(weight) => onAddWeightToHistory(group.id, exercise.id, weight)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">Nenhum exercício adicionado a este grupo ainda.</p>
          )}

          {isAddingExercise ? (
            <AddExerciseForm onAddExercise={handleAddExercise} onCancel={() => setIsAddingExercise(false)} />
          ) : (
            <button
              onClick={() => setIsAddingExercise(true)}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200"
            >
              <FiPlus className="w-5 h-5" />
              Adicionar Exercício
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
