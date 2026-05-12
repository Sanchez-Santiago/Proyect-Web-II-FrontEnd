import { navigateTo } from '../../../js/router.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { useUserPreferences } from '../../../hooks/useUserPreferences.js';
import { unwrapApiData } from '../../../js/publicationMapper.js';

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.value = value;
}

function ensureMessage(form, id) {
  let message = document.getElementById(id);
  if (!message) {
    message = document.createElement('small');
    message.id = id;
    message.className = 'form-message';
    form.appendChild(message);
  }
  return message;
}

function appendBuyerPreferences(form) {
  if (document.getElementById('buyerPreferredBrand')) return;

  form.insertAdjacentHTML('beforeend', `
    <article class="buyer-form-card form-card">
      <div class="buyer-section-head section-head">
        <span class="buyer-section-step section-step">Preferencias</span>
        <div><h2>Busqueda guardada del comprador</h2></div>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label for="buyerPreferredBrand" class="form-label">Marca preferida</label>
          <input id="buyerPreferredBrand" type="text" class="form-control form-control-lg" />
        </div>
        <div class="col-md-6">
          <label for="buyerPreferredModel" class="form-label">Modelo preferido</label>
          <input id="buyerPreferredModel" type="text" class="form-control form-control-lg" />
        </div>
        <div class="col-md-6">
          <label for="buyerMinimumBudget" class="form-label">Presupuesto minimo</label>
          <input id="buyerMinimumBudget" type="number" min="0" class="form-control form-control-lg" />
        </div>
        <div class="col-md-6">
          <label for="buyerMaximumBudget" class="form-label">Presupuesto maximo</label>
          <input id="buyerMaximumBudget" type="number" min="0" class="form-control form-control-lg" />
        </div>
        <div class="col-md-6">
          <label for="buyerMinimumYear" class="form-label">Año minimo</label>
          <input id="buyerMinimumYear" type="number" min="1900" class="form-control form-control-lg" />
        </div>
        <div class="col-md-6">
          <label for="buyerMaximumYear" class="form-label">Año maximo</label>
          <input id="buyerMaximumYear" type="number" min="1900" class="form-control form-control-lg" />
        </div>
      </div>
    </article>
    <article class="buyer-form-card form-card">
      <div class="buyer-section-head section-head">
        <span class="buyer-section-step section-step">Seguridad</span>
        <div><h2>Cambiar contraseña</h2></div>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label for="buyerCurrentPassword" class="form-label">Contraseña actual</label>
          <input id="buyerCurrentPassword" type="password" class="form-control form-control-lg" autocomplete="current-password" />
        </div>
        <div class="col-md-6">
          <label for="buyerNewPassword" class="form-label">Nueva contraseña</label>
          <input id="buyerNewPassword" type="password" class="form-control form-control-lg" autocomplete="new-password" />
        </div>
      </div>
    </article>
  `);
}

export default {
  async init() {
    this.auth = useAuth();
    this.preferences = useUserPreferences();
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
    const form = document.getElementById('buyerProfileForm');
    if (!form) return;
    appendBuyerPreferences(form);
    const message = ensureMessage(form, 'buyerProfileMessage');

    try {
      const profile = unwrapApiData(await this.auth.me(), 'user');
      setValue('buyerName', profile?.fullName || profile?.name);
      setValue('buyerEmail', profile?.email);

      const pref = unwrapApiData(await this.preferences.get(), 'preference');
      setValue('buyerPreferredBrand', pref?.preferredBrand);
      setValue('buyerPreferredModel', pref?.preferredModel);
      setValue('buyerMinimumBudget', pref?.minimumBudget);
      setValue('buyerMaximumBudget', pref?.maximumBudget);
      setValue('buyerMinimumYear', pref?.minimumYear);
      setValue('buyerMaximumYear', pref?.maximumYear);
    } catch (err) {
      message.textContent = err.message || 'No se pudo cargar el perfil';
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      message.textContent = 'Guardando...';

      const preference = {
        preferredBrand: document.getElementById('buyerPreferredBrand')?.value || undefined,
        preferredModel: document.getElementById('buyerPreferredModel')?.value || undefined,
        minimumBudget: Number(document.getElementById('buyerMinimumBudget')?.value) || undefined,
        maximumBudget: Number(document.getElementById('buyerMaximumBudget')?.value) || undefined,
        minimumYear: Number(document.getElementById('buyerMinimumYear')?.value) || undefined,
        maximumYear: Number(document.getElementById('buyerMaximumYear')?.value) || undefined
      };

      try {
        await this.preferences.update(preference);
        const currentPassword = document.getElementById('buyerCurrentPassword')?.value;
        const newPassword = document.getElementById('buyerNewPassword')?.value;
        if (currentPassword || newPassword) {
          if (!currentPassword || !newPassword) throw new Error('Completa ambas contraseñas');
          await this.auth.changePassword(currentPassword, newPassword);
        }
        message.textContent = 'Perfil guardado correctamente';
      } catch (err) {
        message.textContent = err.message || 'No se pudo guardar el perfil';
      }
    });
  }
};
