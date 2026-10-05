/**
 * Keepsafe - Template A Application Script (Minimal & Clean)
 */
import { globalStore } from '../shared/state.js';
import { renderInteractiveMap } from '../shared/mapComponent.js';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS, EMERGENCY_CONTACTS } from '../shared/mockData.js';

const mainContainer = document.getElementById('main-container');
const modalRoot = document.getElementById('modal-root');

// Tabs
const tabMap = document.getElementById('tab-map');
const tabReport = document.getElementById('tab-report');
const btnHeaderSos = document.getElementById('btn-header-sos');
const btnFloatingSos = document.getElementById('btn-floating-sos');

tabMap.addEventListener('click', () => globalStore.setActiveView('map'));
tabReport.addEventListener('click', () => globalStore.setActiveView('report'));
btnHeaderSos.addEventListener('click', () => globalStore.openSOSModal());
btnFloatingSos.addEventListener('click', () => globalStore.openSOSModal());

// Subscribe to store updates
globalStore.subscribe(state => render(state));

// Initial load
globalStore.loadInitialData();

function render(state) {
  // Update Tab States
  tabMap.classList.toggle('active', state.activeView === 'map');
  tabReport.classList.toggle('active', state.activeView === 'report');

  // Render main screen
  if (state.activeView === 'map') {
    renderMapAndFeedScreen(state);
  } else if (state.activeView === 'report') {
    renderReportFormScreen(state);
  } else if (state.activeView === 'detail' && state.activeIncident) {
    renderMapAndFeedScreen(state); // Keep main view in background
    renderIncidentDetailModal(state.activeIncident);
  }

  // Render SOS modal if open
  if (state.sosModalOpen) {
    renderSOSModal(state.activeSOS);
  } else if (state.activeView !== 'detail') {
    modalRoot.innerHTML = '';
  }
}

function renderMapAndFeedScreen(state) {
  mainContainer.innerHTML = `
    <div class="section-header">
      <div>
        <h1 class="section-title">Commuter Safety Feed & Live Geofences</h1>
        <p class="section-subtitle">Real-time alerts and community reports along major Kenyan transit corridors</p>
      </div>
      <button class="nav-tab active" id="btn-quick-report" style="border: 1px solid var(--brand-emerald); color: var(--brand-emerald);">
        + Submit Alert Report
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <input type="text" class="search-input" id="search-input" placeholder="🔍 Search routes, landmarks (e.g. Thika Rd, Kencom, Bellevue)..." value="${state.filters.search}">
      
      <select class="filter-select" id="filter-category">
        <option value="all">All Categories</option>
        ${Object.values(INCIDENT_CATEGORIES).map(cat => `
          <option value="${cat.id}" ${state.filters.category === cat.id ? 'selected' : ''}>${cat.label}</option>
        `).join('')}
      </select>

      <select class="filter-select" id="filter-severity">
        <option value="all">All Risk Levels</option>
        ${Object.values(SEVERITY_LEVELS).map(sev => `
          <option value="${sev.id}" ${state.filters.severity === sev.id ? 'selected' : ''}>${sev.label}</option>
        `).join('')}
      </select>

      <select class="filter-select" id="filter-city">
        <option value="all">All Cities</option>
        <option value="nairobi" ${state.filters.city === 'nairobi' ? 'selected' : ''}>Nairobi</option>
        <option value="mombasa" ${state.filters.city === 'mombasa' ? 'selected' : ''}>Mombasa</option>
        <option value="kisumu" ${state.filters.city === 'kisumu' ? 'selected' : ''}>Kisumu</option>
      </select>
    </div>

    <!-- Split View: Map Left, Cards Right -->
    <div class="split-view">
      <div>
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); height: 500px;" id="map-target">
          <!-- Interactive Map Rendered Here -->
        </div>
      </div>

      <div class="cards-list">
        ${state.incidents.length === 0 ? `
          <div style="padding: 2rem; text-align: center; background: var(--bg-surface); border-radius: 12px; color: var(--text-muted);">
            No safety incidents found matching your active filters.
          </div>
        ` : state.incidents.map(inc => {
          const category = INCIDENT_CATEGORIES[inc.category.toUpperCase()] || INCIDENT_CATEGORIES.HAZARD;
          const severity = SEVERITY_LEVELS[inc.severity.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;
          return `
            <div class="incident-card" data-id="${inc.id}">
              <div class="card-top">
                <span class="category-pill">📍 ${inc.city} • ${inc.route}</span>
                <span class="badge ${severity.badgeClass}">${severity.label}</span>
              </div>
              <h3 class="card-title">${inc.title}</h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">${inc.description.slice(0, 110)}...</p>
              <div class="card-meta">
                <span>📍 ${inc.locationName}</span>
                <span>⏱️ ${inc.timestamp}</span>
              </div>
              <div class="card-footer">
                <span style="color: var(--brand-emerald); font-weight: 600;">👍 ${inc.upvotes} Community Verifications</span>
                <span style="color: var(--brand-navy); font-weight: 500;">View Details & Rules →</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach Event Listeners
  document.getElementById('btn-quick-report')?.addEventListener('click', () => globalStore.setActiveView('report'));
  
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', (e) => globalStore.setFilters({ search: e.target.value }));

  document.getElementById('filter-category')?.addEventListener('change', (e) => globalStore.setFilters({ category: e.target.value }));
  document.getElementById('filter-severity')?.addEventListener('change', (e) => globalStore.setFilters({ severity: e.target.value }));
  document.getElementById('filter-city')?.addEventListener('change', (e) => globalStore.setFilters({ city: e.target.value }));

  document.querySelectorAll('.incident-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const item = state.incidents.find(i => i.id === id);
      if (item) globalStore.openIncidentDetail(item);
    });
  });

  // Render Interactive Canvas Map
  const mapTarget = document.getElementById('map-target');
  if (mapTarget) {
    renderInteractiveMap(mapTarget, state.incidents, state.geofences, (selected) => {
      globalStore.openIncidentDetail(selected);
    });
  }
}

function renderReportFormScreen(state) {
  mainContainer.innerHTML = `
    <div style="max-width: 700px; margin: 0 auto; background: var(--bg-surface); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-md);">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">📢 Report a Commuter Incident</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">Help fellow Kenyan commuters stay safe by sharing accurate live route hazards or safety alerts.</p>
      
      <form id="report-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Incident Title *</label>
          <input type="text" id="report-title" required placeholder="e.g. Phone Snatching at Roysambu Footbridge" class="search-input" style="width: 100%;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Category *</label>
            <select id="report-category" class="filter-select" style="width: 100%;" required>
              ${Object.values(INCIDENT_CATEGORIES).map(cat => `
                <option value="${cat.id}">${cat.label}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Severity Risk Level *</label>
            <select id="report-severity" class="filter-select" style="width: 100%;" required>
              <option value="low">Low Risk (Informational)</option>
              <option value="medium" selected>Medium Risk (Caution)</option>
              <option value="high">High Danger (Avoid Route)</option>
              <option value="critical">Critical Emergency (Immediate Alert)</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">City / Region *</label>
            <select id="report-city" class="filter-select" style="width: 100%;" required>
              <option value="Nairobi">Nairobi</option>
              <option value="MOMBASA">Mombasa</option>
              <option value="KISUMU">Kisumu</option>
              <option value="Nakuru">Nakuru</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Route / Major Highway</label>
            <input type="text" id="report-route" placeholder="e.g. Thika Superhighway, Waiyaki Way" class="search-input" style="width: 100%;">
          </div>
        </div>

        <div>
          <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Exact Location / Landmark *</label>
          <input type="text" id="report-location" required placeholder="e.g. Near Kencom Bus Station entrance" class="search-input" style="width: 100%;">
        </div>

        <div>
          <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Detailed Description *</label>
          <textarea id="report-description" required rows="4" placeholder="Describe what happened, suspect descriptors, matatu sacco plates, or advice for commuters..." class="search-input" style="width: 100%; font-family: inherit;"></textarea>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" id="btn-cancel-report" class="nav-tab" style="padding: 10px 20px;">Cancel</button>
          <button type="submit" class="header-sos-btn" style="background-color: var(--brand-emerald); padding: 10px 24px;">Submit Safety Alert</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('btn-cancel-report')?.addEventListener('click', () => globalStore.setActiveView('map'));
  document.getElementById('report-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    globalStore.submitReport({
      title: document.getElementById('report-title').value,
      category: document.getElementById('report-category').value,
      severity: document.getElementById('report-severity').value,
      city: document.getElementById('report-city').value,
      route: document.getElementById('report-route').value || 'Local Transit Corridor',
      locationName: document.getElementById('report-location').value,
      description: document.getElementById('report-description').value,
      reporter: 'Verified_Commuter'
    });
  });
}

function renderIncidentDetailModal(incident) {
  const category = INCIDENT_CATEGORIES[incident.category.toUpperCase()] || INCIDENT_CATEGORIES.HAZARD;
  const severity = SEVERITY_LEVELS[incident.severity.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;

  modalRoot.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-container" style="padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div>
            <span class="badge ${severity.badgeClass}" style="margin-bottom: 8px;">${severity.label}</span>
            <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${incident.title}</h2>
          </div>
          <button id="btn-close-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.9rem;">
          <div style="margin-bottom: 6px;">📍 <strong>Location:</strong> ${incident.locationName} (${incident.city})</div>
          <div style="margin-bottom: 6px;">🛤️ <strong>Route Corridor:</strong> ${incident.route}</div>
          <div style="margin-bottom: 6px;">⏱️ <strong>Reported:</strong> ${incident.timestamp} by ${incident.reporter}</div>
          <div>🛡️ <strong>Verification Status:</strong> ${incident.verifiedByCommunity ? '<span style="color: var(--brand-emerald); font-weight: bold;">Verified by Community</span>' : 'Pending community confirmation'}</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-weight: 600; margin-bottom: 6px;">Incident Summary</h4>
          <p style="color: var(--text-secondary); line-height: 1.6;">${incident.description}</p>
        </div>

        <div style="margin-bottom: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <h4 style="font-weight: 600; margin-bottom: 10px;">Community Verifications & Upvotes</h4>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button id="btn-upvote-incident" style="background: #ecfdf5; color: var(--brand-emerald); border: 1px solid var(--brand-emerald); padding: 8px 16px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer;">
              👍 Upvote / Confirm Incident (${incident.upvotes})
            </button>
            <span style="font-size: 0.85rem; color: var(--text-muted);">5 upvotes automatically mark alert as verified.</span>
          </div>
        </div>

        <!-- Comments Section -->
        <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <h4 style="font-weight: 600; margin-bottom: 10px;">Commuter Discussion (${incident.comments.length})</h4>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem; max-height: 180px; overflow-y: auto;">
            ${incident.comments.map(c => `
              <div style="background: var(--bg-primary); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem;">
                <div style="font-weight: 600; color: var(--brand-navy);">${c.author} <span style="font-weight: normal; color: var(--text-muted); font-size: 0.75rem;">• ${c.timestamp}</span></div>
                <div style="color: var(--text-secondary);">${c.text}</div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; gap: 8px;">
            <input type="text" id="comment-input" placeholder="Add route update or tip..." class="search-input" style="flex: 1;">
            <button id="btn-send-comment" class="nav-tab active">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal')?.addEventListener('click', () => globalStore.setActiveView('map'));
  document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') globalStore.setActiveView('map');
  });

  document.getElementById('btn-upvote-incident')?.addEventListener('click', () => {
    globalStore.upvoteActiveIncident(incident.id);
  });
}

function renderSOSModal(activeSOS) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" id="sos-modal-backdrop">
      <div class="modal-container" style="border: 3px solid var(--brand-red); max-width: 550px;">
        
        <div style="background: var(--brand-red); color: white; padding: 1.25rem; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="font-size: 2.5rem; margin-bottom: 4px;">🚨</div>
          <h2 style="font-size: 1.6rem; font-weight: 800; letter-spacing: 0.02em;">KEEPSAFE EMERGENCY SOS</h2>
          <p style="font-size: 0.9rem; opacity: 0.9;">Instant Dispatch & GPS Broadcast to Kenyan Emergency Services</p>
        </div>

        <div style="padding: 1.5rem;">
          ${activeSOS ? `
            <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem;">
              <div style="color: #991b1b; font-weight: bold; font-size: 1.1rem; margin-bottom: 6px;">🔴 SOS DISPATCH ACTIVE & BROADCASTING</div>
              <div style="font-size: 0.85rem; color: #7f1d1d; margin-bottom: 4px;"><strong>User:</strong> ${activeSOS.userName} (${activeSOS.userPhone})</div>
              <div style="font-size: 0.85rem; color: #7f1d1d; margin-bottom: 4px;"><strong>Location:</strong> ${activeSOS.locationName}</div>
              <div style="font-size: 0.85rem; color: #7f1d1d;"><strong>Target:</strong> ${activeSOS.dispatchTarget}</div>
            </div>

            <button id="btn-cancel-sos" style="width: 100%; background: #0f172a; color: white; padding: 12px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">
              ✓ RESOLVE & CANCEL EMERGENCY ALERT
            </button>
          ` : `
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1.25rem; font-size: 0.95rem;">
              Select your emergency situation. Your live GPS coordinates will be immediately sent to nearby responders and trusted contacts.
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem;">
              <button class="sos-trigger-btn" data-type="Assault / Robbery Threat" style="background: #ef4444; color: white; padding: 12px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; text-align: left; display: flex; justify-content: space-between;">
                <span>🚨 Assault / Robbery Threat</span>
                <span>Dispatch Police →</span>
              </button>
              <button class="sos-trigger-btn" data-type="Medical Emergency / Accident" style="background: #f97316; color: white; padding: 12px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; text-align: left; display: flex; justify-content: space-between;">
                <span>🚑 Medical Emergency / Accident</span>
                <span>Red Cross 1199 →</span>
              </button>
              <button class="sos-trigger-btn" data-type="Matatu Hijack / Transit Extortion" style="background: #eab308; color: black; padding: 12px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; text-align: left; display: flex; justify-content: space-between;">
                <span>🚍 Matatu Extortion / Hijack</span>
                <span>NTSA Alert →</span>
              </button>
            </div>

            <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
              <h4 style="font-size: 0.85rem; font-weight: bold; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">Direct Emergency Lines</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem;">
                ${EMERGENCY_CONTACTS.map(c => `
                  <div style="background: var(--bg-primary); padding: 6px 10px; border-radius: 6px;">
                    <div style="font-weight: bold;">${c.name}</div>
                    <div style="color: var(--brand-emerald); font-weight: bold;">${c.phone}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="margin-top: 1.25rem; text-align: center;">
              <button id="btn-close-sos" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem;">Close Modal</button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-sos')?.addEventListener('click', () => globalStore.closeSOSModal());
  document.getElementById('btn-cancel-sos')?.addEventListener('click', () => globalStore.resolveActiveSOS());

  document.querySelectorAll('.sos-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      globalStore.triggerEmergencySOS(type);
    });
  });
}
