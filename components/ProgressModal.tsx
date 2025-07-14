
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiX, FiPlus } from 'react-icons/fi';

interface ProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseName: string;
    history: Array<{ date: string; weight: string }>;
    onAddWeight: (weight: string) => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose, exerciseName, history, onAddWeight }) => {
    const [newWeight, setNewWeight] = useState('');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(newWeight.trim()){
            onAddWeight(newWeight.trim());
            setNewWeight('');
        }
    };
    
    // Sort history to make sure the latest is always first, even if array isn't sorted
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const modalContent = (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md mx-auto text-slate-100 p-6 animate-fade-in-down"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{exerciseName}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-cyan-400">Histórico de Carga</h3>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                        {sortedHistory.length > 0 ? (
                            sortedHistory.map((entry, index) => (
                                <div 
                                    key={index} 
                                    className={`flex justify-between items-center p-3 rounded-md transition-all ${
                                        index === 0 
                                        ? 'bg-slate-700 border-l-4 border-cyan-400' 
                                        : 'bg-slate-700/50'
                                    }`}
                                >
                                    <span className="text-slate-300 font-medium">{new Date(entry.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                    <span className="font-bold text-white text-lg">{entry.weight} KG</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-4">Nenhum histórico registrado.</p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <h3 className="font-semibold text-lg mb-3 text-cyan-400">Registrar Novo Peso</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                         <input
                            type="number"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            placeholder="Carga de hoje (KG)"
                            className="flex-grow bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!newWeight.trim()}
                            className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            <FiPlus className="w-5 h-5" />
                            <span>Adicionar</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
    
    const modalRoot = document.getElementById('modal-root');
    return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};
