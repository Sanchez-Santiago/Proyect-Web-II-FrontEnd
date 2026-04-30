(function () {
  const form = document.getElementById('advisorForm');
  const input = document.getElementById('advisorInput');
  const messages = document.getElementById('advisorMessages');
  const counter = document.getElementById('advisorCounter');
  const status = document.getElementById('advisorStatus');
  const summary = document.getElementById('advisorSummary');
  const matches = document.getElementById('advisorMatches');
  const promptButtons = document.querySelectorAll('[data-prompt]');

  if (!form || !input || !messages) return;

  let messageCount = messages.children.length;

  function updateCounter() {
    if (counter) counter.textContent = messageCount + ' mensajes';
  }

  function addMessage(text, type) {
    const bubble = document.createElement('div');
    bubble.className = 'advisor-message is-' + (type === 'user' ? 'user' : 'ai');
    bubble.textContent = text;
    messages.appendChild(bubble);
    messageCount++;
    updateCounter();
    messages.scrollTop = messages.scrollHeight;
  }

  function getAiReply(text) {
    const lower = text.toLowerCase();

    if (lower.includes('analiza') || lower.includes('favorito') || lower.includes('recomienda')) {
      if (summary) {
        summary.innerHTML =
          '<h4>Analisis de Favoritos</h4>' +
          '<p><strong>Mejor por inversion:</strong> Toyota Corolla 2021</p>' +
          '<ul>' +
          '<li>Mayor retencion de valor a 3 anos: 68%</li>' +
          '<li>Costo de mantenimiento mas bajo del segmento</li>' +
          '<li>Demanda estable en reventa</li>' +
          '</ul>' +
          '<p><strong>Segunda opcion:</strong> Honda Civic 2020</p>' +
          '<p><strong>Evitar:</strong> Chevrolet Cruze - depreciacion acelerada</p>';
      }
      if (matches) {
        matches.innerHTML =
          '<div class="match-card"><strong>Toyota Corolla 2021</strong><p>Score: 92/100 - Equilibrio ideal</p></div>' +
          '<div class="match-card"><strong>Honda Civic 2020</strong><p>Score: 85/100 - Buen confort</p></div>' +
          '<div class="match-card"><strong>VW Polo 2022</strong><p>Score: 78/100 - Costo accesible</p></div>';
      }
      return 'Analizando tus favoritos: el Corolla 2021 lidera por equilibrio entre costo, mantenimiento y retencion de valor. El Civic es solido en confort. El Cruze queda por debajo por depreciacion.';
    }

    if (lower.includes('compara') || lower.includes('costo')) {
      if (summary) {
        summary.innerHTML =
          '<h4>Comparacion de Costos</h4>' +
          '<table class="advisor-table">' +
          '<tr><th>Auto</th><th>Cuota</th><th>Total/mes</th></tr>' +
          '<tr><td>Corolla 2021</td><td>$206.000</td><td>$451.000</td></tr>' +
          '<tr><td>Civic 2020</td><td>$195.000</td><td>$438.000</td></tr>' +
          '<tr><td>Polo 2022</td><td>$178.000</td><td>$410.000</td></tr>' +
          '</table>';
      }
      return 'Comparando costos totales: el Polo tiene el menor costo mensual, pero el Corolla ofrece mejor relacion valor-inversion a largo plazo.';
    }

    if (lower.includes('oportunidad') || lower.includes('mercado')) {
      if (matches) {
        matches.innerHTML =
          '<div class="match-card is-hot"><strong>Oferta: Toyota Corolla 2021</strong><p>12% bajo precio de mercado - Score 94</p></div>' +
          '<div class="match-card"><strong>Honda Civic 2020</strong><p>Precio justo - Score 85</p></div>' +
          '<div class="match-card is-warn"><strong>Chevrolet Cruze</strong><p>Depreciacion alta - reconsiderar</p></div>';
      }
      return 'Detecto una oportunidad: un Corolla 2021 esta 12% bajo el precio promedio del mercado. Conviene actuar rapido. El Cruze tiene depreciacion alta, mejor evitarlo.';
    }

    if (lower.includes('riesgo')) {
      return 'El mayor riesgo esta en autos con historial poco claro o depreciacion fuerte. En tu lista, el Cruze es el mas riesgoso. El Corolla y Civic tienen perfiles mas seguros.';
    }

    if (lower.includes('simula') || lower.includes('financ')) {
      return 'El simulador esta listo en el panel derecho. Ajusta los valores para ver el costo real mensual incluyendo cuota, seguro, combustible y mantenimiento.';
    }

    return 'Con tu contexto actual, priorizo bajo riesgo, costo real accesible y posibilidad de inspeccion antes de cerrar. Puedes pedirme analisis de favoritos, comparacion de costos u oportunidades de mercado.';
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
    if (!value) return;

    addMessage(value, 'user');
    if (status) status.textContent = 'Analizando...';

    setTimeout(function () {
      addMessage(getAiReply(value), 'ai');
      if (status) status.textContent = 'Listo para ayudarte';
    }, 400);

    input.value = '';
  });

  updateCounter();
})();

(function () {
  const form = document.getElementById('simulatorForm');
  if (!form) return;

  function formatCurrency(value) {
    return '$' + Math.round(value).toLocaleString('es-AR');
  }

  function update() {
    var price = Number(document.getElementById('simPrice').value) || 0;
    var down = Number(document.getElementById('simDownPayment').value) || 0;
    var months = Math.max(1, Number(document.getElementById('simMonths').value) || 1);
    var rate = (Number(document.getElementById('simRate').value) || 0) / 100;
    var insurance = Number(document.getElementById('simInsurance').value) || 0;
    var fuel = Number(document.getElementById('simFuel').value) || 0;
    var maintenance = Number(document.getElementById('simMaintenance').value) || 0;

    var financed = Math.max(0, price - down);
    var installment = (financed / months) * (1 + rate);
    var total = installment + insurance + fuel + maintenance;

    var instEl = document.getElementById('simInstallment');
    var totalEl = document.getElementById('simTotal');
    var insightEl = document.getElementById('simInsight');

    if (instEl) instEl.textContent = formatCurrency(installment);
    if (totalEl) totalEl.textContent = formatCurrency(total) + '/mes';
    if (insightEl) {
      insightEl.textContent = total > 500000
        ? 'El escenario sube fuerte. Conviene comparar contra opciones con menor entrega o mejor costo total.'
        : 'Escenario razonable para una compra cuidada dentro de tu shortlist.';
    }
  }

  form.addEventListener('input', update);
  update();
})();

(function () {
  document.querySelectorAll('[data-navigate]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var view = el.getAttribute('data-navigate');
      window.location.hash = view;
    });
  });
})();
