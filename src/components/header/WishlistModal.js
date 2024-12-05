// src/components/Modal.js

import React from 'react';
import './Modal.css'; // Create a CSS file for styling if needed

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null; // Do not render the modal if it's not open

    return (
        <div className="modal-overlay">
            oye Ani fia
        </div>
    );
};

export default Modal;
