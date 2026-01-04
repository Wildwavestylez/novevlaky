import fetch from 'node-fetch';

export async function fetchBusStops(lat, lon, radius = 5000) {
  const query = `
    [out:json];
    node(around:${radius},${lat},${lon})["highway"="bus_stop"];
    out;
  `;
  const res = await fetch(
    'https://overpass-api.de/api/interpreter?data=' +
    encodeURIComponent(query)
  );
  const data = await res.json();

  return data.elements.map(e => ({
    id: e.id,
    lat: e.lat,
    lon: e.lon,
    name: e.tags?.name || 'Zastávka'
  }));
}