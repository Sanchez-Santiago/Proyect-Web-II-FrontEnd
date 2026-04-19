export const CARS_DATA = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla XEi',
    year: 2021,
    price: 14500000,
    priceFormatted: '$14.500.000',
    mileage: 45000,
    mileageFormatted: '45.000 km',
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
    score: 96,
    condition: 'Excelente',
    interiorCondition: 5,
    paintCondition: 4,
    rimsCondition: 5,
    dashboardCondition: 5,
    tiresCondition: 4,
    seller: {
      name: 'Juan Pérez',
      type: 'particular',
      verified: true,
      phone: '+54 9 351 123 4567'
    }
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    price: 12500000,
    priceFormatted: '$12.500.000',
    mileage: 63000,
    mileageFormatted: '63.000 km',
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80',
    score: 92,
    condition: 'Bueno',
    interiorCondition: 4,
    paintCondition: 4,
    rimsCondition: 3,
    dashboardCondition: 4,
    tiresCondition: 4,
    seller: {
      name: 'Auto Motors',
      type: 'agencia',
      verified: true,
      phone: '+54 9 351 987 6543'
    }
  },
  {
    id: 3,
    brand: 'Volkswagen',
    model: 'Polo',
    year: 2021,
    price: 11900000,
    priceFormatted: '$11.900.000',
    mileage: 48000,
    mileageFormatted: '48.000 km',
    transmission: 'Manual',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
    score: 89,
    condition: 'Bueno',
    interiorCondition: 4,
    paintCondition: 3,
    rimsCondition: 4,
    dashboardCondition: 4,
    tiresCondition: 3,
    seller: {
      name: 'María González',
      type: 'particular',
      verified: false,
      phone: '+54 9 351 456 7890'
    }
  },
  {
    id: 4,
    brand: 'Volkswagen',
    model: 'Amarok',
    year: 2020,
    price: 24900000,
    priceFormatted: '$24.900.000',
    mileage: 72000,
    mileageFormatted: '72.000 km',
    transmission: 'Automática',
    fuel: 'Diésel',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=600&q=80',
    score: 88,
    condition: 'Regular',
    interiorCondition: 3,
    paintCondition: 3,
    rimsCondition: 4,
    dashboardCondition: 3,
    tiresCondition: 4,
    seller: {
      name: 'Camiones SA',
      type: 'agencia',
      verified: true,
      phone: '+54 9 351 111 2222'
    }
  },
  {
    id: 5,
    brand: 'Peugeot',
    model: '208',
    year: 2022,
    price: 16300000,
    priceFormatted: '$16.300.000',
    mileage: 28000,
    mileageFormatted: '28.000 km',
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    score: 91,
    condition: 'Excelente',
    interiorCondition: 5,
    paintCondition: 5,
    rimsCondition: 5,
    dashboardCondition: 5,
    tiresCondition: 5,
    seller: {
      name: 'Lucas García',
      type: 'particular',
      verified: true,
      phone: '+54 9 351 333 4444'
    }
  },
  {
    id: 6,
    brand: 'Chevrolet',
    model: 'Cruze LT',
    year: 2018,
    price: 9800000,
    priceFormatted: '$9.800.000',
    mileage: 85000,
    mileageFormatted: '85.000 km',
    transmission: 'Manual',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    score: 74,
    condition: 'Regular',
    interiorCondition: 3,
    paintCondition: 3,
    rimsCondition: 4,
    dashboardCondition: 3,
    tiresCondition: 3,
    seller: {
      name: 'Autos Córdoba',
      type: 'agencia',
      verified: true,
      phone: '+54 9 351 555 6666'
    }
  }
];

export function getCars() {
  return CARS_DATA;
}

export function getCarById(id) {
  return CARS_DATA.find(car => car.id == id);
}

export function getFeaturedCars(limit = 6) {
  return CARS_DATA.slice(0, limit);
}

export function searchCars(filters = {}) {
  let results = [...CARS_DATA];
  
  if (filters.brand) {
    results = results.filter(car => 
      car.brand.toLowerCase().includes(filters.brand.toLowerCase())
    );
  }
  
  if (filters.minPrice) {
    results = results.filter(car => car.price >= filters.minPrice);
  }
  
  if (filters.maxPrice) {
    results = results.filter(car => car.price <= filters.maxPrice);
  }
  
  if (filters.year) {
    results = results.filter(car => car.year == filters.year);
  }
  
  return results;
}

export default { CARS_DATA, getCars, getCarById, getFeaturedCars, searchCars };