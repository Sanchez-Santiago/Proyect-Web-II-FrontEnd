const Inspector = {
  enabled: false,
  elements: [],
  container: null,

  init() {
    if (!import.meta.env.VITE_INSPECTOR_MODE) return;

    this.createContainer();
    this.createToggle();
    this.scanElements();
    this.observe();

    window.addEventListener('resize', () => this.scanElements());
  },

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'inspector-overlay';
    document.body.appendChild(this.container);
  },

  createToggle() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inspector-toggle';
    btn.textContent = 'INSPECT';
    btn.addEventListener('click', () => this.toggle());
    document.body.appendChild(btn);
  },

  getTargetClasses(el) {
    const classes = el.className.split(' ').filter(c => c);
    return classes.length > 0 ? `.${classes.join('.')}` : el.tagName.toLowerCase();
  },

  getElementName(el) {
    const id = el.id ? `#${el.id}` : '';
    const classes = this.getTargetClasses(el);
    return `${el.tagName.toLowerCase()}${id}${classes}`;
  },

  scanElements() {
    this.container.innerHTML = '';

    const ignoredTags = ['SCRIPT', 'STYLE', 'IFRAME', 'NOSCRIPT', 'META', 'LINK'];
    const ignoredClasses = ['inspector-', 'bi-', 'form-', 'btn-'];

    const allElements = document.querySelectorAll('body *');

    allElements.forEach(el => {
      if (ignoredTags.includes(el.tagName)) return;
      if (!el.className || typeof el.className !== 'string') return;

      const hasIgnoredClass = ignoredClasses.some(c => el.className.includes(c));
      if (hasIgnoredClass) return;
      if (el.classList.contains('inspector-overlay')) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < 5 || rect.height < 5) return;

      const marker = document.createElement('div');
      marker.className = 'inspector-element';
      marker.style.top = `${rect.top + window.scrollY}px`;
      marker.style.left = `${rect.left + window.scrollX}px`;
      marker.style.width = `${rect.width}px`;
      marker.style.height = `${rect.height}px`;
      marker.setAttribute('data-inspector-name', this.getElementName(el));
      marker.setAttribute('data-inspector-dims', `${rect.width}×${rect.height}`);

      this.container.appendChild(marker);
    });
  },

  observe() {
    const observer = new MutationObserver(() => {
      if (this.enabled) {
        this.scanElements();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  },

  toggle() {
    this.enabled = !this.enabled;
    const btn = document.querySelector('.inspector-toggle');

    if (this.enabled) {
      this.scanElements();
      btn?.classList.add('active');
      btn.textContent = 'INSPECT ON';
    } else {
      this.container.innerHTML = '';
      btn?.classList.remove('active');
      btn.textContent = 'INSPECT';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Inspector.init());

export default Inspector;