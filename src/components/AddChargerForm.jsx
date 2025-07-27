// components/AddChargerForm.jsx
import axios from 'axios';

export default function AddChargerForm({ locationId }) {
  const handleAddCharger = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newCharger = {
      name: form.name.value,
      power: form.power.value,
      type: form.type.value,
      status: form.status.value,
    };
    await axios.post(`/api/chargers/${locationId}`, newCharger ,{ withCredentials: true});
    window.location.reload();
  };

  return (
    <form onSubmit={handleAddCharger}>
      <h3>Add New Charger</h3>
      <input name="name" placeholder="Charger Name (e.g. Charger 1)" required /><br />
      <input name="power" type="number" placeholder="Power (kW)" required /><br />

      <select name="type" required>
        <option value="AC">AC</option>
        <option value="DC">DC</option>
        <option value="Type2">Type2</option>
        <option value="CCS">CCS</option>
        <option value="CHAdeMO">CHAdeMO</option>
      </select><br />

      <select name="status">
        <option value="available">Available</option>
        <option value="plugged in">Plugged In</option>
        <option value="faulty">Faulty</option>
      </select><br />

      <button type="submit">Add Charger</button>
    </form>
  );
}
