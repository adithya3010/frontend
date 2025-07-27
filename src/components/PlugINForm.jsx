import React, { useState } from 'react';

const PlugInForm = ({ charger }) => {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      batteryCapacity: form.batteryCapacity.value,
      currentCharge: form.currentCharge.value,
      targetCharge: form.targetCharge.value,
      chargingPower: form.chargingPower.value,
    };

    try {
      const response = await fetch(`/chargers/${charger._id}/plug-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log('Charging started:', result);
    } catch (error) {
      console.error('Error starting charge:', error);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <h2>🔌 Plug In Charger: {charger.name}</h2>
      <p>Station: {charger.stationId.name}</p>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ padding: '10px' }}>
          Plug In
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', marginTop: '20px' }}>
          <input name="batteryCapacity" type="number" placeholder="Battery Capacity (kWh)" required />
          <input name="currentCharge" type="number" placeholder="Current Charge (%)" required />
          <input name="targetCharge" type="number" placeholder="Target Charge (%)" required />
          <input name="chargingPower" type="number" placeholder="Charging Power (kW)" required />
          <button type="submit">Start Charging</button>
        </form>
      )}
    </div>
  );
};

export default PlugInForm;
