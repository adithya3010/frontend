
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import * as turf from '@turf/turf';
import polyline from '@mapbox/polyline';

const blueDotIcon = new L.DivIcon({
  html: '<div style="width: 16px; height: 16px; background: rgba(0,123,255,0.7); border-radius: 50%; box-shadow: 0 0 12px rgba(0,123,255,0.5);"></div>',
  className: ''
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [sortedLocations, setSortedLocations] = useState([]);
  const [showList, setShowList] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [chargingStops, setChargingStops] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
   axios.get('http://localhost:5000/api/locations')
  .then((res) => {
    setLocations(res.data);
  });

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const initAutocomplete = (id, setter) => {
          const input = document.getElementById(id);
          if (!input) return;
          const autocomplete = new window.google.maps.places.Autocomplete(input);
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              setter({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                name: place.formatted_address
              });
            }
          });
        };

        initAutocomplete('start', setStart);
        initAutocomplete('end', setEnd);
      });
    }
  }, []);

  const findNearest = () => {
    if (!userLocation || locations.length === 0) return;

    const level = parseInt(prompt("Enter your current battery percentage:"), 10);
    if (isNaN(level) || level < 0 || level > 100) {
      alert("Enter a valid percentage between 0 and 100.");
      return;
    }

    const updated = locations.map((loc) => {
      const actualDist = getDistance(userLocation.lat, userLocation.lng, Number(loc.latitude), Number(loc.longitude));
      const isRenewable = loc.sourceType === 'renewable';
      const adjustedDistance = isRenewable ? Math.max(actualDist - 5, 0) : actualDist;
      return {
        ...loc,
        actualDistance: actualDist,
        adjustedDistance
      };
    });

    if (level > 20) {
      updated.sort((a, b) => a.adjustedDistance - b.adjustedDistance);
    } else {
      updated.sort((a, b) => a.actualDistance - b.actualDistance);
    }

    setSortedLocations(updated);
    setShowList(true);
  };

  const handleRoute = async () => {
    if (!start || !end) return;

    const battery = parseInt(prompt("Enter your current battery percentage:"), 10);
    const efficiency = parseFloat(prompt("Enter your vehicle's km per 1% charge:"));

    if (isNaN(battery) || isNaN(efficiency) || battery <= 0 || battery > 100 || efficiency <= 0) {
      alert("Please enter valid battery percentage and efficiency.");
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/locations/get-route', {
        params: {
          origin: `${start.lat},${start.lng}`,
          destination: `${end.lat},${end.lng}`
        }
      });

      const encoded = res.data.encoded;
      const path = polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
      setRoutePoints(path);

      const line = turf.lineString(path.map(p => [p.lng, p.lat]));

      let currentBattery = battery;
      let cumulativeDistance = 0;
      let lastStop = path[0];
      const stops = [];

      for (let i = 1; i < path.length; i++) {
        const segmentDistance = getDistance(path[i - 1].lat, path[i - 1].lng, path[i].lat, path[i].lng);
        cumulativeDistance += segmentDistance;

        if (cumulativeDistance > currentBattery * efficiency) {
          const pt = turf.point([path[i].lng, path[i].lat]);
          const nearbyStations = locations.filter(loc => {
            const stationPt = turf.point([loc.longitude, loc.latitude]);
            const dist = turf.distance(pt, stationPt, { units: 'kilometers' });
            return dist <= 5;
          });

          if (nearbyStations.length > 0) {
            const nearest = nearbyStations.reduce((a, b) => {
              const da = getDistance(path[i].lat, path[i].lng, a.latitude, a.longitude);
              const db = getDistance(path[i].lat, path[i].lng, b.latitude, b.longitude);
              return da < db ? a : b;
            });

            stops.push(nearest);
            currentBattery = 100;
            cumulativeDistance = 0;
          }
        }
      }

      setChargingStops(stops);
      setShowSidebar(true);

    } catch (err) {
      console.error("Error fetching route:", err);
    }
  };

  const getSoonestETA = (chargers) => {
    let soonest = null;
    chargers.forEach(c => {
      if (c.status === 'plugged in' && c.chargingSession?.eta) {
        const eta = new Date(c.chargingSession.eta);
        if (!soonest || eta < soonest) {
          soonest = eta;
        }
      }
    });
    return soonest;
  };

  return (
    <>
      <h2>Find Your Charging Station</h2>
      <input id="start" placeholder="Start Location" />
      <input id="end" placeholder="End Location" />
      <button onClick={handleRoute}>Plan Trip</button>
      <br />
      <button onClick={findNearest} style={{ marginTop: 10 }}>Find Nearest</button>

      <div style={{ display: 'flex' }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "600px", flex: 1, marginTop: 10 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={blueDotIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {locations.map(loc => (
            <Marker key={loc._id} position={[loc.latitude, loc.longitude]} icon={greenIcon}>
              <Popup>
                <strong>{loc.name}</strong><br />
                Source: {loc.sourceType}<br />
                <p><strong>Available:</strong> {loc.chargerStatus?.available || 0}</p>
                <Link to={`/location/${loc._id}`}>Details</Link>
              </Popup>
            </Marker>
          ))}
          {chargingStops.map((loc, i) => (
            <Marker key={`stop-${i}`} position={[loc.latitude, loc.longitude]} icon={greenIcon}>
              <Popup>
                <strong>{loc.name}</strong><br />
                Recharge Stop #{i + 1}<br />
                <a href={`/location/${loc._id}`} target="_blank">Details</a>
              </Popup>
            </Marker>
          ))}
          {routePoints.length > 0 && (
            <Polyline positions={routePoints.map(p => [p.lat, p.lng])} color="blue" />
          )}
        </MapContainer>

        {showSidebar && (
          <div style={{
            width: 300, maxHeight: '600px', overflowY: 'auto', backgroundColor: '#f8f9fa',
            padding: '10px', borderLeft: '1px solid #ccc'
          }}>
            <h4>Stations Along Route</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {chargingStops.map((loc, index) => (
                <li key={loc._id} style={{ marginBottom: 12 }}>
                  <strong>{index + 1}. {loc.name}</strong><br />
                  {loc.sourceType}<br />
                  <a href={`/location/${loc._id}`} target="_blank">Details</a>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowSidebar(false)}>Close</button>
          </div>
        )}
      </div>

      {showList && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: '#fff', padding: 20, borderRadius: 10,
            width: '90%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto'
          }}>
            <h3>Nearest Charging Stations</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sortedLocations.slice(0, 10).map((loc, index) => (
                <li key={loc._id} style={{ marginBottom: '10px' }}>
                  <strong>{index + 1}. {loc.name}</strong><br />
                  Source: {loc.sourceType}<br />
                  Distance: {loc.actualDistance.toFixed(2)} km<br />
                  {loc.chargerStatus?.available === 0 ? (
  <span style={{ color: 'red' }}>
    {(() => {
      if (!loc.chargers || loc.chargers.length === 0) return "No chargers are added.";
      const soonest = getSoonestETA(loc.chargers);
      if (!soonest) return "All chargers busy. No ETA.";
      const minutes = Math.max(Math.round((new Date(soonest) - new Date()) / 60000), 0);
      return `Charger will be available in ${minutes} minutes`;
    })()}
  </span>
) : null}

                  <br />
                  <a href={`/location/${loc._id}`} target="_blank">Details</a>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowList(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default MapComponent;
