import { navigateTo } from '../../router.js';

export default {
  init() {
    this.setupForm();
    this.setupNavigation();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-navigate');
        navigateTo(view);
      });
    });
  },

  setupForm() {
    const form = document.getElementById('buyerProfileForm');
    const message = document.getElementById('buyerProfileMessage');
    const stage = document.getElementById('buyerProfileStage');
    const completionText = document.getElementById('buyerCompletionText');
    const completionBar = document.getElementById('buyerCompletionBar');

    if (!form) return;

    const fields = [
      'buyerName', 'buyerEmail', 'buyerPhone', 'buyerProvince', 'buyerCity',
      'buyerVehicleType', 'buyerBudget', 'buyerUsage', 'buyerContactChannel',
      'buyerPreferences', 'buyerYearsRange', 'buyerBrands', 'buyerTransmission',
      'buyerFuel', 'buyerMaxMileage', 'buyerAiPriority'
    ];

    function updateProgress() {
      const filled = fields.filter(id => {
        const el = document.getElementById(id);
        return el && el.value.trim() !== '';
      }).length;
      
      const percent = Math.round((filled / fields.length) * 100);
      completionText.textContent = percent + '%';
      completionBar.style.width = percent + '%';

      if (percent >= 80) {
        stage.textContent = 'Completo';
      } else if (percent >= 40) {
        stage.textContent = 'En progreso';
      } else {
        stage.textContent = 'Incompleto';
      }
    }

    function updateLabels() {
      const budget = document.getElementById('buyerBudget');
      const vehicleType = document.getElementById('buyerVehicleType');
      const province = document.getElementById('buyerProvince');
      const alerts = document.getElementById('buyerAlerts');

      const budgetLabels = {
        'hasta-10m': 'Hasta 10M',
        '10m-20m': '10-20M',
        '20m-35m': '20-35M',
        'mas-35m': 'Mas de 35M'
      };

      const vehicleLabels = {
        'sedan': 'Sedan',
        'suv': 'SUV',
        'pickup': 'Pickup',
        'hatchback': 'Hatchback',
        'utilitario': 'Utilitario',
        'cualquiera': 'Varias opciones'
      };

      document.getElementById('buyerBudgetLabel').textContent = 
        budget?.value ? (budgetLabels[budget.value] || budget.value) : 'Sin definir';
      document.getElementById('buyerVehicleLabel').textContent = 
        vehicleType?.value ? (vehicleLabels[vehicleType.value] || vehicleType.value) : 'Sin definir';
      document.getElementById('buyerLocationLabel').textContent = 
        province?.value ? province.value : 'Sin definir';
      document.getElementById('buyerAlertsLabel').textContent = 
        alerts?.checked ? 'Si' : 'No';
    }

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          updateProgress();
          updateLabels();
        });
        el.addEventListener('change', () => {
          updateProgress();
          updateLabels();
        });
      }
    });

    const alerts = document.getElementById('buyerAlerts');
    if (alerts) {
      alerts.addEventListener('change', updateLabels);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (message) {
        message.textContent = 'Perfil guardado exitosamente!';
        message.classList.remove('error');
        message.classList.add('success');
      }
      setTimeout(() => navigateTo('menu-buyer'), 1000);
    });

    updateProgress();
  }
};
