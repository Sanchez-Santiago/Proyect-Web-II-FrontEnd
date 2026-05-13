export const VEHICLE_BRANDS = [
  'Toyota', 'Honda', 'Volkswagen', 'Ford', 'Chevrolet', 'Peugeot',
  'Nissan', 'Renault', 'Fiat', 'Mercedes-Benz', 'BMW', 'Audi',
  'Hyundai', 'Kia', 'Citroen', 'Jeep', 'Suzuki', 'Mitsubishi',
  'Subaru', 'Mazda', 'Volvo', 'Land Rover', 'Mini', 'Otro'
];

export const VEHICLE_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'SUV', label: 'SUV' },
  { value: 'TRUCK', label: 'Pickup' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'VAN', label: 'Van' },
  { value: 'WAGON', label: 'Rural' },
  { value: 'SPORTS', label: 'Deportivo' },
  { value: 'ELECTRIC', label: 'Electrico' },
  { value: 'OTHER', label: 'Otro' }
];

export const FUEL_TYPES = [
  { value: 'GASOLINE', label: 'Nafta' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electrico' },
  { value: 'HYBRID', label: 'Hibrido' },
  { value: 'LPG', label: 'GNC' },
  { value: 'CNG', label: 'GNC' },
  { value: 'OTHER', label: 'Otro' }
];

export const TRANSMISSION_TYPES = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATIC', label: 'Automatica' },
  { value: 'CVT', label: 'CVT' },
  { value: 'SEMI_AUTOMATIC', label: 'Semi-Automatica' },
  { value: 'OTHER', label: 'Otro' }
];

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function getYearOptions() {
  const current = getCurrentYear();
  const years = [];
  for (let y = current; y >= current - 20; y--) {
    years.push(y);
  }
  return years;
}
