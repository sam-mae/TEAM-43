import React, { useState } from 'react';
import axios from 'axios';

function RegisterMaterial() {
  const [materialID, setMaterialID] = useState('');
  const [supplierID, setSupplierID] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/register-material', {
        materialID,
        supplierID,
        quantity: parseInt(quantity),
      });
      setMessage('Material registered successfully');
    } catch (error) {
      setMessage('Failed to register material');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Register Raw Material</h2>
      <form onSubmit={handleSubmit}>
        <div>   
          <label htmlFor="materialID">Material ID:</label>
          <input
            type="text"
            id="materialID"
            value={materialID}
            onChange={(e) => setMaterialID(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="supplierID">Supplier ID:</label>
          <input
            type="text"
            id="supplierID"
            value={supplierID}
            onChange={(e) => setSupplierID(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register Material</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterMaterial;
