/**
 * Keepsafe - Template B Application Script (Command Center Dashboard)
 */
import { globalStore } from '../shared/state.js';
import { renderInteractiveMap } from '../shared/mapComponent.js';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS, EMERGENCY_CONTACTS } from '../shared/mockData.js';

const workspaceMain = document.getElementById('workspace-main');
const sidePanelRight = document.getElementById('side-panel-right');
const modalRoot = document.getElementById('modal-root');

// Sidebar Tabs
const sideTabMap = document.getElementById('side-tab-map');
const sideTabReport = document.getElementById('side-tab-report');
const sideTabGeofences = document.getElementById('side-tab-geofences');
const btnSidebarSos = document.getElementById('btn-sidebar-sos');

sideTabMap?.addEventListener('click', () => globalStore.setActiveView('map'));
sideTabReport?.addEventListener('click', () => globalStore.setActiveView('report'));
sideTabGeofences?.addEventListener('click', () => globalStore.setActiveView('geofences'));
btnSidebarSos?.addEventListener('click', () => globalStore.openSOSModal());

globalStore.subscribe(state => render(state));
globalStore.loadInitialData();

function render(state) {
  sideTabMap?.classList.toggle('active', state.activeView === 'map');
  sideTabReport?.classList.toggle('active', state.activeView === 'report');
  sideTabGeofences?.classList.toggle('active', state.activeView === 'geofences');

  // Render main workspace & right panel
  if (state.activeView === 'map' || state.activeView === 'geofences') {
    renderMapWorkspace(state);
    renderRightPanelAlerts(state);
  } else if (state.activeView === 'report') {
    renderReportWorkspace(state);
    renderRightPanelAlerts(state);
  } else if (state.activeView === 'detail' && state.activeIncident) {
    renderMapWorkspace(state);
    renderRightPanelAlerts(state);
    renderIncidentDetailModal(state.activeIncident);
  }

  if (state.sosModalOpen) {
    renderSOSModal(state.activeSOS);
  } else if (state.activeView !== 'detail') {
    modalRoot.innerHTML = '';
  }
}

function renderMapWorkspace(state) {
  workspaceMain.innerHTML = `
    <!-- Top Header Control Bar -->
    <div class="workspace-header">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">Live Radar & Geofence Monitor</h2>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">Real-time telemetry across Kenya Commuter Routes</div>
      </div>

      <div style="display: flex; gap: 10px;">
        <input type="text" class="search-input" id="dash-search" placeholder="🔍 Search route or city..." value="${state.filters.search}" style="background: var(--bg-card); color: white; border-color: var(--border-subtle); width: 220px;">
        
        <select class="filter-select" id="dash-category" style="background: var(--bg-card); color: white; border-color: var(--border-subtle);">
          <option value="all">All Categories</option>
          ${Object.values(INCIDENT_CATEGORIES).map(c => `
            <option value="${c.id}" ${state.filters.category === c.id ? 'selected' : ''}>${c.label}</option>
          `).join('')}
        </select>
        
        <button class="sidebar-btn" id="dash-btn-report" style="background: var(--brand-emerald); color: white; font-weight: bold; padding: 6px 14px;">
          + New Report
        </button>
      </div>
    </div>

    <!-- Map Canvas Area -->
    <div class="workspace-body">
      <div id="map-target" style="width: 100%; height: 100%; border-radius: var(--radius-md); overflow: hidden;"></div>
    </div>
  `;

  document.getElementById('dash-btn-report')?.addEventListener('click', () => globalStore.setActiveView('report'));
  document.getElementById('dash-search')?.addEventListener('input', (e) => globalStore.setFilters({ search: e.target.value }));
  document.getElementById('dash-category')?.addEventListener('change', (e) => globalStore.setFilters({ category: e.target.value }));

  const mapTarget = document.getElementById('map-target');
  if (mapTarget) {
    renderInteractiveMap(mapTarget, state.incidents, state.geofences, (selected) => {
      globalStore.openIncidentDetail(selected);
    }, true);
  }
}

function renderRightPanelAlerts(state) {
  sidePanelRight.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
      <h3 style="font-size: 1rem; font-weight: 700; color: #ffffff;">Live Incidents (${state.incidents.length})</h3>
      <span style="font-size: 0.75rem; color: #10b981; font-weight: bold;">● LIVE STREAM</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${state.incidents.map(inc => {
        const severity = SEVERITY_LEVELS[inc.severity.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;
        return `
          <div class="dash-card" data-id="${inc.id}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="badge ${severity.badgeClass}">${severity.label}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${inc.timestamp}</span>
            </div>
            <div style="font-weight: 700; font-size: 0.95rem; color: #ffffff; margin-bottom: 4px;">${inc.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">📍 ${inc.locationName}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 6px;">
              <span>👍 ${inc.upvotes} Verifications</span>
              <span style="color: #38bdf8;">Inspect →</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  sidePanelRight.querySelectorAll('.dash-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const item = state.incidents.find(i => i.id === id);
      if (item) globalStore.openIncidentDetail(item);
    });
  });
}

function renderReportWorkspace(state) {
  workspaceMain.innerHTML = `
    <div style="padding: 2rem; max-width: 800px; margin: 0 auto; overflow-y: auto; height: 100%;">
      <h2 style="font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 6px;">Dispatch Safety Incident Report</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">Broadcast dangerous transit hazards or suspicious matatu activity directly onto the Command Center radar.</p>
      
      <form id="dash-report-form" style="display: flex; flex-direction: column; gap: 1.25rem; background: var(--bg-surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-subtle);">
        <div>
          <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-secondary);">Incident Title</label>
          <input type="text" id="dash-title" required placeholder="Title..." class="search-input" style="width: 100%; background: var(--bg-card); color: white; border-color: var(--border-subtle);">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-secondary);">Category</label>
            <select id="dash-category-select" class="filter-select" style="width: 100%; background: var(--bg-card); color: white; border-color: var(--border-subtle);">
              ${Object.values(INCIDENT_CATEGORIES).map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-secondary);">Severity Level</label>
            <select id="dash-severity" class="filter-select" style="width: 100%; background: var(--bg-card); color: white; border-color: var(--border-subtle);">
              <option value="low">Low Risk</option>
              <option value="medium" selected>Medium Risk</option>
              <option value="high">High Danger</option>
              <option value="critical">Critical Danger</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-secondary);">City</label>
            <select id="dash-city" class="filter-select" style="width: 100%; background: var(--bg-card); color: white; border-color: var(--border-subtle);">
              <option value="Nairobi">Nairobi</option>
              <option value="MOMBASA">Mombasa</option>
              <option value="KISUMU">Kisumu</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-secondary);">Exact Location</label>
            <input type="text" id="dash-location" required placeholder="Landmark..." class="search-input" style="width: 100%; background: var(--bg-card); color: white; border-color: var(--border-subtle);">
          </div>
        </div>

        <div>
          <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-secondary);">Description</label>
          <textarea id="dash-desc" required rows="4" class="search-input" style="width: 100%; background: var(--bg-card); color: white; border-color: var(--border-subtle);"></textarea>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button type="button" id="dash-cancel" class="sidebar-btn" style="width: auto;">Cancel</button>
          <button type="submit" class="sidebar-btn" style="width: auto; background: var(--brand-emerald); color: white; font-weight: bold;">Submit Broadcast</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('dash-cancel')?.addEventListener('click', () => globalStore.setActiveView('map'));
  document.getElementById('dash-report-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    globalStore.submitReport({
      title: document.getElementById('dash-title').value,
      category: document.getElementById('dash-category-select').value,
      severity: document.getElementById('dash-severity').value,
      city: document.getElementById('dash-city').value,
      locationName: document.getElementById('dash-location').value,
      description: document.getElementById('dash-desc').value
    });
  });
}

function renderIncidentDetailModal(incident) {
  const severity = SEVERITY_LEVELS[incident.severity.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;

  modalRoot.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-container" style="background: #0f172a; border-color: #334155; color: #f8fafc; padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <span class="badge ${severity.badgeClass}">${severity.label}</span>
            <h2 style="font-size: 1.4rem; font-weight: 700; color: #ffffff; margin-top: 6px;">${incident.title}</h2>
          </div>
          <button id="btn-close-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8;">&times;</button>
        </div>

        <div style="background: #1e293b; padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem; font-size: 0.85rem; border: 1px solid #334155;">
          <div>📍 <strong>Location:</strong> ${incident.locationName} (${incident.city})</div>
          <div>⏱️ <strong>Timestamp:</strong> ${incident.timestamp}</div>
          <div>🛡️ <strong>Reporter:</strong> ${incident.reporter}</div>
        </div>

        <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 1.5rem;">${incident.description}</p>

        <div style="border-top: 1px solid #334155; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <button id="btn-upvote" style="background: #0284c7; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            👍 Upvote Verification (${incident.upvotes})
          </button>
          <span style="font-size: 0.8rem; color: #94a3b8;">Status: ${incident.verifiedByCommunity ? 'Verified' : 'Pending'}</span>
        </div>
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
      <div class="modal-container" style="background: #0f172a; border: 2px solid #ef4444; color: white; max-width: 500px; padding: 1.5rem;">
        <h2 style="color: #ef4444; font-size: 1.5rem; font-weight: 800; margin-bottom: 8px;">🚨 COMMAND CENTER SOS DISPATCH</h2>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem;">Immediate emergency broadcast to Kenyan authorities & emergency services.</p>

        ${activeSOS ? `
          <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <div style="color: #f87171; font-weight: bold;">DISPATCH ACTIVE</div>
            <div style="font-size: 0.85rem;">Location: ${activeSOS.locationName}</div>
          </div>
          <button id="btn-cancel-sos" style="width: 100%; background: #334155; color: white; padding: 10px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer;">Resolve SOS</button>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem;">
            <button class="sos-trigger-btn" data-type="Assault / Robbery" style="background: #ef4444; color: white; padding: 12px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; text-align: left;">🚨 Assault / Robbery Threat</button>
            <button class="sos-trigger-btn" data-type="Medical Emergency" style="background: #ea580c; color: white; padding: 12px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; text-align: left;">🚑 Medical Emergency</button>
          </div>
          <button id="btn-close-sos" style="background: none; border: none; color: #94a3b8; cursor: pointer; width: 100%; font-size: 0.85rem;">Close</button>
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
