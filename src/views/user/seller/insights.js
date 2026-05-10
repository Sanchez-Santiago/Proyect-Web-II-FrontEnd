(function () {
  document.querySelectorAll('[data-navigate]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.hash = el.getAttribute('data-navigate');
    });
  });
})();
