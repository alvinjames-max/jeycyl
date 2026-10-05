/**
 * Keepsafe - Template C Application Script (Bold & Modern Hero)
 */
import { globalStore } from '../shared/state.js';
import { renderInteractiveMap } from '../shared/mapComponent.js';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '../shared/mockData.js';

const mainContent = document.getElementById('main-content-c');
const modalRoot = document.getElementById('modal-root');

// Tabs
const tabHeroMap = document.getElementById('tab-hero-map');
const tabHeroReport = document.getElementById('tab-hero-report');
const btnHeroSos = document.getElementById('btn-hero-sos');

tabHeroMap?.addEventListener('click', () => globalStore.setActiveView('map'));
tabHeroReport?.addEventListener('click', () => globalStore.setActiveView('report'));
btnHeroSos?.addEventListener('click', () => globalStore.openSOSModal());

globalStore.subscribe(state => render(state));
globalStore.loadInitialData();

function render(state) {
  tabHeroMap?.classList.toggle('active', state.activeView === 'map');
  tabHeroReport?.classList.toggle('active', state.activeView === 'report');

  if (state.activeView === 'map') {
    renderGridScreen(state);
  } else if (state.activeView === 'report') {
    renderReportScreen(state);
  } else if (state.activeView === 'detail' && state.activeIncident) {
    renderGridScreen(state);
    renderIncidentDetailModal(state.activeIncident);
  }

  if (state.sosModalOpen) {
    renderSOSModal(state.activeSOS);
  } else if (state.activeView !== 'detail') {
    modalRoot.innerHTML = '';
  }
}

function renderGridScreen(state) {
  mainContent.innerHTML = `
    <!-- Large Interactive Canvas Map Card -->
    <div style="background: var(--bg-card); padding: 1.25rem; border-radius: 20px; border: 1px solid var(--border-subtle); margin-bottom: 2.5rem; height: 460px;">
      <div id="map-target" style="width: 100%; height: 100%; border-radius: 12px; overflow: hidden;"></div>
    </div>

    <!-- Section Title & Category Filter Pills -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.75rem; font-weight: 800; color: #ffffff;">LIVE INCIDENT RADAR</h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">Tap any card to view community verifications or commuter route tips.</p>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="category-pill ${state.filters.category === 'all' ? 'active' : ''}" data-cat="all" style="background: var(--bg-card); color: white; border-color: var(--border-subtle); cursor: pointer; padding: 6px 14px;">All</button>
        ${Object.values(INCIDENT_CATEGORIES).map(c => `
          <button class="category-pill ${state.filters.category === c.id ? 'active' : ''}" data-cat="${c.id}" style="background: var(--bg-card); color: white; border-color: var(--border-subtle); cursor: pointer; padding: 6px 14px;">
            ${c.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="grid-layout">
      ${state.incidents.map(inc => {
        const severity = SEVERITY_LEVELS[inc.severity.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;
        return `
          <div class="bold-card" data-id="${inc.id}">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span class="badge ${severity.badgeClass}">${severity.label}</span>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">⏱️ ${inc.timestamp}</span>
            </div>
            
            <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 8px; color: #ffffff;">${inc.title}</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem;">${inc.description.slice(0, 100)}...</p>

            <div style="background: var(--bg-surface); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
              📍 <strong>Location:</strong> ${inc.locationName}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <span style="color: #f97316; font-weight: bold; font-size: 0.85rem;">👍 ${inc.upvotes} Verifications</span>
              <span style="color: white; font-weight: bold; font-size: 0.85rem;">View Alert →</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  document.querySelectorAll('.category-pill[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      globalStore.setFilters({ category: btn.getAttribute('data-cat') });
    });
  });

  document.querySelectorAll('.bold-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const item = state.incidents.find(i => i.id === id);
      if (item) globalStore.openIncidentDetail(item);
    });
  });

  const mapTarget = document.getElementById('map-target');
  if (mapTarget) {
    renderInteractiveMap(mapTarget, state.incidents, state.geofences, (selected) => {
      globalStore.openIncidentDetail(selected);
    }, true);
  }
}

function renderReportScreen(state) {
  mainContent.innerHTML = `
    <div style="max-width: 720px; margin: 0 auto; background: var(--bg-card); padding: 2rem; border-radius: 20px; border: 1px solid var(--border-subtle);">
      <h2 style="font-size: 1.75rem; font-weight: 800; color: white; margin-bottom: 6px;">📢 Report Danger / Route Incident</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Broadcast immediate commuter safety warnings across Kenyan transit lines.</p>

      <form id="hero-report-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 6px; color: var(--text-secondary);">Incident Title</label>
          <input type="text" id="c-title" required class="search-input" style="width: 100%; background: var(--bg-surface); color: white; border-color: var(--border-subtle);">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 6px; color: var(--text-secondary);">Category</label>
            <select id="c-category" class="filter-select" style="width: 100%; background: var(--bg-surface); color: white; border-color: var(--border-subtle);">
              ${Object.values(INCIDENT_CATEGORIES).map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 6px; color: var(--text-secondary);">Severity</label>
            <select id="c-severity" class="filter-select" style="width: 100%; background: var(--bg-surface); color: white; border-color: var(--border-subtle);">
              <option value="low">Low Risk</option>
              <option value="medium" selected>Medium Risk</option>
              <option value="high">High Danger</option>
              <option value="critical">Critical Danger</option>
            </select>
          </div>
        </div>

        <div>
          <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 6px; color: var(--text-secondary);">Location Landmark</label>
          <input type="text" id="c-location" required class="search-input" style="width: 100%; background: var(--bg-surface); color: white; border-color: var(--border-subtle);">
        </div>

        <div>
          <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 6px; color: var(--text-secondary);">Description & Advice</label>
          <textarea id="c-desc" required rows="4" class="search-input" style="width: 100%; background: var(--bg-surface); color: white; border-color: var(--border-subtle);"></textarea>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button type="button" id="c-cancel" class="nav-tab">Cancel</button>
          <button type="submit" class="hero-sos-btn" style="padding: 10px 24px; font-size: 1rem; background: linear-gradient(135deg, #f97316, #ea580c); border: none;">Broadcast Alert</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('c-cancel')?.addEventListener('click', () => globalStore.setActiveView('map'));
  document.getElementById('hero-report-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    globalStore.submitReport({
      title: document.getElementById('c-title').value,
      category: document.getElementById('c-category').value,
      severity: document.getElementById('c-severity').value,
      locationName: document.getElementById('c-location').value,
      description: document.getElementById('c-desc').value,
      city: 'Nairobi'
    });
  });
}

function renderIncidentDetailModal(incident) {
  const severity = SEVERITY_LEVELS[incident.severity.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;

  modalRoot.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-container" style="background: #1a0b2e; border: 2px solid #5b2c93; color: white; padding: 2rem; max-width: 600px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <span class="badge ${severity.badgeClass}">${severity.label}</span>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: white; margin-top: 6px;">${incident.title}</h2>
          </div>
          <button id="btn-close-modal" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #c4b5fd;">&times;</button>
        </div>

        <div style="background: #261242; padding: 1rem; border-radius: 10px; margin-bottom: 1.25rem;">
          <div>📍 <strong>Location:</strong> ${incident.locationName}</div>
          <div>⏱️ <strong>Time:</strong> ${incident.timestamp}</div>
        </div>

        <p style="color: #c4b5fd; line-height: 1.6; margin-bottom: 1.5rem;">${incident.description}</p>

        <button id="btn-upvote" style="width: 100%; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer;">
          👍 Confirm / Upvote Incident (${incident.upvotes})
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal')?.addEventListener('click', () => globalStore.setActiveView('map'));
  document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') globalStore.setActiveView('map');
  });
  document.getElementById('btn-upvote')?.addEventListener('click', () => {
    globalStore.upvoteActiveIncident(incident.id);
  });
}

function renderSOSModal(activeSOS) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" id="sos-modal-backdrop">
      <div class="modal-container" style="background: #0f051d; border: 3px solid #ef4444; color: white; padding: 2rem; max-width: 550px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 8px;">🚨</div>
        <h2 style="font-size: 1.75rem; font-weight: 900; color: #ef4444; margin-bottom: 6px;">EMERGENCY SOS DISPATCH</h2>
        <p style="color: #c4b5fd; font-size: 0.9rem; margin-bottom: 1.5rem;">Instant emergency broadcast to 999 Police and Red Cross Ambulance.</p>

        ${activeSOS ? `
          <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
            <div style="color: #f87171; font-weight: bold; font-size: 1.1rem;">🔴 BROADCAST LIVE</div>
            <div>User: ${activeSOS.userName}</div>
            <div>Target: ${activeSOS.dispatchTarget}</div>
          </div>
          <button id="btn-cancel-sos" style="width: 100%; background: #261242; color: white; padding: 12px; border-radius: 8px; border: 1px solid #5b2c93; font-weight: bold; cursor: pointer;">Resolve SOS</button>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem;">
            <button class="sos-trigger-btn" data-type="Assault / Mugging Threat" style="background: #ef4444; color: white; padding: 14px; border-radius: 10px; font-weight: 900; border: none; cursor: pointer;">🚨 Assault / Mugging Threat →</button>
            <button class="sos-trigger-btn" data-type="Medical Emergency" style="background: #f97316; color: white; padding: 14px; border-radius: 10px; font-weight: 900; border: none; cursor: pointer;">🚑 Medical Emergency →</button>
          </div>
          <button id="btn-close-sos" style="background: none; border: none; color: #c4b5fd; cursor: pointer; font-size: 0.9rem;">Close</button>
        `}
      </div>
    </div>
  `;

  document.getElementById('btn-close-sos')?.addEventListener('click', () => globalStore.closeSOSModal());
  document.getElementById('btn-cancel-sos')?.addEventListener('click', () => globalStore.resolveActiveSOS());
  document.querySelectorAll('.sos-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      globalStore.triggerEmergencySOS(btn.getAttribute('data-type'));
    });
  });
}
