import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminChargingStations() {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await axios.get('/api/locations');
        setStations(res.data);
      } catch (err) {
        console.error('Error fetching stations:', err);
      }
    };

    fetchStations();
  }, []);

  // Filter stations based on search input
  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Charging Stations</h2>
      
      <input
        type="text"
        placeholder="Search by station name..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ padding: '8px', width: '300px', marginBottom: '16px' }}
      />

      <ul>
        {filteredStations.map(station => (
          <li key={station._id}>
            <strong>{station.name}</strong> 
          </li>
        ))}
      </ul>

      {filteredStations.length === 0 && <p>No stations found.</p>}
    </div>
  );
}
