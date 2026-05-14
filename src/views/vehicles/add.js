import { useVehicles } from '../../hooks/useVehicles.js';
import { usePublications } from '../../hooks/usePublications.js';
import { useUpload } from '../../hooks/useUpload.js';
import { useApi } from '../../hooks/useApi.js';
import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';
import { VEHICLE_BRANDS, VEHICLE_TYPES, FUEL_TYPES, TRANSMISSION_TYPES, getYearOptions } from '../../utils/constants.js';

function populateSelect(id, options, valueKey, labelKey) {
  const select = document.getElementById(id);
  if (!select) return;
  
  options.forEach(opt => {
    const el = document.createElement('option');
    if (typeof opt === 'object' && opt !== null) {
      el.value = opt[valueKey];
      el.textContent = opt[labelKey];
    } else {
      // Handle strings and numbers
      el.value = opt;
      el.textContent = opt;
    }
    select.appendChild(el);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default {
  async init() {
    const form = document.getElementById('addVehicleForm');
    const imageInput = document.getElementById('vehicleImages');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imagePreviewGrid = document.getElementById('imagePreviewGrid');
    const imageUploadFooter = document.getElementById('imageUploadFooter');
    const message = document.getElementById('addVehicleMessage');

    if (!form || !message) return;

    const api = useApi();
    const [favsRes, notifsRes] = await Promise.all([
      api.get('/favorites').catch(() => ({ favorites: [] })),
      api.get('/notifications').catch(() => ({ notifications: [] })),
    ]);
    const favCount = (favsRes.favorites || []).length;
    const unreadCount = (notifsRes.notifications || []).filter(n => !n.isRead).length;
    const sidebarLeads = document.getElementById('sidebarLeads');
    const sidebarDesc = document.getElementById('sidebarLeadDesc');
    if (sidebarLeads) sidebarLeads.textContent = `${favCount} vehículos seguidos`;
    if (sidebarDesc) sidebarDesc.textContent = unreadCount > 0
      ? `${unreadCount} notificaciones sin leer.`
      : 'Todo al día. Sin novedades.';

    populateSelect('vehicleBrand', VEHICLE_BRANDS);
    populateSelect('vehicleYear', getYearOptions());
    populateSelect('vehicleType', VEHICLE_TYPES, 'value', 'label');
    populateSelect('vehicleFuel', FUEL_TYPES, 'value', 'label');
    populateSelect('vehicleTransmission', TRANSMISSION_TYPES, 'value', 'label');

    const vehicles = useVehicles();
    const publications = usePublications();
    const upload = useUpload();
    let selectedFiles = [];
    const objectUrls = [];

    function setMessage(text, type) {
      message.textContent = text;
      message.classList.remove('error', 'success');
      if (type) message.classList.add(type);
    }

    function renderImagePreviews() {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
      objectUrls.length = 0;
      imagePreviewGrid.innerHTML = '';

      selectedFiles.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);
        const preview = document.createElement('div');
        preview.className = 'image-preview-item';
        preview.dataset.index = index;
        preview.innerHTML = `
          <img src="${url}" alt="Preview ${index + 1}" />
          <button type="button" class="image-preview-remove" data-index="${index}">
            <i class="bi bi-x-lg"></i>
          </button>
        `;
        imagePreviewGrid.appendChild(preview);
      });
    }

    function renderImageFooter() {
      if (!imageUploadFooter) return;
      imageUploadFooter.innerHTML = '';

      if (selectedFiles.length > 0) {
        const countText = document.createElement('p');
        countText.className = 'image-count-text';
        countText.textContent = `${selectedFiles.length} ${selectedFiles.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}`;
        imageUploadFooter.appendChild(countText);

        const addMoreBtn = document.createElement('button');
        addMoreBtn.type = 'button';
        addMoreBtn.className = 'add-more-btn';
        addMoreBtn.innerHTML = '<i class="bi bi-plus-lg me-1"></i>Agregar mas fotos';
        addMoreBtn.addEventListener('click', () => {
          imageInput?.click();
        });
        imageUploadFooter.appendChild(addMoreBtn);
      }
    }

    function refreshPreviews() {
      renderImagePreviews();
      renderImageFooter();
    }

    imagePreviewGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.image-preview-remove');
      if (!btn) return;
      const index = parseInt(btn.dataset.index);
      selectedFiles.splice(index, 1);
      refreshPreviews();
    });

    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        selectedFiles = [...selectedFiles, ...files];
        refreshPreviews();
      });
    }

    if (imageUploadArea) {
      imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('dragover');
      });

      imageUploadArea.addEventListener('dragleave', () => {
        imageUploadArea.classList.remove('dragover');
      });

      imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        selectedFiles = [...selectedFiles, ...files];
        refreshPreviews();
      });

      imageUploadArea.addEventListener('click', (e) => {
        if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'I' && !e.target.closest('.image-upload-btn')) {
          imageInput?.click();
        }
      });
    }

    function validateForm() {
      const brand = form.brand?.value;
      const model = form.model?.value.trim();
      const year = form.year?.value;
      const vehicleType = form.vehicleType?.value;
      const price = form.price?.value;
      const province = form.province?.value.trim();
      const city = form.city?.value.trim();
      const description = form.description?.value.trim();

      if (!brand) { setMessage('Selecciona una marca.', 'error'); form.brand?.focus(); return false; }
      if (!model) { setMessage('Ingresa el modelo.', 'error'); form.model?.focus(); return false; }
      if (!year) { setMessage('Selecciona el ano.', 'error'); form.year?.focus(); return false; }
      if (!vehicleType) { setMessage('Selecciona el tipo de vehiculo.', 'error'); form.vehicleType?.focus(); return false; }
      if (!price || price <= 0) { setMessage('Ingresa un precio valido.', 'error'); form.price?.focus(); return false; }
      if (!province) { setMessage('Ingresa la provincia.', 'error'); form.province?.focus(); return false; }
      if (!city) { setMessage('Ingresa la ciudad.', 'error'); form.city?.focus(); return false; }
      if (!description) { setMessage('Ingresa una descripcion.', 'error'); form.description?.focus(); return false; }

      return true;
    }

    function buildVehicleData() {
      const data = {
        brand: form.brand.value,
        model: form.model.value.trim(),
        year: parseInt(form.year.value),
        vehicleType: form.vehicleType.value,
        mileage: form.mileage?.value ? parseInt(form.mileage.value) : 0,
        fuelType: form.fuelType?.value || null,
        transmission: form.transmission?.value || null,
        color: form.color?.value || null,
        accidents: form.accidents?.value?.trim() || null
      };
      console.log('[ADD] Vehicle data:', data);
      return data;
    }

    async function uploadImages(vehicleId) {
      const uploadedUrls = [];
      for (const file of selectedFiles) {
        try {
          const dataUrl = await readFileAsDataURL(file);
          const result = await upload.imageFromUrl(dataUrl);
          if (result?.url) {
            uploadedUrls.push(result.url);
          }
        } catch (err) {
          console.warn('Error uploading image:', err.message);
        }
      }

      if (uploadedUrls.length > 0) {
        try {
          await vehicles.addImagesBulk(vehicleId, uploadedUrls.map(url => ({ url })));
        } catch (err) {
          console.warn('Error adding images to vehicle:', err.message);
        }
      }

      return uploadedUrls;
    }

    document.getElementById('generateAiDescription')?.addEventListener('click', async () => {
      if (!state.isLoggedIn()) {
        setMessage('Debes iniciar sesion para usar IA.', 'error');
        navigateTo('auth/login');
        return;
      }

      const brand = form.brand?.value;
      const model = form.model?.value.trim();
      const year = form.year?.value;
      const mileage = form.mileage?.value;
      const fuelType = form.fuelType?.value;
      const transmission = form.transmission?.value;
      const color = form.color?.value;

      if (!brand || !model || !year) {
        setMessage('Completa marca, modelo y ano primero.', 'error');
        return;
      }

      const btn = document.getElementById('generateAiDescription');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Generando...';

      try {
        const api = useApi('/gemini');
        const response = await api.post('/generate-description', {
          brand, model, year: parseInt(year),
          mileage: mileage ? parseInt(mileage) : null,
          fuelType, transmission, color
        });

        if (response?.description && form.description) {
          form.description.value = response.description;
          setMessage('Descripcion generada por IA!', 'success');
        }
        if (response?.suggestedPrice && form.price && !form.price.value) {
          form.price.value = response.suggestedPrice;
        }
      } catch (err) {
        setMessage(err.message || 'Error al generar con IA.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-stars me-1"></i>Generar descripcion con IA';
      }
    });

    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!state.isLoggedIn()) {
        setMessage('Debes iniciar sesion para publicar.', 'error');
        navigateTo('auth/login');
        return;
      }

      if (!validateForm()) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        setMessage('Procesando datos...', 'success');
        const vehicleData = buildVehicleData();
        
        console.log('[ADD] Calling vehicles.create...');
        const vehicleRes = await vehicles.create(vehicleData);
        console.log('[ADD] Vehicle response:', vehicleRes);
        
        const vehicleId = vehicleRes?.vehicle?.id || vehicleRes?.id;

        if (!vehicleId) {
          throw new Error('No se pudo obtener el ID del vehiculo creado.');
        }

        if (selectedFiles.length > 0) {
          setMessage('Subiendo imagenes...', 'success');
          await uploadImages(vehicleId);
        }

        setMessage('Finalizando publicacion...', 'success');
        const publicationData = {
          vehicleId,
          price: parseFloat(form.price.value),
          currency: 'ARS',
          province: form.province.value.trim(),
          city: form.city.value.trim(),
          description: form.description.value.trim(),
          title: `${form.brand.value} ${form.model.value.trim()} ${form.year.value}`.trim()
        };

        console.log('[ADD] Submitting publication payload:', publicationData);
        const pubRes = await publications.create(publicationData);
        console.log('[ADD] Publication response:', pubRes);

        setMessage('Vehiculo publicado con exito!', 'success');
        setTimeout(() => navigateTo('user/seller/menu'), 1500);
      } catch (err) {
        console.error('[ADD] Error full details:', err);
        const errorMsg = err.data?.message || err.message || 'Error interno del servidor al publicar.';
        setMessage(errorMsg, 'error');
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.getAttribute('data-navigate');
        if (view) navigateTo(view);
      });
    });
  }
};
