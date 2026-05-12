import { navigateTo } from '../../js/router.js';
import { usePublications } from '../../hooks/usePublications.js';
import { getPublicationArray, normalizePublication } from '../../js/publicationMapper.js';

export default {
  async init() {
    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(el.getAttribute('data-navigate'));
      });
    });

    const tbody = document.querySelector('.menu-admin-table tbody');
    const chip = document.querySelector('.menu-admin-chip');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4">Cargando publicaciones...</td></tr>';

    try {
      const response = await usePublications().getAll({ status: 'PENDING' });
      const publications = getPublicationArray(response);
      if (chip) chip.textContent = `${publications.length} pendientes`;

      if (!publications.length) {
        tbody.innerHTML = '<tr><td colspan="4">No hay publicaciones pendientes.</td></tr>';
        return;
      }

      tbody.innerHTML = publications.map(pub => {
        const car = normalizePublication(pub);
        return `
          <tr data-publication-id="${car.id}">
            <td><strong>${car.title}</strong><br><small>${car.priceFormatted}</small></td>
            <td>${car.seller.name}</td>
            <td><strong class="text-orange">${car.score}%</strong></td>
            <td>
              <button class="menu-admin-primary-btn" data-approve="${car.id}">Aprobar</button>
              <button class="menu-admin-ghost-btn" data-reject="${car.id}">Rechazar</button>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('[data-approve]').forEach(button => {
        button.addEventListener('click', () => this.updateStatus(button.dataset.approve, 'ACTIVE'));
      });
      tbody.querySelectorAll('[data-reject]').forEach(button => {
        button.addEventListener('click', () => this.updateStatus(button.dataset.reject, 'CANCELLED'));
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4">No se pudo cargar la cola: ${err.message}</td></tr>`;
    }
  },

  async updateStatus(id, status) {
    try {
      await usePublications().updateStatus(id, status);
      await this.init();
    } catch (err) {
      alert(err.message || 'No se pudo actualizar la publicación');
    }
  }
};
