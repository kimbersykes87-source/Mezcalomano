export interface MatrixSpecies {
  species_id: string;
  scientific_name: string;
  common_name: string;
  one_liner: string;
  habitat: string;
  height: string;
  image_400: string;
  image_800: string;
}

interface MatrixCardProps {
  species: MatrixSpecies;
}

export default function MatrixCard({ species }: MatrixCardProps) {
  return (
    <div className="matrix-card" data-species-id={species.species_id}>
      <img
        src={species.image_400}
        alt={`${species.common_name} (${species.scientific_name})`}
        loading="lazy"
      />
    </div>
  );
}
