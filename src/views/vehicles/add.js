import { useVehicles } from '../../hooks/useVehicles.js';
import { useUpload } from '../../hooks/useUpload.js';
import { usePublications } from '../../hooks/usePublications.js';
import { navigateTo } from '../../js/router.js';
import state from '../../js/state.js';
import { unwrapApiData } from '../../js/publicationMapper.js';

export default {
  init() {
    const form = document.getElementById('addVehicleForm');
    const imageInput = document.getElementById('vehicleImages');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imagePreviewGrid = document.getElementById('imagePreviewGrid');
    const message = document.getElementById('addVehicleMessage');

    if (!form || !message) return;

    const vehicles = useVehicles();
    const upload = useUpload();
    const publications = usePublications();
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

      if (!brand) {
        setMessage('Selecciona una marca.', 'error');
        form.brand?.focus();
        return false;
      }

      if (!model) {
        setMessage('Ingresa el modelo.', 'error');
        form.model?.focus();
        return false;
      }

      if (!year) {
        setMessage('Selecciona el ano.', 'error');
        form.year?.focus();
        return false;
      }

      if (form.vehicleType && !vehicleType) {
        setMessage('Selecciona el tipo de vehiculo.', 'error');
        form.vehicleType?.focus();
        return false;
      }

      if (!price || price <= 0) {
        setMessage('Ingresa un precio valido.', 'error');
        form.price?.focus();
        return false;
      }

      if (form.province && !province) {
        setMessage('Ingresa la provincia.', 'error');
        form.province?.focus();
        return false;
      }

      if (form.city && !city) {
        setMessage('Ingresa la ciudad.', 'error');
        form.city?.focus();
        return false;
      }

      if (form.description && !description) {
        setMessage('Ingresa una descripcion.', 'error');
        form.description?.focus();
        return false;
      }

      return true;
    }

    function buildFormData() {
      return {
        brand: form.brand.value,
        model: form.model.value.trim(),
        year: parseInt(form.year.value),
        vehicleType: form.vehicleType?.value || 'SEDAN',
        price: parseFloat(form.price.value),
        mileage: form.mileage?.value ? parseInt(form.mileage.value) : undefined,
        fuelType: form.fuelType?.value || 'GASOLINE',
        transmission: form.transmission?.value || 'MANUAL',
        color: form.color?.value || undefined,
        accidents: form.accidents?.value.trim() || undefined
      };
    }

    function buildPublicationData(vehicleId) {
      return {
        vehicleId,
        title: `${form.brand.value} ${form.model.value.trim()} ${form.year.value}`,
        description: form.description?.value?.trim() || 'Publicacion cargada desde MotorMarket.',
        price: parseFloat(form.price.value),
        currency: form.currency?.value || 'ARS',
        province: form.province?.value?.trim() || 'Cordoba',
        city: form.city?.value?.trim() || 'Cordoba'
      };
    }

    function fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    async function uploadImages(vehicleId) {
      const uploadedUrls = [];
      const failedFiles = [];
      for (const file of selectedFiles) {
        try {
          const dataUrl = await fileToDataUrl(file);
          const result = unwrapApiData(await upload.imageFromUrl(dataUrl));
          if (result?.url) {
            uploadedUrls.push({ url: result.url, title: file.name });
          } else {
            failedFiles.push(file.name);
          }
        } catch (err) {
          console.warn('Error uploading image:', err.message);
          failedFiles.push(file.name);
        }
      }
      if (failedFiles.length > 0) {
        throw new Error(`No se pudieron subir estas fotos: ${failedFiles.join(', ')}`);
      }
      if (uploadedUrls.length > 0) {
        await vehicles.addImagesBulk(vehicleId, uploadedUrls);
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

      setMessage('Publicando vehiculo...', 'success');

      try {
        const vehicleData = buildFormData();
        const vehicleResponse = await vehicles.create(vehicleData);
        const vehicle = unwrapApiData(vehicleResponse, 'vehicle');

        if (!vehicle?.id) {
          setMessage('Error al crear vehiculo.', 'error');
          return;
        }

        if (selectedFiles.length > 0) {
          setMessage('Subiendo fotos...', 'success');
          await uploadImages(vehicle.id);
        }

        setMessage('Creando publicacion...', 'success');
        const publicationResponse = await publications.create(buildPublicationData(vehicle.id));
        const publication = unwrapApiData(publicationResponse, 'publication');

        setMessage('Publicacion creada con exito!', 'success');

        setTimeout(() => {
          navigateTo(publication?.id ? `vehicles/detail/${publication.id}` : 'user/seller/publications');
        }, 1500);

      } catch (err) {
        console.error('Error:', err);
        setMessage(err.message || 'No se pudo publicar el vehiculo.', 'error');
      }
    });

    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.getAttribute('data-navigate');
        if (view) {
          navigateTo(view);
        }
      });
    });
  }
};
