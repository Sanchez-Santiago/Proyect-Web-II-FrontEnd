(function () {
  const form = document.getElementById('buyerSearchForm');
  const message = document.getElementById('buyerSearchMessage');
  const runSearchButton = document.getElementById('runBuyerSearch');
  const filterPills = document.querySelectorAll('.search-buyer-filter-pill');
  const saveButtons = document.querySelectorAll('[data-save-btn]');

  if (!form || !message) {
    return;
  }

  const fields = {
    prompt: document.getElementById('buyerSearchPrompt'),
    vehicle: document.getElementById('buyerSearchVehicleType'),
    budget: document.getElementById('buyerSearchBudget'),
    province: document.getElementById('buyerSearchProvince'),
    years: document.getElementById('buyerSearchYears'),
    mileage: document.getElementById('buyerSearchMileage'),
    brand: document.getElementById('buyerSearchBrand'),
    fuel: document.getElementById('buyerSearchFuel'),
    transmission: document.getElementById('buyerSearchTransmission'),
    priority: document.getElementById('buyerSearchPriority'),
    sort: document.getElementById('buyerSearchSort'),
    status: document.getElementById('buyerSearchStatus'),
    financing: document.getElementById('buyerSearchFinancing'),
    tradeIn: document.getElementById('buyerSearchTradeIn'),
    inspection: document.getElementById('buyerSearchInspection'),
    alerts: document.getElementById('buyerSearchAlerts'),
  };

  const summary = {
    filtersCount: document.getElementById('buyerSearchFiltersCount'),
    resultsCount: document.getElementById('buyerSearchResultsCount'),
    vehicleLabel: document.getElementById('buyerSearchVehicleLabel'),
    zoneLabel: document.getElementById('buyerSearchZoneLabel'),
    sortLabel: document.getElementById('buyerSearchSortLabel'),
    stage: document.getElementById('buyerSearchStage'),
    insight: document.getElementById('buyerSearchInsight'),
    sidebarCount: document.getElementById('searchSidebarCount'),
    sidebarMessage: document.getElementById('searchSidebarMessage'),
  };

  function getSelectText(field, fallback) {
    if (!field || !field.value) {
      return fallback;
    }

    return field.options[field.selectedIndex].text;
  }

  function setMessage(text, type) {
    message.textContent = text;
    message.classList.remove('success');
    if (type) {
      message.classList.add(type);
    }
  }

  function countActiveFilters() {
    let count = 0;

    Object.keys(fields).forEach(function (key) {
      const field = fields[key];

      if (!field) {
        return;
      }

      if (field.type === 'checkbox') {
        if (field.checked) {
          count += 1;
        }
        return;
      }

      if (field.value.trim() !== '') {
        count += 1;
      }
    });

    return count;
  }

  function estimateResults(activeFilters) {
    const base = 42;
    const penalty = activeFilters * 3;
    return Math.max(7, base - penalty);
  }

  function buildInsight(activeFilters) {
    const vehicleText = getSelectText(fields.vehicle, 'varios segmentos');
    const priorityText = getSelectText(fields.priority, 'balanceado');
    const statusText = getSelectText(fields.status, 'sin restriccion extra');
    const zoneText = fields.province.value.trim() || 'busqueda abierta';

    return 'La IA esta priorizando ' + vehicleText.toLowerCase() + ' con enfoque ' +
      priorityText.toLowerCase() + ', en ' + zoneText.toLowerCase() + ' y con estado ' +
      statusText.toLowerCase() + '. Filtros activos: ' + activeFilters + '.';
  }

  function updateSummary() {
    const activeFilters = countActiveFilters();
    const results = estimateResults(activeFilters);

    if (summary.filtersCount) {
      summary.filtersCount.textContent = String(activeFilters);
    }

    if (summary.resultsCount) {
      summary.resultsCount.textContent = String(results);
    }

    if (summary.sidebarCount) {
      summary.sidebarCount.textContent = results + ' resultados';
    }

    if (summary.vehicleLabel) {
      summary.vehicleLabel.textContent = getSelectText(fields.vehicle, 'Indistinto');
    }

    if (summary.zoneLabel) {
      summary.zoneLabel.textContent = fields.province.value.trim() || 'Todo el pais';
    }

    if (summary.sortLabel) {
      summary.sortLabel.textContent = getSelectText(fields.sort, 'Mejor match IA');
    }

    if (summary.stage) {
      if (activeFilters >= 9) {
        summary.stage.textContent = 'Busqueda muy afinada';
      } else if (activeFilters >= 5) {
        summary.stage.textContent = 'Busqueda precisa';
      } else {
        summary.stage.textContent = 'Busqueda balanceada';
      }
    }

    if (summary.insight) {
      summary.insight.textContent = buildInsight(activeFilters);
    }

    if (summary.sidebarMessage) {
      summary.sidebarMessage.textContent = buildInsight(activeFilters);
    }
  }

  filterPills.forEach(function (button) {
    button.addEventListener('click', function () {
      const target = document.getElementById(button.dataset.target);

      if (!target) {
        return;
      }

      target.value = button.dataset.value || '';
      updateSummary();
      setMessage('Filtro rapido aplicado. Revisa el resumen y actualiza resultados.', 'success');
    });
  });

  saveButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const saved = button.classList.toggle('is-saved');
      button.innerHTML = saved ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';
    });
  });

  form.addEventListener('input', updateSummary);
  form.addEventListener('change', updateSummary);

  form.addEventListener('reset', function () {
    window.setTimeout(function () {
      updateSummary();
      setMessage('Filtros reiniciados. Vuelves a una busqueda amplia y balanceada.');
    }, 0);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    updateSummary();
    setMessage('Resultados actualizados. La IA reordeno la lista segun tus filtros y prioridades.', 'success');
  });

  if (runSearchButton) {
    runSearchButton.addEventListener('click', function () {
      updateSummary();
      setMessage('Busqueda ejecutada desde el panel superior. Puedes seguir afinando filtros abajo.', 'success');
    });
  }

  updateSummary();
})();
