const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80';

const fuelLabels = {
  GASOLINE: 'Nafta',
  DIESEL: 'Diesel',
  ELECTRIC: 'Electrico',
  HYBRID: 'Hibrido',
  LPG: 'GLP',
  CNG: 'GNC',
  OTHER: 'Otro'
};

const transmissionLabels = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automatica',
  SEMI_AUTOMATIC: 'Semi automatica',
  CVT: 'CVT',
  OTHER: 'Otra'
};

export function unwrapApiData(response, key) {
  const data = response?.data ?? response;
  return key ? data?.[key] : data;
}

export function formatCurrency(value, currency = 'USD') {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('es-AR').format(Number(value || 0));
}

export function normalizePublication(publication) {
  const vehicle = publication?.vehicle || {};
  const images = Array.isArray(vehicle.images) ? vehicle.images.map(img => img.imageUrl).filter(Boolean) : [];
  const analytics = vehicle.analytics || {};
  const score = Number(analytics.overallScore || analytics.confidenceScore || 85);
  const location = [publication?.city, publication?.province].filter(Boolean).join(', ') || 'Sin ubicacion';

  return {
    id: publication?.id,
    vehicleId: publication?.vehicleId || vehicle.id,
    sellerId: publication?.sellerId,
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    title: publication?.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim(),
    description: publication?.description || '',
    price: Number(publication?.price || 0),
    priceFormatted: formatCurrency(publication?.price, publication?.currency || 'USD'),
    currency: publication?.currency || 'USD',
    mileage: Number(vehicle.mileage || 0),
    mileageFormatted: `${formatNumber(vehicle.mileage)} km`,
    transmission: transmissionLabels[vehicle.transmission] || vehicle.transmission || 'Sin dato',
    fuel: fuelLabels[vehicle.fuelType] || vehicle.fuelType || 'Sin dato',
    color: vehicle.color,
    location,
    status: publication?.status || 'ACTIVE',
    image: images[0] || FALLBACK_IMAGE,
    images: images.length ? images : [FALLBACK_IMAGE],
    score: Math.round(score),
    condition: score >= 85 ? 'Excelente' : score >= 70 ? 'Bueno' : 'A revisar',
    paintCondition: Number(analytics.paintCondition || 4),
    motorCondition: Number(analytics.engineCondition || 4),
    interiorCondition: Number(analytics.interiorCondition || 4),
    tiresCondition: Number(analytics.tiresCondition || 4),
    seller: {
      name: publication?.seller?.fullName || publication?.seller?.name || 'Vendedor',
      type: 'particular',
      verified: Boolean(publication?.seller?.verified)
    },
    raw: publication
  };
}

export function getPublicationArray(response) {
  return unwrapApiData(response, 'publications') || [];
}
