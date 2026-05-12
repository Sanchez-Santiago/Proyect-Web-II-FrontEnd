import { useAdmin } from '../../hooks/useAdmin.js';
import { bindAdminNavigation } from './admin-utils.js';
import { unwrapApiData } from '../../js/publicationMapper.js';

export default {
  async init() {
    this.admin = useAdmin();
    bindAdminNavigation();
    await this.loadUsers();
  },

  async loadUsers() {
    const tbody = document.querySelector('.menu-admin-table tbody');
    const note = document.querySelector('.menu-admin-sidebar-note strong');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Cargando usuarios...</td></tr>';

    try {
      const response = await this.admin.getUsers();
      const users = unwrapApiData(response, 'users') || [];
      if (note) note.textContent = `${users.length} usuarios`;

      if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="4">No hay usuarios cargados.</td></tr>';
        return;
      }

      tbody.innerHTML = users.map(user => `
        <tr data-user-id="${user.id}">
          <td><strong>${user.fullName || user.name || 'Sin nombre'}</strong><br><small>${user.email}</small></td>
          <td>
            <select class="form-select form-select-sm" data-role="${user.id}">
              ${['BUYER', 'SELLER', 'ADMIN'].map(role => `<option value="${role}" ${user.role === role ? 'selected' : ''}>${role}</option>`).join('')}
            </select>
          </td>
          <td><span class="menu-admin-badge ${user.verified ? 'is-active' : 'is-pending'}">${user.verified ? 'Verificado' : 'Pendiente'}</span></td>
          <td>
            <button class="menu-admin-primary-btn" data-verify="${user.id}">${user.verified ? 'Quitar verif.' : 'Verificar'}</button>
            <button class="menu-admin-ghost-btn" data-delete="${user.id}">Eliminar</button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('[data-role]').forEach(select => {
        select.addEventListener('change', async () => {
          try {
            await this.admin.updateRole(select.dataset.role, select.value);
          } catch (err) {
            alert(err.message || 'No se pudo actualizar rol');
          }
        });
      });

      tbody.querySelectorAll('[data-verify]').forEach(button => {
        button.addEventListener('click', async () => {
          const row = button.closest('[data-user-id]');
          const isVerified = row?.querySelector('.menu-admin-badge')?.textContent === 'Verificado';
          try {
            await this.admin.verifyUser(button.dataset.verify, !isVerified);
            await this.loadUsers();
          } catch (err) {
            alert(err.message || 'No se pudo actualizar verificación');
          }
        });
      });

      tbody.querySelectorAll('[data-delete]').forEach(button => {
        button.addEventListener('click', async () => {
          if (!confirm('Eliminar este usuario?')) return;
          try {
            await this.admin.deleteUser(button.dataset.delete);
            await this.loadUsers();
          } catch (err) {
            alert(err.message || 'No se pudo eliminar usuario');
          }
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4">No se pudieron cargar usuarios: ${err.message}</td></tr>`;
    }
  }
};
