import { navigateTo } from '../../router.js';

const isInspector = typeof window.getInspectorData === 'function';
const isInspectorRoleSwitch = typeof window.toggleInspectorRole === 'function';

export default {
  init() {
    this.setupInspectorSwitch();
    this.setupNavigation();
  },

  setupInspectorSwitch() {
    if (!isInspector || !isInspectorRoleSwitch) return;

    const sidebar = document.querySelector('.menu-sidebar');
    if (!sidebar) return;

    const switchBtn = document.createElement('button');
    switchBtn.type = 'button';
    switchBtn.className = 'menu-inspector-switch';
    switchBtn.textContent = '🕵️ Cambiar a Vendedor';
    switchBtn.addEventListener('click', () => {
      window.toggleInspectorRole();
    });

    const style = document.createElement('style');
    style.textContent = `
      .menu-inspector-switch {
        width: 100%;
        padding: 10px 12px;
        background: rgba(249,115,22,0.15);
        border: 1px solid rgba(249,115,22,0.3);
        border-radius: 6px;
        color: #f97316;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 8px;
        transition: all 0.2s;
      }
      .menu-inspector-switch:hover {
        background: rgba(249,115,22,0.25);
      }
    `;
    document.head.appendChild(style);

    sidebar.appendChild(switchBtn);
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-navigate');
        navigateTo(view);
      });
    });
  }
};
