import { useVehicles } from '../../hooks/useVehicles.js';
import { usePublications } from '../../hooks/usePublications.js';
import { useUpload } from '../../hooks/useUpload.js';
import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default {
  init() {
    const form = document.getElementById('addVehicleForm');
    const imageInput = document.getElementById('vehicleImages');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imagePreviewGrid = document.getElementById('imagePreviewGrid');
    const message = document.getElementById('addVehicleMessage');

    if (!form || !message) return;

    const vehicles = useVehicles();
    const publications = usePublications();
    const upload = useUpload();
    let selectedFiles = [];

    function setMessage(text, type) {
      message.textContent = text;
      message.classList.remove('error', 'success');
      if (type) message.classList.add(type);
    }

    function renderImagePreviews() {
      imagePreviewGrid.innerHTML = '';
      selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = document.createElement('div');
          preview.className = 'image-preview-item';
          preview.innerHTML = `
            <img src="${e.target.result}" alt="Preview ${index + 1}" />
            <button type="button" class="image-preview-remove" data-index="${index}">
              <i class="bi bi-x-lg"></i>
            </button>
          `;
          imagePreviewGrid.appendChild(preview);
        };
        reader.readAsDataURL(file);
      });

      document.querySelectorAll('.image-preview-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          selectedFiles.splice(index, 1);
          renderImagePreviews();
        });
      });
    }

    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        selectedFiles = [...selectedFiles, ...files];
        renderImagePreviews();
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
        renderImagePreviews();
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
      return {
        brand: form.brand.value,
        model: form.model.value.trim(),
        year: parseInt(form.year.value),
        vehicleType: form.vehicleType.value,
        mileage: form.mileage?.value ? parseInt(form.mileage.value) : undefined,
        fuelType: form.fuelType?.value || undefined,
        transmission: form.transmission?.value || undefined,
        color: form.color?.value || undefined,
        accidents: form.accidents?.value.trim() || undefined
      };
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
        setMessage('Creando vehiculo...', 'success');
        const vehicleData = buildVehicleData();
        const vehicleRes = await vehicles.create(vehicleData);
        const vehicleId = vehicleRes?.vehicle?.id;

        if (!vehicleId) {
          setMessage('Error al crear el vehiculo.', 'error');
          if (submitBtn) submitBtn.disabled = false;
          return;
        }

        if (selectedFiles.length > 0) {
          setMessage('Subiendo imagenes...', 'success');
          await uploadImages(vehicleId);
        }

        setMessage('Creando publicacion...', 'success');
        const publicationData = {
          vehicleId,
          price: parseFloat(form.price.value),
          province: form.province.value.trim(),
          city: form.city.value.trim(),
          description: form.description.value.trim(),
          title: `${form.brand.value} ${form.model.value.trim()} ${form.year.value}`
        };

        await publications.create(publicationData);

        setMessage('Vehiculo publicado con exito!', 'success');
        setTimeout(() => navigateTo('user/seller/menu'), 1500);
      } catch (err) {
        console.error('Error:', err);
        setMessage(err.message || 'Error al publicar vehiculo.', 'error');
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
