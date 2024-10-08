import React, { useState } from "react";
import AddProductModal from "./productModal"; // Assuming the modal component is in the same directory

function CreateProduct() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF3E0' // Light yellow background for the page
      }}
    >
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FFB300', // Golden yellow for the button
          color: '#FFF',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#FF8F00')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#FFB300')}
      >
        Add New Product
      </button>

      {isModalOpen && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default CreateProduct;
