(function () {
  const form = document.getElementById('sellerProfileForm');
  const message = document.getElementById('sellerProfileMessage');
  const completionBar = document.getElementById('sellerCompletionBar');
  const completionText = document.getElementById('sellerCompletionText');
  const profileStage = document.getElementById('sellerProfileStage');
  const accountLabel = document.getElementById('sellerAccountLabel');
  const channelLabel = document.getElementById('sellerChannelLabel');
  const locationLabel = document.getElementById('sellerLocationLabel');
  const aiLabel = document.getElementById('sellerAiLabel');
  const profilePhotoInput = document.getElementById('sellerProfilePhoto');
  const avatarPreview = document.getElementById('sellerAvatarPreview');
  const defaultAvatarSrc = avatarPreview ? avatarPreview.getAttribute('src') : '';

  if (!form || !message) {
    return;
  }

  const requiredFieldIds = [
    'sellerName',
    'sellerDisplayName',
    'sellerAccountType',
    'sellerVerified',
    'sellerResponseWindow',
    'sellerEmail',
    'sellerPhone',
    'sellerWhatsapp',
    'sellerProvince',
    'sellerCity',
    'sellerContactChannel',
    'sellerBusinessHours',
    'sellerAttentionDays',
    'sellerSpecialty',
    'sellerYearsRange',
    'sellerBrands',
    'sellerTargetClient',
    'sellerPriceRange',
    'sellerAiTone',
    'sellerPresentation',
    'sellerFaq',
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
    const accountType = getField('sellerAccountType');
    const contactChannel = getField('sellerContactChannel');
    const province = getField('sellerProvince');
    const city = getField('sellerCity');
    const aiReplies = getField('sellerAiReplies');
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
        profileStage.textContent = 'Listo para publicar';
      } else if (completion >= 55) {
        profileStage.textContent = 'En progreso';
      } else {
        profileStage.textContent = 'Incompleto';
      }
    }

    if (accountLabel && accountType) {
      accountLabel.textContent = accountType.options[accountType.selectedIndex].text;
    }

    if (channelLabel && contactChannel) {
      channelLabel.textContent = contactChannel.value
        ? contactChannel.options[contactChannel.selectedIndex].text
        : 'Sin definir';
    }

    if (locationLabel && province && city) {
      const provinceText = province.value.trim();
      const cityText = city.value.trim();
      locationLabel.textContent = provinceText || cityText
        ? [cityText, provinceText].filter(Boolean).join(', ')
        : 'Sin definir';
    }

    if (aiLabel && aiReplies) {
      aiLabel.textContent = aiReplies.checked ? 'Si' : 'No';
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
      setMessage('Completa los campos principales para dejar listo tu perfil vendedor.');
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

    const email = getField('sellerEmail').value.trim();

    if (!isEmailValid(email)) {
      setMessage('Ingresa un correo electronico valido.', 'error');
      return;
    }

    setMessage('Perfil vendedor guardado. La base ya queda lista para conectar confianza, atencion e IA con tu backend.', 'success');
    updateSummary();
  });

  updateSummary();
})();
