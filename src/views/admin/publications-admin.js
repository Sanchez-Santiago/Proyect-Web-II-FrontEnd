import { usePublications } from '../../hooks/usePublications.js';
import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';
import { formatPrice } from '../../utils/formatters.js';

function getScoreBadgeClass(score) {
  if (!score && score !== 0) return '';
  if (score >= 90) return 'text-green';
  if (score >= 70) return 'text-orange';
  return 'text-red';
}

export default {
  async init() {
    const tbody = document.querySelector('.menu-admin-table tbody');
    const chip = document.querySelector('.menu-admin-chip');

    if (!tbody) return;

    try {
      const publications = usePublications();
      const response = await publications.getAll({ status: 'PENDING' });
      const pendingList = response.publications || [];

      if (chip) chip.textContent = `${pendingList.length} Pendientes`;

      if (pendingList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;">No hay publicaciones pendientes de revisión.</td></tr>`;
        return;
      }

      tbody.innerHTML = pendingList.map(pub => {
        const vehicle = pub.vehicle || {};
        const seller = pub.seller || {};
        const title = pub.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehículo';
        const aiScore = vehicle.analytics?.confidenceScore || vehicle.analytics?.overallScore;

        return `
          <tr>
            <td><strong>${title}</strong><br><small>${formatPrice(pub.price, pub.currency)}</small></td>
            <td>${seller.fullName || 'Desconocido'}</td>
            <td><strong class="${getScoreBadgeClass(aiScore)}">${aiScore ? Math.round(aiScore) + '%' : 'N/A'}</strong></td>
            <td>
              <button class="menu-admin-primary-btn" data-action="approve" data-id="${pub.id}">Aprobar</button>
              <button class="menu-admin-ghost-btn" data-action="reject" data-id="${pub.id}">Rechazar</button>
            </td>
          </tr>
        `;
      }).join('');

      this.setupActions(tbody, publications);
    } catch (err) {
      console.warn('Error cargando publicaciones:', err.message);
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--error,red);">Error al cargar publicaciones.</td></tr>`;
    }
  },

  setupActions(tbody, publications) {
    tbody.querySelectorAll('[data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Aprobando...';
        try {
          await publications.updateStatus(id, 'ACTIVE');
          btn.textContent = '✓ Aprobado';
          btn.style.background = 'var(--success, #22c55e)';
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Aprobar';
          console.error('Error approving:', err.message);
        }
      });
    });

    tbody.querySelectorAll('[data-action="reject"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Rechazando...';
        try {
          await publications.updateStatus(id, 'CANCELLED');
          btn.textContent = '✗ Rechazado';
          btn.style.background = 'var(--error, #ef4444)';
          btn.style.color = 'white';
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Rechazar';
          console.error('Error rejecting:', err.message);
        }
      });
    });
  }
};
