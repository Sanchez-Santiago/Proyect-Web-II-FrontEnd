(function () {
  const cards = Array.from(document.querySelectorAll('[data-favorite-card]'));
  const removeButtons = document.querySelectorAll('[data-remove-btn]');
  const count = document.getElementById('favoritesCount');
  const insight = document.getElementById('favoritesInsight');

  if (!cards.length) {
    return;
  }

  function updateSummary() {
    const active = cards.filter(function (card) {
      return !card.classList.contains('is-removed');
    }).length;

    if (count) {
      count.textContent = active + ' unidades';
    }

    if (insight) {
      insight.textContent = active >= 3
        ? 'Sigues teniendo una shortlist util para comparar con criterio.'
        : 'La lista se acorto. Conviene volver a buscar o subir nuevos candidatos.';
    }
  }

  removeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const card = button.closest('[data-favorite-card]');
      if (!card) return;
      card.classList.toggle('is-removed');
      button.textContent = card.classList.contains('is-removed') ? 'Restaurar' : 'Quitar';
      updateSummary();
    });
  });

  updateSummary();
})();
