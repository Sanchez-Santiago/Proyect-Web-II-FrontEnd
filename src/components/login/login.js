(function () {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const message = document.getElementById('loginMessage');
  const ACCESS_ROLE_URL = '../access-role/index.html';

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

  function resolveUserRole(email) {
    const normalizedEmail = email.toLowerCase();

    if (normalizedEmail === 'admin@driveroom.com' || normalizedEmail.includes('admin')) {
      return 'admin';
    }

    return 'user';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const sessionEmail = email || 'invitado@driveroom.local';
    const role = resolveUserRole(sessionEmail);
    const sessionUser = {
      email: sessionEmail,
      role,
      isAdmin: role === 'admin',
    };

    localStorage.setItem('driveroom_session', JSON.stringify(sessionUser));

    setMessage('Acceso validado. Redirigiendo para elegir tu modo de ingreso.', 'success');

    window.setTimeout(function () {
      window.location.href = ACCESS_ROLE_URL;
    }, 600);
  });
})();
