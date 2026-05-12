import { navigateTo } from '../../../js/router.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { unwrapApiData } from '../../../js/publicationMapper.js';

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.value = value;
}

function appendPasswordFields(form) {
  if (document.getElementById('sellerCurrentPassword')) return;
  form.insertAdjacentHTML('beforeend', `
    <article class="seller-form-card form-card">
      <div class="seller-section-head section-head">
        <span class="seller-section-step section-step">Seguridad</span>
        <div><h2>Cambiar contraseña</h2></div>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label for="sellerCurrentPassword" class="form-label">Contraseña actual</label>
          <input id="sellerCurrentPassword" type="password" class="form-control form-control-lg" autocomplete="current-password" />
        </div>
        <div class="col-md-6">
          <label for="sellerNewPassword" class="form-label">Nueva contraseña</label>
          <input id="sellerNewPassword" type="password" class="form-control form-control-lg" autocomplete="new-password" />
        </div>
      </div>
    </article>
  `);
}

export default {
  async init() {
    this.auth = useAuth();
    this.setupNavigation();
    await this.setupForm();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  },

  async setupForm() {
    const form = document.getElementById('sellerProfileForm');
    const message = document.getElementById('sellerProfileMessage');
    if (!form) return;
    appendPasswordFields(form);

    try {
      const profile = unwrapApiData(await this.auth.me(), 'user');
      setValue('sellerName', profile?.fullName || profile?.name);
      setValue('sellerPhone', profile?.phone);
      setValue('sellerAddress', [profile?.city, profile?.province].filter(Boolean).join(', '));
    } catch (err) {
      if (message) message.textContent = err.message || 'No se pudo cargar el perfil';
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (message) message.textContent = 'Guardando...';

      try {
        const currentPassword = document.getElementById('sellerCurrentPassword')?.value;
        const newPassword = document.getElementById('sellerNewPassword')?.value;
        if (currentPassword || newPassword) {
          if (!currentPassword || !newPassword) throw new Error('Completa ambas contraseñas');
          await this.auth.changePassword(currentPassword, newPassword);
        }
        if (message) message.textContent = 'Perfil guardado correctamente';
      } catch (err) {
        if (message) message.textContent = err.message || 'No se pudo guardar el perfil';
      }
    });
  }
};
