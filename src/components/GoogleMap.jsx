// components/GoogleMap.jsx
export default function GoogleMap({ latitude, longitude }) {
  return (
    <div>
      <iframe
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        width="100%"
        height="400"
        style={{ border: '2px solid #ccc', borderRadius: '8px' }}
        allowFullScreen
        title="Google Map"
      />

      <a
        id="directions-link"
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noreferrer"
        style={{
          marginTop: '10px',
          display: 'inline-block',
          padding: '10px',
          background: '#007bff',
          color: 'white',
          borderRadius: '6px',
          textDecoration: 'none',
        }}
      >
        📍 View in Google Maps
      </a>
    </div>
  );
}
