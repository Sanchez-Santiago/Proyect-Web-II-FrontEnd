(function () {
  const form = document.getElementById('assistantBuyerForm');
  const input = document.getElementById('assistantBuyerInput');
  const messages = document.getElementById('assistantBuyerMessages');
  const counter = document.getElementById('assistantBuyerCounter');
  const status = document.getElementById('assistantBuyerStatus');
  const hint = document.getElementById('assistantBuyerHint');
  const summaryTitle = document.getElementById('assistantBuyerSummaryTitle');
  const summaryText = document.getElementById('assistantBuyerSummaryText');
  const promptButtons = document.querySelectorAll('[data-prompt]');

  if (!form || !input || !messages) {
    return;
  }

  let messageCount = messages.children.length;

  function updateCounter() {
    if (counter) {
      counter.textContent = messageCount + ' mensajes generados';
    }
  }

  function addMessage(text, type) {
    const bubble = document.createElement('div');
    bubble.className = 'assistant-buyer-message ' + (type === 'user' ? 'is-user' : 'is-ai');
    bubble.textContent = text;
    messages.appendChild(bubble);
    messageCount += 1;
    updateCounter();
  }

  function getAiReply(text) {
    const lower = text.toLowerCase();

    if (lower.includes('compar')) {
      if (summaryTitle) summaryTitle.textContent = 'Comparacion sugerida';
      if (summaryText) summaryText.textContent = 'Corolla arriba en equilibrio general. Civic fuerte en confort. Polo fuerte en costo.';
      return 'Comparando candidatos: Corolla lidera por equilibrio y reventa, Civic por confort, y Polo por costo mensual.';
    }

    if (lower.includes('mensaje') || lower.includes('contact')) {
      if (summaryTitle) summaryTitle.textContent = 'Accion sugerida';
      if (summaryText) summaryText.textContent = 'Conviene pedir historial, servicios y disponibilidad para inspeccion.';
      return 'Mensaje sugerido: Hola, me interesa la unidad. Quisiera confirmar historial de mantenimiento, titularidad y disponibilidad para revisarla esta semana.';
    }

    if (lower.includes('riesgo')) {
      return 'El mayor riesgo relativo hoy esta en autos con historial menos claro o depreciacion mas fuerte. En tu shortlist, el Cruze queda un poco por debajo por ese motivo.';
    }

    return 'Con tu contexto actual, la mejor decision sigue siendo priorizar bajo riesgo, costo real y posibilidad de inspeccion antes de cerrar.';
  }

  promptButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      input.value = button.dataset.prompt || '';
      input.focus();
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = input.value.trim();

    if (!value) {
      return;
    }

    addMessage(value, 'user');
    addMessage(getAiReply(value), 'ai');

    if (status) {
      status.textContent = 'Analizando contexto';
    }

    if (hint) {
      hint.textContent = 'La IA ya incorporo tu ultima consulta al hilo activo.';
    }

    input.value = '';
  });

  updateCounter();
})();
