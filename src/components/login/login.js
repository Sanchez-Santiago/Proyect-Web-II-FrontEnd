(function () {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const message = document.getElementById('loginMessage');

  if (!form || !emailInput || !message) {
    return;
  }

  function setMessage(text, type) {
    message.textContent = text;
    message.classList.remove('error', 'success');
    if (type) {
      message.classList.add(type);
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email) {
      setMessage('Ingresa tu correo para continuar.', 'error');
      emailInput.focus();
      return;
    }

    if (!emailIsValid) {
      setMessage('El formato del email no es valido.', 'error');
      emailInput.focus();
      return;
    }

    setMessage('Email valido. Este componente ya esta listo para conectarse con tu backend.', 'success');
  });
})();
