import { navigateTo } from '../../js/router.js';

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
    const form = document.getElementById('sellerProfileForm');
    const message = document.getElementById('sellerProfileMessage');
    const stage = document.getElementById('sellerProfileStage');
    const completionText = document.getElementById('sellerCompletionText');
    const completionBar = document.getElementById('sellerCompletionBar');

    if (!form) return;

    const fields = [
      'sellerName', 'sellerDisplayName', 'sellerAccountType', 'sellerVerified',
      'sellerResponseWindow', 'sellerEmail', 'sellerPhone', 'sellerWhatsapp',
      'sellerProvince', 'sellerCity', 'sellerContactChannel', 'sellerBusinessHours',
      'sellerAttentionDays', 'sellerSpecialty', 'sellerYearsRange', 'sellerBrands',
      'sellerTargetClient', 'sellerPriceRange', 'sellerAiTone', 'sellerPresentation',
      'sellerFaq'
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
      const accountType = document.getElementById('sellerAccountType');
      const channel = document.getElementById('sellerContactChannel');
      const province = document.getElementById('sellerProvince');
      const aiReplies = document.getElementById('sellerAiReplies');

      const accountLabels = {
        'particular': 'Particular',
        'agencia': 'Agencia',
        'intermediario': 'Intermediario'
      };

      const channelLabels = {
        'chat': 'Chat',
        'whatsapp': 'WhatsApp',
        'llamada': 'Llamada',
        'email': 'Email'
      };

      document.getElementById('sellerAccountLabel').textContent = 
        accountType?.value ? (accountLabels[accountType.value] || accountType.value) : 'Particular';
      document.getElementById('sellerChannelLabel').textContent = 
        channel?.value ? (channelLabels[channel.value] || channel.value) : 'Sin definir';
      document.getElementById('sellerLocationLabel').textContent = 
        province?.value ? province.value : 'Sin definir';
      document.getElementById('sellerAiLabel').textContent = 
        aiReplies?.checked ? 'Si' : 'No';
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

    const aiReplies = document.getElementById('sellerAiReplies');
    if (aiReplies) {
      aiReplies.addEventListener('change', updateLabels);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (message) {
        message.textContent = 'Perfil guardado exitosamente!';
        message.classList.remove('error');
        message.classList.add('success');
      }
      setTimeout(() => navigateTo('menu-seller'), 1000);
    });

    updateProgress();
  }
};
