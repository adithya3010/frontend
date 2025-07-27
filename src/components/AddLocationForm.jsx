import React, { useState } from 'react';
import axios from 'axios';

const AddLocationForm = () => {
  const [formData, setFormData] = useState({ name: '', latitude: '', longitude: '', sourceType: ''});

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
   await axios.post('http://localhost:5000/api/locations', {
  name: formData.name,
  latitude: parseFloat(formData.latitude),
  longitude: parseFloat(formData.longitude),
  sourceType: formData.sourceType
});

    alert("Location added!");
    window.location.reload(); // refresh the page to reload pins
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '10px' }}>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="latitude" placeholder="Latitude" onChange={handleChange} required />
      <input name="longitude" placeholder="Longitude" onChange={handleChange} required />
      <input name="sourceType" placeholder="renewable or non-renewable"
  onChange={handleChange} required pattern="renewable|non-renewable" />

      <button type="submit">Add Location</button>
    </form>
  );
};

export default AddLocationForm;