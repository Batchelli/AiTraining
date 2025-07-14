
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkoutGroup as WorkoutGroupType, Exercise } from './types';
import { AddWorkoutGroupForm } from './components/AddWorkoutGroupForm';
import { WorkoutGroup } from './components/WorkoutGroup';
import { ChatView } from './components/ChatView';
import { FaDumbbell } from 'react-icons/fa';
import { FiList, FiMessageSquare, FiArchive, FiCheckCircle } from 'react-icons/fi';

// Moved outside the component to prevent re-creation on every render, improving performance.
const TabButton = ({ viewName, label, icon, activeView, setActiveView }) => (
    <button
      onClick={() => setActiveView(viewName)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
        activeView === viewName
          ? 'bg-cyan-500 text-white shadow-md'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
);

const App: React.FC = () => {
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroupType[]>([]);
  const [activeView, setActiveView] = useState<'workouts' | 'chat'>('workouts');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    try {
      const savedGroups = localStorage.getItem('workoutGroups');
      if (savedGroups) {
        setWorkoutGroups(JSON.parse(savedGroups));
      } else {
        // Sample data for first-time users
        setWorkoutGroups([
          {
            id: 'group-1',
            name: 'Dia de Perna',
            exercises: [
              { id: 'ex-1', name: 'Agachamento Livre', sets: '4', reps: '10', currentTargetWeight: '80', history: [{date: new Date().toISOString().split('T')[0], weight: '80'}] },
              { id: 'ex-2', name: 'Leg Press 45', sets: '4', reps: '12', currentTargetWeight: '120', history: [{date: new Date().toISOString().split('T')[0], weight: '120'}]  },
            ],
          },
          {
            id: 'group-2',
            name: 'Dia de Peito e Tríceps',
            exercises: [
              { id: 'ex-3', name: 'Supino Reto', sets: '4', reps: '8', currentTargetWeight: '70', history: [{date: new Date().toISOString().split('T')[0], weight: '70'}]  },
            ]
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to parse workout groups from localStorage", error);
      setWorkoutGroups([]);
    }
  }, []);

  useEffect(() => {
    // Avoid showing the save toast on the initial data load.
    if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
    }

    localStorage.setItem('workoutGroups', JSON.stringify(workoutGroups));
    setShowSaveToast(true);
    const timer = setTimeout(() => setShowSaveToast(false), 2000); // Hide toast after 2 seconds
    return () => clearTimeout(timer);
  }, [workoutGroups]);

  const handleAddWorkoutGroup = useCallback((name: string, exercises: Omit<Exercise, 'id' | 'history' | 'currentTargetWeight'>[] = []) => {
    const newExercises: Exercise[] = exercises.map(ex => ({
        ...ex,
        id: `ex-${Date.now()}-${Math.random()}`,
        currentTargetWeight: '0',
        history: [{ date: new Date().toISOString().split('T')[0], weight: '0' }]
    }));

    const newGroup: WorkoutGroupType = {
      id: `group-${Date.now()}`,
      name,
      exercises: newExercises,
    };
    setWorkoutGroups(prevGroups => [...prevGroups, newGroup]);
  }, []);

  const handleDeleteWorkoutGroup = useCallback((id: string) => {
    setWorkoutGroups(prevGroups => prevGroups.filter(group => group.id !== id));
  }, []);
  
  const handleUpdateGroupName = useCallback((id: string, newName: string) => {
    setWorkoutGroups(prevGroups => 
      prevGroups.map(group => group.id === id ? { ...group, name: newName } : group)
    );
  }, []);

  const handleAddExercise = useCallback((groupId: string, exercise: Omit<Exercise, 'id' | 'history'>) => {
    const newExercise: Exercise = { 
        ...exercise, 
        id: `ex-${Date.now()}`, 
        history: exercise.currentTargetWeight ? [{ date: new Date().toISOString().split('T')[0], weight: exercise.currentTargetWeight }] : []
    };
    setWorkoutGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId ? { ...group, exercises: [...group.exercises, newExercise] } : group
      )
    );
  }, []);

  const handleDeleteExercise = useCallback((groupId: string, exerciseId: string) => {
    setWorkoutGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === groupId) {
          return { ...group, exercises: group.exercises.filter(ex => ex.id !== exerciseId) };
        }
        return group;
      })
    );
  }, []);
  
  const handleUpdateExercise = useCallback((groupId: string, updatedExercise: Exercise) => {
    setWorkoutGroups(prevGroups => 
        prevGroups.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    exercises: group.exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex)
                };
            }
            return group;
        })
    );
  }, []);

  const handleAddWeightToHistory = useCallback((groupId: string, exerciseId: string, weight: string) => {
      setWorkoutGroups(prevGroups => 
        prevGroups.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    exercises: group.exercises.map(ex => {
                        if (ex.id === exerciseId) {
                            const newHistoryEntry = { date: new Date().toISOString().split('T')[0], weight };
                            return {
                                ...ex,
                                currentTargetWeight: weight,
                                history: [...ex.history, newHistoryEntry]
                            };
                        }
                        return ex;
                    })
                };
            }
            return group;
        })
      );
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-center gap-4 mb-6 text-center">
          <FaDumbbell className="w-10 h-10 text-cyan-400" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Meu Treino
          </h1>
        </header>
        
        <nav className="flex justify-center gap-3 mb-8">
          <TabButton viewName="workouts" label="Meus Treinos" icon={<FiList className="w-5 h-5"/>} activeView={activeView} setActiveView={setActiveView} />
          <TabButton viewName="chat" label="Chat IA" icon={<FiMessageSquare className="w-5 h-5" />} activeView={activeView} setActiveView={setActiveView} />
        </nav>

        <main>
          {activeView === 'workouts' && (
            <div className="animate-fade-in">
              <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-white">Adicionar Novo Grupo de Treino</h2>
                <AddWorkoutGroupForm onAddGroup={(name) => handleAddWorkoutGroup(name)} />
              </div>

              <div className="space-y-6">
                {workoutGroups.length > 0 ? (
                  workoutGroups.map(group => (
                    <WorkoutGroup
                      key={group.id}
                      group={group}
                      onDeleteGroup={handleDeleteWorkoutGroup}
                      onAddExercise={handleAddExercise}
                      onDeleteExercise={handleDeleteExercise}
                      onUpdateExercise={handleUpdateExercise}
                      onUpdateGroupName={handleUpdateGroupName}
                      onAddWeightToHistory={handleAddWeightToHistory}
                    />
                  ))
                ) : (
                    <div className="text-center py-10 px-6 bg-slate-800 rounded-lg flex flex-col items-center gap-4">
                        <FiArchive className="w-12 h-12 text-cyan-500" />
                        <h3 className="text-xl font-medium text-slate-300">Sua academia está vazia!</h3>
                        <p className="max-w-md text-slate-400">Adicione seu primeiro grupo de treino acima ou peça ao nosso assistente na aba "Chat IA" para montar um plano para você.</p>
                    </div>
                )}
              </div>
            </div>
          )}
          {activeView === 'chat' && (
             <ChatView 
                workoutGroups={workoutGroups}
                onAddWorkoutGroup={(name, exercises) => {
                    handleAddWorkoutGroup(name, exercises);
                    setActiveView('workouts');
                }}
             />
          )}
        </main>
      </div>

      {showSaveToast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in-down z-50">
          <FiCheckCircle className="w-5 h-5" />
          <span>Alterações salvas</span>
        </div>
      )}
    </div>
  );
};

export default App;
