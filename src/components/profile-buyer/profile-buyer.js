(function () {
  const form = document.getElementById('buyerProfileForm');
  const message = document.getElementById('buyerProfileMessage');
  const completionBar = document.getElementById('buyerCompletionBar');
  const completionText = document.getElementById('buyerCompletionText');
  const profileStage = document.getElementById('buyerProfileStage');
  const budgetLabel = document.getElementById('buyerBudgetLabel');
  const vehicleLabel = document.getElementById('buyerVehicleLabel');
  const locationLabel = document.getElementById('buyerLocationLabel');
  const alertsLabel = document.getElementById('buyerAlertsLabel');
  const profilePhotoInput = document.getElementById('buyerProfilePhoto');
  const avatarPreview = document.getElementById('buyerAvatarPreview');
  const defaultAvatarSrc = avatarPreview ? avatarPreview.getAttribute('src') : '';

  if (!form || !message) {
    return;
  }

  const requiredFieldIds = [
    'buyerName',
    'buyerEmail',
    'buyerPhone',
    'buyerProvince',
    'buyerCity',
    'buyerVehicleType',
    'buyerBudget',
    'buyerUsage',
    'buyerContactChannel',
    'buyerPreferences',
    'buyerYearsRange',
    'buyerBrands',
    'buyerTransmission',
    'buyerFuel',
    'buyerMaxMileage',
    'buyerAiPriority',
  ];

  function getField(id) {
    return document.getElementById(id);
  }

  function setMessage(text, type) {
    message.textContent = text;
    message.classList.remove('error', 'success');
    if (type) {
      message.classList.add(type);
    }
  }

  function isEmailValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function getCompletion() {
    const completed = requiredFieldIds.filter(function (id) {
      const field = getField(id);
      return field && field.value.trim() !== '';
    }).length;

    return Math.round((completed / requiredFieldIds.length) * 100);
  }

  function updateSummary() {
    const budget = getField('buyerBudget');
    const vehicle = getField('buyerVehicleType');
    const province = getField('buyerProvince');
    const city = getField('buyerCity');
    const alerts = getField('buyerAlerts');
    const completion = getCompletion();

    if (completionBar) {
      completionBar.style.width = completion + '%';
      completionBar.setAttribute('aria-valuenow', String(completion));
    }

    if (completionText) {
      completionText.textContent = completion + '%';
    }

    if (profileStage) {
      if (completion >= 90) {
        profileStage.textContent = 'Listo para explorar';
      } else if (completion >= 55) {
        profileStage.textContent = 'En progreso';
      } else {
        profileStage.textContent = 'Incompleto';
      }
    }

    if (budgetLabel && budget) {
      budgetLabel.textContent = budget.value
        ? budget.options[budget.selectedIndex].text
        : 'Sin definir';
    }

    if (vehicleLabel && vehicle) {
      vehicleLabel.textContent = vehicle.value
        ? vehicle.options[vehicle.selectedIndex].text
        : 'Sin definir';
    }

    if (locationLabel && province && city) {
      const provinceText = province.value.trim();
      const cityText = city.value.trim();
      locationLabel.textContent = provinceText || cityText
        ? [cityText, provinceText].filter(Boolean).join(', ')
        : 'Sin definir';
    }

    if (alertsLabel && alerts) {
      alertsLabel.textContent = alerts.checked ? 'Si' : 'No';
    }
  }

  if (profilePhotoInput && avatarPreview) {
    profilePhotoInput.addEventListener('change', function () {
      const file = profilePhotoInput.files && profilePhotoInput.files[0];

      if (!file) {
        avatarPreview.src = defaultAvatarSrc;
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMessage('Selecciona un archivo de imagen valido para la foto de perfil.', 'error');
        profilePhotoInput.value = '';
        avatarPreview.src = defaultAvatarSrc;
        return;
      }

      avatarPreview.src = URL.createObjectURL(file);
      setMessage('Foto de perfil cargada. Completa el resto del perfil para guardarlo.');
    });
  }

  form.addEventListener('input', updateSummary);
  form.addEventListener('change', updateSummary);

  form.addEventListener('reset', function () {
    window.setTimeout(function () {
      if (avatarPreview) {
        avatarPreview.src = defaultAvatarSrc;
      }
      updateSummary();
      setMessage('Completa los campos principales para guardar tu perfil comprador.');
    }, 0);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const missingRequired = requiredFieldIds.some(function (id) {
      const field = getField(id);
      return !field || field.value.trim() === '';
    });

    if (missingRequired) {
      setMessage('Completa todos los campos obligatorios de ambos bloques antes de guardar.', 'error');
      updateSummary();
      return;
    }

    const email = getField('buyerEmail').value.trim();

    if (!isEmailValid(email)) {
      setMessage('Ingresa un correo electronico valido.', 'error');
      return;
    }

    setMessage('Perfil comprador guardado. La base ya queda lista para conectar filtros, alertas e IA con tu backend.', 'success');
    updateSummary();
  });

  updateSummary();
})();
