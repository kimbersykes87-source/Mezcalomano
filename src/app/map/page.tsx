export const metadata = {
  title: "Map",
  description: "Interactive map of agave species",
};

export default function MapPage() {
  return (
    <div className="coming-soon">
      <h1>Interactive Map</h1>
      <p>
        Explore agave species across their native habitats. Our interactive map is coming soon.
      </p>
      <a
        href="https://map.mezcalomano.com"
        className="btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Map
      </a>
      <p className="coming-soon-note">Coming soon</p>
    </div>
  );
}
