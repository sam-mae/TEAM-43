import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [materialID, setMaterialID] = useState('');
  const [supplierID, setSupplierID] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/rawmaterial', {
        materialID,
        supplierID,
        quantity: parseInt(quantity)
      });
      alert('Raw material registered successfully: ' + response.data.message);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message || 'Unknown error occurred'));
    }
  };

  return (
    <div>
      <h1>Register Raw Material</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={materialID}
          onChange={(e) => setMaterialID(e.target.value)}
          placeholder="Material ID"
        />
        <input
          type="text"
          value={supplierID}
          onChange={(e) => setSupplierID(e.target.value)}
          placeholder="Supplier ID"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default App;