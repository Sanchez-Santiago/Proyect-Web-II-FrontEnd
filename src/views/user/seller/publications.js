(function () {
  document.querySelectorAll('[data-navigate]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var view = el.getAttribute('data-navigate');
      window.location.hash = view;
    });
  });

  var cards = document.querySelectorAll('.pub-card');
  var totalEl = document.getElementById('pubTotal');
  var activeEl = document.getElementById('pubActive');
  var reviewEl = document.getElementById('pubReview');

  if (totalEl) totalEl.textContent = cards.length;
  if (activeEl) activeEl.textContent = document.querySelectorAll('.pub-status.is-active').length;
  if (reviewEl) reviewEl.textContent = document.querySelectorAll('.pub-status.is-review').length;
})();
