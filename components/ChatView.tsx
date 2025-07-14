
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { WorkoutGroup } from '../types';
import { FiSend, FiCopy, FiPlayCircle, FiCheck } from 'react-icons/fi';
import { Spinner } from './Spinner';
import { YouTubePlayerOverlay } from './YouTubePlayerOverlay';

interface ChatViewProps {
    workoutGroups: WorkoutGroup[];
    onAddWorkoutGroup: (name: string, exercises: {name: string, sets: string, reps: string}[]) => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

// Component to render message content and parse URLs into playable video buttons
const MessageContent: React.FC<{ text: string; onPlay: (videoId: string) => void }> = ({ text, onPlay }) => {
    // General URL regex. The capturing group is important for split.
    const urlRegex = new RegExp('(https?://[^\\s]+)', 'g');
    // YouTube URL regex to test against captured URLs.
    const youtubeRegex = new RegExp('^https://www\\.youtube\\.com/watch\\?v=([\\w-]+)');
    const parts = text.split(urlRegex);

    return (
        <div className="whitespace-pre-wrap">
            {parts.map((part, i) => {
                if (!part) {
                    return null;
                }

                // Odd indices from split are the URLs because of how split with a capturing group works.
                if (i % 2 === 1) { // It's a URL part
                    const youtubeMatch = part.match(youtubeRegex);
                    if (youtubeMatch && youtubeMatch[1]) {
                        const videoId = youtubeMatch[1];
                        return (
                             <button
                                key={i}
                                onClick={() => onPlay(videoId)}
                                className="inline-flex items-center gap-2 mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <FiPlayCircle className="w-5 h-5"/>
                                <span>Assistir ao Vídeo</span>
                            </button>
                        );
                    }
                    // It's another URL
                    return (
                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                            {part}
                        </a>
                    );
                }
                
                // It's a text part
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
};


export const ChatView: React.FC<ChatViewProps> = ({ workoutGroups, onAddWorkoutGroup }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: 'model',
                text: "Olá! Sou a Astra, sua personal trainer com IA. Como posso te ajudar hoje?\n\nVocê pode me pedir para:\n- **Criar um treino:** 'Crie um treino de costas e bíceps'\n- **Explicar um treino:** 'Como faço meu Dia de Perna?'\n- **Tirar dúvidas:** 'Qual a diferença entre supino reto e inclinado?'"
            }]);
        }
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: "AIzaSyCyoRrLZ8PUfJgMZq-sWn_AKMhvO-9v-iM" });
            
            const userWorkouts = workoutGroups.length > 0 
              ? JSON.stringify(workoutGroups.map(g => ({ name: g.name, exercises: g.exercises.map(e => e.name) })))
              : "Nenhum treino criado ainda.";

            const systemInstruction = `Você é um personal trainer expert chamado "Astra Train". Sua missão é ajudar usuários a atingir seus objetivos de fitness.

1.  **Analise a Intenção:** Primeiro, determine o que o usuário quer:
    *   **Criar um Treino:** Se o pedido for para criar um plano de treino (ex: "monte um treino de peito").
    *   **Explicar um Treino Existente:** Se o pedido for sobre como fazer um treino que já existe na lista dele (ex: "como faço meu Dia de Perna?").
    *   **Pergunta Geral:** Qualquer outra dúvida sobre fitness.

2.  **Como Responder:**
    *   **Para Criar um Treino:** Responda APENAS com um objeto JSON válido, sem nenhum texto adicional. Estrutura: \`{"groupName": "Nome", "exercises": [{"name": "Exercicio 1", "sets": "4", "reps": "10"}, ...]}\`.
    *   **Para Explicar um Treino Existente:** Identifique o grupo na lista do usuário. Para cada exercício, forneça uma explicação e encontre o **tutorial em vídeo mais popular e bem avaliado no YouTube**. Forneça um link direto para o vídeo no formato \`https://www.youtube.com/watch?v=VIDEO_ID\`.
    *   **Para Perguntas Gerais:** Responda de forma amigável e informativa, usando Markdown.

**Contexto do Usuário:**
- Os treinos atuais do usuário são: ${userWorkouts}`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: input,
                config: { systemInstruction }
            });

            const modelResponseText = response.text;
            let modelMessage: Message;

            if (modelResponseText) {
                 try {
                    const parsedJson = JSON.parse(modelResponseText);
                    if (parsedJson.groupName && parsedJson.exercises) {
                        onAddWorkoutGroup(parsedJson.groupName, parsedJson.exercises);
                        modelMessage = { role: 'model', text: `Ótimo! Criei o grupo de treino "${parsedJson.groupName}" para você. Confira na aba "Meus Treinos"!` };
                    } else {
                        modelMessage = { role: 'model', text: modelResponseText };
                    }
                } catch (e) {
                    modelMessage = { role: 'model', text: modelResponseText };
                }
            } else {
                 modelMessage = { role: 'model', text: 'Desculpe, não recebi uma resposta válida. Tente reformular sua pergunta.' };
            }
           
            
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: Message = { role: 'model', text: 'Desculpe, não consegui processar sua solicitação no momento. Verifique sua conexão ou tente novamente mais tarde.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000); // Reset after 2 seconds
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg flex flex-col h-[70vh] animate-fade-in">
            <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-white flex-shrink-0">A</div>}
                        <div className={`relative group max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-500 text-white rounded-br-lg' : 'bg-slate-700 text-slate-200 rounded-bl-lg'}`}>
                            <MessageContent text={msg.text} onPlay={setPlayingVideoId} />
                             {msg.role === 'model' && index > 0 && (
                                <button onClick={() => copyToClipboard(msg.text)} className="absolute top-1 right-1 p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Copiar texto">
                                    {copiedText === msg.text ? <FiCheck className="text-green-400" /> : <FiCopy />}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-white flex-shrink-0">A</div>
                        <div className="max-w-lg p-3 rounded-2xl bg-slate-700">
                           <Spinner />
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-700">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Converse com sua personal trainer IA..."
                        disabled={isLoading}
                        className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Enviar mensagem"
                    >
                        <FiSend className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {playingVideoId && (
                <YouTubePlayerOverlay 
                    videoId={playingVideoId}
                    onClose={() => setPlayingVideoId(null)}
                />
            )}
        </div>
    );
};
