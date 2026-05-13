export function formatPrice(price, currency) {
  if (!price && price !== 0) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    maximumFractionDigits: 0
  }).format(price);
}

export function formatMileage(mileage) {
  if (!mileage && mileage !== 0) return '—';
  return Number(mileage).toLocaleString('es-AR') + ' km';
}

export function translateEnum(value, type) {
  const maps = {
    transmission: { AUTOMATIC: 'Automática', MANUAL: 'Manual', SEMI_AUTOMATIC: 'Semi-Automática', CVT: 'CVT', OTHER: 'Otro' },
    fuel: { GASOLINE: 'Nafta', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico', HYBRID: 'Híbrido', LPG: 'GNC', CNG: 'GNC', OTHER: 'Otro' },
    condition: { ACTIVE: 'Activo', PENDING: 'Pendiente', SOLD: 'Vendido', CANCELLED: 'Cancelado', EXPIRED: 'Expirado' }
  };
  return maps[type]?.[value] || value || '—';
}

export function renderConditionBar(label, value, max = 5) {
  const percentage = Math.min((value / max) * 100, 100);
  const color = percentage >= 80 ? 'var(--success, #22c55e)' : percentage >= 60 ? 'var(--warning, #eab308)' : 'var(--error, #ef4444)';
  return `
    <div class="condition-bar">
      <span class="condition-label">${label}</span>
      <div class="condition-bar-track">
        <div class="condition-bar-fill" style="width:${percentage}%;background:${color};"></div>
      </div>
      <span class="condition-value" style="color:${color};">${percentage}%</span>
    </div>
  `;
}

export function getConditionLabel(score) {
  if (score >= 80) return { label: 'Excelente', cls: 'is-excellent' };
  if (score >= 60) return { label: 'Bueno', cls: 'is-good' };
  if (score >= 40) return { label: 'Regular', cls: 'is-regular' };
  return { label: 'Requiere reparación', cls: 'is-poor' };
}

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 60000) return 'ahora';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
  return Math.floor(diff / 86400000) + 'd';
}
