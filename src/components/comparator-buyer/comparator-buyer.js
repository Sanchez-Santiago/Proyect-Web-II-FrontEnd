(function () {
  const focus = document.getElementById('comparatorFocus');
  const title = document.getElementById('comparatorVerdictTitle');
  const text = document.getElementById('comparatorVerdictText');

  if (!focus || !title || !text) {
    return;
  }

  const verdicts = {
    equilibrio: {
      title: 'Corolla lidera por equilibrio general',
      text: 'Es la opcion mas solida si quieres minimizar arrepentimiento y mantener buena reventa.'
    },
    costo: {
      title: 'Polo queda mejor parado por gasto mensual',
      text: 'Si el foco se mueve a costo real y uso urbano, el Polo gana traccion frente a los otros.'
    },
    riesgo: {
      title: 'Corolla y Civic quedan mas limpios en riesgo',
      text: 'Ambos sostienen mejor perfil de confiabilidad y menor necesidad de validar escenarios adversos.'
    },
    reventa: {
      title: 'Corolla sostiene la mejor salida futura',
      text: 'Su posicion de reventa sigue siendo la mas defendible para una ventana de 24 a 36 meses.'
    }
  };

  focus.addEventListener('change', function () {
    const value = verdicts[focus.value];
    if (!value) return;
    title.textContent = value.title;
    text.textContent = value.text;
  });
})();
