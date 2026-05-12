/**
 * Vehicle Detail View - Página de detalle de vehículo
 * Muestra: galería de imágenes, especificaciones, estado del vehículo,
 * información del vendedor, botones de acción (contactar, comprar, favorito)
 */

import { navigateTo } from '../../js/router.js';
import state from '../../js/state.js';
import { getCars, getCarById } from '../../data/cars.js';
import { usePublications } from '../../hooks/usePublications.js';
import { useFavorites } from '../../hooks/useFavorites.js';
import { useApi } from '../../hooks/useApi.js';
import { useReports } from '../../hooks/useReports.js';
import { useVehicleViews } from '../../hooks/useVehicleViews.js';
import { useDocuments } from '../../hooks/useDocuments.js';
import { useAiAnalysis } from '../../hooks/useAiAnalysis.js';
import { normalizePublication, unwrapApiData } from '../../js/publicationMapper.js';

const isInspector = typeof window.getInspectorData === 'function';
let currentCar = null;

/**
 * Renderiza una barra de condición del vehículo (Motor, Interior, Pintura, Gomas)
 * @param {string} label - Nombre de la condición
 * @param {number} value - Valor de 1-5
 */
function renderConditionBar(label, value) {
  const percentage = (value / 5) * 100;
  const color = percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#eab308' : '#ef4444';
  return `
    <div class="car-state-bar">
      <span class="car-state-label">${label}</span>
      <div class="car-state-track">
        <div class="car-state-fill" style="width:${percentage}%;background:${color};"></div>
      </div>
      <span class="car-state-value" style="color:${color};">${percentage}%</span>
    </div>
  `;
}

function renderGallery(car) {
  const images = car.images || [car.image];
  let galleryHtml = `
    <div class="car-gallery">
      <div class="car-main-image">
        <img id="carMainImage" src="${images[0]}" alt="${car.brand} ${car.model}" />
        <div class="car-score-badge">
          <span class="car-score-value" style="color:${car.score >= 85 ? '#22c55e' : car.score >= 70 ? '#eab308' : '#ef4444'}">${car.score}%</span>
          <div class="car-score-bar">
            <div class="car-score-fill" style="width:${Math.max(car.score - 10, 20)}%;background:${car.score >= 85 ? '#22c55e' : car.score >= 70 ? '#eab308' : '#ef4444'};"></div>
          </div>
          <span class="car-score-label">Match IA</span>
        </div>
      </div>
      <div class="car-thumbnails">
  `;
  
  images.forEach((img, index) => {
    galleryHtml += `
      <button type="button" class="car-thumbnail ${index === 0 ? 'active' : ''}" onclick="window.changeCarImage('${img}', this)">
        <img src="${img}" alt="Foto ${index + 1}" />
      </button>
    `;
});
   
   galleryHtml += `
       </div>
     </div>
   `;
   
   return galleryHtml;
 }

function showPurchaseModal(car) {
  const modal = document.createElement('div');
  modal.className = 'purchase-modal-overlay';
  modal.id = 'purchaseModal';
  modal.innerHTML = `
    <div class="purchase-modal">
      <button type="button" class="purchase-modal-close" onclick="document.getElementById('purchaseModal').remove()">
        <i class="bi bi-x-lg"></i>
      </button>
      <div class="purchase-modal-header">
        <h2>Confirmar Compra</h2>
      </div>
      <div class="purchase-modal-body">
        <div class="purchase-car-image">
          <img src="${car.image}" alt="${car.brand} ${car.model}" />
        </div>
        <h3>${car.brand} ${car.model} ${car.year}</h3>
        <p class="purchase-price">${car.priceFormatted}</p>
        <div class="purchase-details">
          <div class="purchase-detail">
            <span>Año</span>
            <strong>${car.year}</strong>
          </div>
          <div class="purchase-detail">
            <span>Kilómetros</span>
            <strong>${car.mileageFormatted}</strong>
          </div>
          <div class="purchase-detail">
            <span>Transmisión</span>
            <strong>${car.transmission}</strong>
          </div>
          <div class="purchase-detail">
            <span>Combustible</span>
            <strong>${car.fuel}</strong>
          </div>
        </div>
        <div class="purchase-total">
          <span>Precio final</span>
          <strong>${car.priceFormatted}</strong>
        </div>
      </div>
      <div class="purchase-modal-footer">
        <button type="button" class="purchase-cancel-btn" onclick="document.getElementById('purchaseModal').remove()">Cancelar</button>
        <button type="button" class="purchase-confirm-btn" onclick="alert('Compra confirmada. Te contactaremos pronto.')">
          <i class="bi bi-check-lg"></i> Confirmar compra
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const style = document.createElement('style');
  style.textContent = `
    .purchase-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 99999; }
    .purchase-modal { background: #111; border-radius: 16px; max-width: 400px; width: 90%; overflow: hidden; animation: slideUp 0.3s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .purchase-modal-close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #888; font-size: 20px; cursor: pointer; }
    .purchase-modal-header { padding: 20px; border-bottom: 1px solid #222; }
    .purchase-modal-header h2 { margin: 0; color: #fff; font-size: 18px; }
    .purchase-modal-body { padding: 20px; }
    .purchase-car-image { width: 100%; height: 150px; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
    .purchase-car-image img { width: 100%; height: 100%; object-fit: cover; }
    .purchase-modal-body h3 { margin: 0 0 8px 0; color: #fff; font-size: 16px; }
    .purchase-price { font-size: 24px; font-weight: 700; color: #f97316; margin: 0 0 16px 0; }
    .purchase-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .purchase-detail { background: #1a1a1a; padding: 12px; border-radius: 8px; }
    .purchase-detail span { display: block; font-size: 11px; color: #666; }
    .purchase-detail strong { display: block; color: #fff; font-size: 13px; margin-top: 4px; }
    .purchase-total { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #1a1a1a; border-radius: 8px; margin-bottom: 16px; }
    .purchase-total span { color: #888; font-size: 14px; }
    .purchase-total strong { color: #22c55e; font-size: 20px; font-weight: 700; }
    .purchase-modal-footer { display: flex; gap: 12px; padding: 16px 20px; border-top: 1px solid #222; }
    .purchase-cancel-btn { flex: 1; padding: 14px; background: #222; border: none; border-radius: 8px; color: #fff; font-size: 14px; cursor: pointer; }
    .purchase-confirm-btn { flex: 1; padding: 14px; background: linear-gradient(135deg, #22c55e, #16a34a); border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .purchase-confirm-btn:hover { background: linear-gradient(135deg, #16a34a, #15803d); }
  `;
  document.head.appendChild(style);
}

export default {
  async init() {
    await this.renderCarDetail();
    this.setupActions();
  },

  async renderCarDetail() {
    const carId = window.carDetailId;
    let car = getCarById(carId);
    
    if (isInspector) {
      const inspectorData = window.getInspectorData();
      const vehicles = inspectorData.vehicles || [];
      car = vehicles.find(v => v.id == carId) || getCarById(carId);
    } else {
      try {
        const response = await usePublications().getById(carId);
        const publication = unwrapApiData(response, 'publication');
        if (publication) {
          car = normalizePublication(publication);
          currentCar = car;
          useVehicleViews().track(car.id).catch(() => {});
        }
      } catch (err) {
        console.warn('No se pudo cargar publicación real:', err.message);
      }
    }

    if (!car) {
      document.getElementById('app').innerHTML = '<div class="error-view"><h1>Auto no encontrado</h1><p>El vehículo que buscas no existe.</p><button data-navigate="home" class="home-auth-btn-primary" style="margin-top:1rem;padding:0.75rem 1.5rem;border-radius:12px;cursor:pointer;">Volver al inicio</button></div>';
      return;
    }
    currentCar = currentCar || car;

    const gallery = document.querySelector('.car-detail-gallery');
    if (gallery) {
      gallery.innerHTML = renderGallery(car);
    }

    if (document.getElementById('carLocation')) {
      document.getElementById('carLocation').textContent = car.location || 'Córdoba';
    }
    if (document.getElementById('carTitle')) {
      document.getElementById('carTitle').textContent = `${car.brand} ${car.model} ${car.year}`;
    }
    if (document.getElementById('carPrice')) {
      document.getElementById('carPrice').textContent = car.priceFormatted;
    }

    const specsHtml = `
      <div class="car-detail-spec">
        <i class="bi bi-speedometer2"></i>
        <div><span>Kilometraje</span><strong>${car.mileageFormatted || car.mileage + ' km'}</strong></div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-gear"></i>
        <div><span>Transmisión</span><strong>${car.transmission}</strong></div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-fuel-pump"></i>
        <div><span>Combustible</span><strong>${car.fuel}</strong></div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-calendar"></i>
        <div><span>Año</span><strong>${car.year}</strong></div>
      </div>
      ${car.color ? `
      <div class="car-detail-spec">
        <i class="bi bi-palette"></i>
        <div><span>Color</span><strong>${car.color}</strong></div>
      </div>
      ` : ''}
    `;
    
    const specsContainer = document.getElementById('carSpecs');
    if (specsContainer) {
      specsContainer.innerHTML = specsHtml;
    }

    const stateContainer = document.querySelector('.car-detail-state');
    if (stateContainer) {
      stateContainer.innerHTML = `
        ${renderConditionBar('Motor', car.dashboardCondition || car.motorCondition || 4)}
        ${renderConditionBar('Interior', car.interiorCondition)}
        ${renderConditionBar('Pintura', car.paintCondition)}
        ${renderConditionBar('Gomas', car.tiresCondition)}
      `;
    }

    const descContainer = document.querySelector('.car-detail-description p');
    if (descContainer && car.description) {
      descContainer.textContent = car.description;
    }

    if (document.getElementById('sellerName')) {
      document.getElementById('sellerName').textContent = car.seller?.name || 'Vendedor';
    }
    
    const sellerTypeLabels = {
      'particular': 'Particular',
      'agencia': 'Agencia/Concesionaria'
    };
    if (document.getElementById('sellerType')) {
      document.getElementById('sellerType').textContent = sellerTypeLabels[car.seller?.type] || car.seller?.type || 'Particular';
    }

    if (document.getElementById('sellerVerified') && car.seller?.verified) {
      document.getElementById('sellerVerified').innerHTML = '<i class="bi bi-patch-check-fill"></i> Verificado';
    }

    if (state.isLoggedIn() && car.id && !isInspector) {
      useFavorites().check(car.id)
        .then(response => {
          const result = unwrapApiData(response);
          const active = Boolean(result?.isFavorite || result?.favorite || result?.exists);
          const btn = document.querySelector('[data-action="favorite"]');
          const icon = btn?.querySelector('i');
          if (btn && icon && active) {
            btn.classList.add('is-active');
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
          }
        })
        .catch(() => {});
    }

    this.renderDocuments(car).catch(() => {});
    this.renderAiAnalysis(car).catch(() => {});
  },

  async renderDocuments(car) {
    if (!car?.vehicleId) return;
    const sellerBlock = document.querySelector('.car-detail-seller');
    if (!sellerBlock || document.getElementById('vehicleDocumentsPanel')) return;

    const panel = document.createElement('div');
    panel.id = 'vehicleDocumentsPanel';
    panel.className = 'car-detail-description';
    panel.innerHTML = '<h3>Documentos</h3><p>Cargando documentos...</p>';
    sellerBlock.insertAdjacentElement('afterend', panel);

    try {
      const response = await useDocuments().getByVehicle(car.vehicleId);
      const documents = unwrapApiData(response, 'documents') || [];
      panel.innerHTML = `
        <h3>Documentos</h3>
        ${documents.length ? documents.map(doc => `
          <p>
            <strong>${doc.documentType}</strong> · ${doc.verified ? 'Verificado' : 'Pendiente'}
            ${doc.documentUrl ? ` · <a href="${doc.documentUrl}" target="_blank" rel="noopener">Ver archivo</a>` : ''}
          </p>
        `).join('') : '<p>No hay documentos cargados para este vehiculo.</p>'}
      `;
    } catch (err) {
      panel.innerHTML = `<h3>Documentos</h3><p>No se pudieron cargar documentos: ${err.message}</p>`;
    }
  },

  async renderAiAnalysis(car) {
    if (!car?.vehicleId) return;
    const aiText = document.querySelector('.car-detail-ai-content > p');
    const metrics = document.querySelector('.car-detail-ai-metrics');
    if (!aiText || !metrics) return;

    try {
      const response = await useAiAnalysis().getByVehicle(car.vehicleId);
      const analysis = unwrapApiData(response, 'analysis');
      if (!analysis) return;

      aiText.textContent = analysis.damageDetected || 'Analisis IA conectado al backend. Revisa los indicadores de condicion antes de avanzar.';
      metrics.innerHTML = `
        <div class="car-detail-ai-metric">
          <span>Score general</span>
          <strong class="positive">${analysis.overallScore || '-'}%</strong>
        </div>
        <div class="car-detail-ai-metric">
          <span>Precio estimado</span>
          <strong class="neutral">${analysis.estimatedPrice || '-'}</strong>
        </div>
        <div class="car-detail-ai-metric">
          <span>Confianza</span>
          <strong class="positive">${analysis.confidenceScore || '-'}%</strong>
        </div>
      `;
    } catch {
      // El analisis es opcional para la publicacion.
    }
  },

  setupActions() {
    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.dataset.navigate;
        navigateTo(view);
      });
    });

    document.querySelectorAll('.car-thumbnail').forEach(btn => {
      btn.addEventListener('click', function() {
        const src = this.querySelector('img').src;
        const mainImg = document.getElementById('carMainImage');
        if (mainImg) {
          mainImg.src = src;
        }
        document.querySelectorAll('.car-thumbnail').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });

    document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!state.isLoggedIn()) {
          state.requireAuth(() => {
            btn.classList.add('is-active');
            btn.querySelector('i').classList.remove('bi-heart');
            btn.querySelector('i').classList.add('bi-heart-fill');
          });
          return;
        }

        const publicationId = currentCar?.id || window.carDetailId;
        btn.disabled = true;
        try {
          if (btn.classList.contains('is-active')) {
            await useFavorites().remove(publicationId);
            btn.classList.remove('is-active');
            btn.querySelector('i')?.classList.remove('bi-heart-fill');
            btn.querySelector('i')?.classList.add('bi-heart');
          } else {
            await useFavorites().add(publicationId);
            btn.classList.add('is-active');
            btn.querySelector('i')?.classList.remove('bi-heart');
            btn.querySelector('i')?.classList.add('bi-heart-fill');
          }
        } catch (err) {
          alert(err.message || 'No se pudo actualizar favorito');
        } finally {
          btn.disabled = false;
        }
      });
    });

    document.querySelectorAll('[data-action="contact"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!state.isLoggedIn()) {
          state.requireAuth(() => {
            navigateTo(`vehicles/detail/${window.carDetailId}`);
          });
          return;
        }

        const publicationId = currentCar?.id || window.carDetailId;
        btn.disabled = true;
        try {
          const response = await useApi('/chats').post('', { publicationId });
          const chat = unwrapApiData(response, 'chat') || unwrapApiData(response);
          navigateTo(`messages/buyer/chat/${chat.id}`);
        } catch (err) {
          alert(err.message || 'No se pudo iniciar el chat');
          btn.disabled = false;
        }
      });
    });

    document.querySelectorAll('[data-action="buy"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const carId = window.carDetailId;
        let car = currentCar || getCarById(carId);
        if (isInspector) {
          const inspectorData = window.getInspectorData();
          const vehicles = inspectorData.vehicles || [];
          car = vehicles.find(v => v.id == carId) || car;
        }
        showPurchaseModal(car);
      });
    });

    document.querySelectorAll('[data-action="offer"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isLoggedIn()) {
          alert('Función de oferta en desarrollo');
        } else {
          state.requireAuth(() => {
            alert('Función de oferta en desarrollo');
          });
        }
      });
    });

    document.querySelectorAll('[data-action="report"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!state.isLoggedIn()) {
          state.requireAuth(() => {});
          return;
        }

        const reason = prompt('Motivo del reporte');
        if (!reason) return;

        try {
          await useReports().create({
            publicationId: currentCar?.id || window.carDetailId,
            reason,
            description: reason
          });
          alert('Reporte enviado');
        } catch (err) {
          alert(err.message || 'No se pudo enviar el reporte');
        }
      });
    });

    document.querySelectorAll('[data-action="compare"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isLoggedIn()) {
          alert('Función de comparar en desarrollo');
        } else {
          state.requireAuth(() => {
            alert('Función de comparar en desarrollo');
          });
        }
      });
    });
  }
};
