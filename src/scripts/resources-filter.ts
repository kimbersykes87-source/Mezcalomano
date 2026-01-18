/**
 * Resources page: CSV parsing, filtering, and display
 */

interface Species {
  species_id: string;
  scientific_name: string;
  common_name: string;
  habitat: string;
  elevation_range: string;
  geographic_region: string;
  mezcal_use: string;
  conservation_status: string;
  management_category: string;
  suit: string;
  rank: string;
  [key: string]: string; // For other CSV fields
}

let speciesData: Species[] = [];
let filteredData: Species[] = [];

async function loadSpeciesData(): Promise<Species[]> {
  try {
    const response = await fetch('/data/species.csv');
    if (!response.ok) {
      throw new Error('Failed to load species data');
    }
    const csvText = await response.text();
    
    // Parse CSV manually (simple parser for our use case)
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]);
    const data: Species[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const species: Species = {} as Species;
      headers.forEach((header, index) => {
        species[header] = values[index] || '';
      });
      data.push(species);
    }

    return data;
  } catch (error) {
    console.error('Error loading species data:', error);
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

function filterSpecies(searchTerm: string, managementFilter: string, suitFilter: string): Species[] {
  const search = searchTerm.toLowerCase().trim();
  
  return speciesData.filter((species) => {
    // Search filter
    if (search) {
      const matchesSearch =
        species.scientific_name?.toLowerCase().includes(search) ||
        species.common_name?.toLowerCase().includes(search) ||
        species.geographic_region?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Management category filter
    if (managementFilter && species.management_category !== managementFilter) {
      return false;
    }

    // Suit filter
    if (suitFilter && species.suit !== suitFilter) {
      return false;
    }

    return true;
  });
}

function renderTable(species: Species[]) {
  const container = document.getElementById('species-table-container');
  if (!container) return;

  if (species.length === 0) {
    container.classList.add('hidden');
    return;
  }

  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Scientific Name</th>
          <th>Common Name</th>
          <th>Geographic Region</th>
          <th>Elevation Range</th>
          <th>Mezcal Use</th>
          <th>Conservation Status</th>
          <th>Management Category</th>
          <th>Suit</th>
          ${species[0].rank ? '<th>Rank</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${species.map((s) => `
          <tr>
            <td><strong>${s.scientific_name || ''}</strong></td>
            <td>${s.common_name || ''}</td>
            <td>${s.geographic_region || ''}</td>
            <td>${s.elevation_range || ''}</td>
            <td>${s.mezcal_use || ''}</td>
            <td>${s.conservation_status || ''}</td>
            <td>${s.management_category?.replace(/_/g, ' ') || ''}</td>
            <td>${s.suit?.replace(/_/g, ' ') || ''}</td>
            ${s.rank ? `<td>${s.rank}</td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
  container.classList.remove('hidden');
}

function renderCards(species: Species[]) {
  const container = document.getElementById('species-cards-container');
  if (!container) return;

  if (species.length === 0) {
    container.classList.add('hidden');
    return;
  }

  const cardsHTML = species.map((s, index) => `
    <div class="species-card" data-index="${index}">
      <div class="species-card-header" onclick="toggleCard(${index})">
        <h3>${s.scientific_name || ''} <span style="font-weight: normal; color: var(--muted-olive);">(${s.common_name || ''})</span></h3>
        <span class="expand-icon">▼</span>
      </div>
      <div class="species-card-body">
        <p><strong>Geographic Region:</strong> ${s.geographic_region || ''}</p>
        <p><strong>Elevation Range:</strong> ${s.elevation_range || ''}</p>
        <p><strong>Mezcal Use:</strong> ${s.mezcal_use || ''}</p>
        <p><strong>Conservation Status:</strong> ${s.conservation_status || ''}</p>
        <p><strong>Management Category:</strong> ${s.management_category?.replace(/_/g, ' ') || ''}</p>
        <p><strong>Suit:</strong> ${s.suit?.replace(/_/g, ' ') || ''}</p>
        ${s.rank ? `<p><strong>Rank:</strong> ${s.rank}</p>` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = cardsHTML;
  container.classList.remove('hidden');
}

function updateDisplay() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    renderCards(filteredData);
    document.getElementById('species-table-container')?.classList.add('hidden');
  } else {
    renderTable(filteredData);
    document.getElementById('species-cards-container')?.classList.add('hidden');
  }

  const noResults = document.getElementById('no-results');
  if (filteredData.length === 0) {
    noResults?.classList.remove('hidden');
  } else {
    noResults?.classList.add('hidden');
  }

  const countElement = document.getElementById('results-count');
  if (countElement) {
    countElement.textContent = filteredData.length.toString();
  }
}

// Global function for card toggle (used in inline onclick)
(window as any).toggleCard = function(index: number) {
  const card = document.querySelector(`[data-index="${index}"]`) as HTMLElement;
  if (card) {
    card.classList.toggle('expanded');
  }
};

function initResourcesFilter() {
  const searchInput = document.getElementById('species-search') as HTMLInputElement;
  const managementFilter = document.getElementById('management-filter') as HTMLSelectElement;
  const suitFilter = document.getElementById('suit-filter') as HTMLSelectElement;
  const loadingElement = document.getElementById('species-loading');

  function applyFilters() {
    const searchTerm = searchInput?.value || '';
    const managementValue = managementFilter?.value || '';
    const suitValue = suitFilter?.value || '';

    filteredData = filterSpecies(searchTerm, managementValue, suitValue);
    updateDisplay();
  }

  // Load data
  loadSpeciesData().then((data) => {
    speciesData = data;
    filteredData = data;
    
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }
    
    updateDisplay();

    // Attach event listeners
    searchInput?.addEventListener('input', applyFilters);
    managementFilter?.addEventListener('change', applyFilters);
    suitFilter?.addEventListener('change', applyFilters);

    // Handle window resize for mobile/desktop toggle
    let resizeTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDisplay, 250);
    });
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResourcesFilter);
  } else {
    initResourcesFilter();
  }
}
