(function () {
  const form = document.getElementById('simulatorBuyerForm');
  const total = document.getElementById('simulatorTotal');
  const installment = document.getElementById('simInstallment');
  const insurance = document.getElementById('simInsuranceValue');
  const fuel = document.getElementById('simFuelValue');
  const maintenance = document.getElementById('simMaintenanceValue');
  const insight = document.getElementById('simulatorInsight');

  if (!form) {
    return;
  }

  function formatCurrency(value) {
    return '$' + Math.round(value).toLocaleString('es-AR');
  }

  function update() {
    const vehiclePrice = Number(document.getElementById('simVehiclePrice').value) || 0;
    const downPayment = Number(document.getElementById('simDownPayment').value) || 0;
    const months = Math.max(1, Number(document.getElementById('simMonths').value) || 1);
    const rate = (Number(document.getElementById('simRate').value) || 0) / 100;
    const insuranceValue = Number(document.getElementById('simInsurance').value) || 0;
    const fuelValue = Number(document.getElementById('simFuel').value) || 0;
    const maintenanceValue = Number(document.getElementById('simMaintenance').value) || 0;

    const financed = Math.max(0, vehiclePrice - downPayment);
    const installmentValue = (financed / months) * (1 + rate);
    const totalValue = installmentValue + insuranceValue + fuelValue + maintenanceValue;

    installment.textContent = formatCurrency(installmentValue);
    insurance.textContent = formatCurrency(insuranceValue);
    fuel.textContent = formatCurrency(fuelValue);
    maintenance.textContent = formatCurrency(maintenanceValue);
    total.textContent = formatCurrency(totalValue) + ' / mes';

    if (insight) {
      insight.textContent = totalValue > 500000
        ? 'El escenario sube fuerte. Conviene comparar contra opciones con menor entrega o mejor costo total.'
        : 'El escenario sigue razonable para una compra cuidada dentro del shortlist actual.';
    }
  }

  form.addEventListener('input', update);
  update();
})();
