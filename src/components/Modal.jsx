// src/components/Modal.jsx
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

export default function Modal({ onClose, children }) {
  useEffect(() => {
    // Prevent background scroll when modal is open
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') // 👈 Mounts outside the main app root
  );
}
