
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiX } from 'react-icons/fi';

interface YouTubePlayerOverlayProps {
  videoId: string;
  onClose: () => void;
}

export const YouTubePlayerOverlay: React.FC<YouTubePlayerOverlayProps> = ({ videoId, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const overlayContent = (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl aspect-video bg-black rounded-lg shadow-2xl animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Fechar vídeo"
        >
          <FiX className="w-6 h-6" />
        </button>
        <iframe
          className="w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(overlayContent, modalRoot) : null;
};
