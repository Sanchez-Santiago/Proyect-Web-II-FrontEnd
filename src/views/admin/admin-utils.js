import { navigateTo } from '../../js/router.js';
import { useAdmin } from '../../hooks/useAdmin.js';
import { unwrapApiData } from '../../js/publicationMapper.js';

export function bindAdminNavigation() {
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.getAttribute('data-navigate'));
    });
  });
}

export async function loadAdminSummary() {
  const response = await useAdmin().getSummary();
  return unwrapApiData(response, 'summary');
}

export async function loadAdminTimeline(days = 30) {
  const response = await useAdmin().getTimeline(days);
  return unwrapApiData(response, 'timeline');
}

export function formatAdminCurrency(value, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}
