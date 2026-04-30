(function () {
  var cards = document.querySelectorAll('[data-favorite-card]');
  var removeButtons = document.querySelectorAll('[data-remove-btn]');
  var countEl = document.getElementById('favoritesCount');
  var insightEl = document.getElementById('favoritesInsight');

  function updateSummary() {
    var active = Array.from(cards).filter(function (card) {
      return !card.classList.contains('is-removed');
    }).length;

    if (countEl) countEl.textContent = active + ' unidades';
    if (insightEl) {
      insightEl.textContent = active >= 3
        ? 'Sigues teniendo una shortlist útil para comparar con criterio.'
        : 'La lista se acortó. Conviene volver a buscar o subir nuevos candidatos.';
    }
  }

  removeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('[data-favorite-card]');
      if (!card) return;
      card.classList.toggle('is-removed');
      button.textContent = card.classList.contains('is-removed') ? 'Restaurar' : 'Quitar';
      updateSummary();
    });
  });

  document.querySelectorAll('[data-navigate]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.hash = el.getAttribute('data-navigate');
    });
  });

  updateSummary();
})();
