/**
 * Keepsafe - Shared Interactive Canvas/SVG Map Component
 * Renders an interactive map of Kenya routes & cities with Geofence zones,
 * active incident pins, zoom controls, and click callbacks.
 */

export function renderInteractiveMap(containerElement, incidents = [], geofences = [], onSelectIncident = null, darkMode = false) {
  if (!containerElement) return;

  const bgStyle = darkMode ? 'background: #090d16; color: #f8fafc;' : 'background: #0f172a; color: #ffffff;';

  // Generate Incident Pin Markers (Normalized coordinates relative to Kenya box)
  // Kenya lat: -4.5 to 4.5, lng: 34 to 41
  // Nairobi lat: -1.28, lng: 36.81
  const mapPins = incidents.map(inc => {
    // Convert lat/lng to percentage offset
    // Lat range: -0.0 to -4.2 -> Y offset
    // Lng range: 34.0 to 40.0 -> X offset
    const xPct = Math.min(Math.max(((inc.coordinates.lng - 34.5) / 5.5) * 100, 15), 85);
    const yPct = Math.min(Math.max(((-inc.coordinates.lat + 0.3) / 4.2) * 100, 15), 85);

    const pinColor = inc.severity === 'critical' ? '#ef4444' : inc.severity === 'high' ? '#f97316' : inc.severity === 'medium' ? '#f59e0b' : '#10b981';

    return `
      <div class="map-pin" 
           data-id="${inc.id}" 
           style="position: absolute; left: ${xPct}%; top: ${yPct}%; transform: translate(-50%, -50%); cursor: pointer; z-index: 10;"
           title="${inc.title}">
        <div style="
          width: 28px; 
          height: 28px; 
          background-color: ${pinColor}; 
          border: 2px solid white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          transition: transform 0.2s ease;
        " class="map-pin-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="
          position: absolute; 
          top: 32px; 
          left: 50%; 
          transform: translateX(-50%); 
          background: rgba(15, 23, 42, 0.9); 
          color: #f8fafc; 
          padding: 3px 8px; 
          border-radius: 4px; 
          font-size: 11px; 
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.2);
          pointer-events: none;
        ">${inc.title.slice(0, 22)}...</div>
      </div>
    `;
  }).join('');

  // Geofence Circle Overlays
  const geofenceOverlays = geofences.map(geo => {
    const xPct = Math.min(Math.max(((geo.center.lng - 34.5) / 5.5) * 100, 15), 85);
    const yPct = Math.min(Math.max(((-geo.center.lat + 0.3) / 4.2) * 100, 15), 85);
    const color = geo.riskLevel === 'danger' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)';
    const borderColor = geo.riskLevel === 'danger' ? '#ef4444' : '#f59e0b';

    return `
      <div style="
        position: absolute; 
        left: ${xPct}%; 
        top: ${yPct}%; 
        width: 130px; 
        height: 130px; 
        transform: translate(-50%, -50%); 
        border-radius: 50%; 
        background: ${color}; 
        border: 2px dashed ${borderColor};
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 10px; font-weight: bold; color: ${borderColor}; background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px;">
          ${geo.name.slice(0, 15)}
        </span>
      </div>
    `;
  }).join('');

  containerElement.innerHTML = `
    <div class="simulated-map" style="${bgStyle} width: 100%; height: 100%; min-height: 420px; position: relative; border-radius: 12px; overflow: hidden;">
      
      <!-- Map Background Grid & Vector Routes -->
      <svg style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.25;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <!-- Major Highway Vectors (A104 Thika Highway, A1 Mombasa Rd, A104 Nakuru) -->
        <path d="M 200 450 L 450 280 L 700 150" stroke="#38bdf8" stroke-width="3" fill="none" stroke-dasharray="5 5" />
        <path d="M 450 280 L 600 500 L 800 650" stroke="#38bdf8" stroke-width="3" fill="none" stroke-dasharray="5 5" />
      </svg>

      <!-- Geofence Circles -->
      ${geofenceOverlays}

      <!-- Interactive Pins -->
      ${mapPins}

      <!-- Map HUD & Controls Header -->
      <div style="
        position: absolute; 
        top: 12px; 
        left: 12px; 
        background: rgba(15, 23, 42, 0.85); 
        backdrop-filter: blur(8px); 
        padding: 8px 14px; 
        border-radius: 8px; 
        border: 1px solid rgba(255,255,255,0.15); 
        display: flex; 
        align-items: center; 
        gap: 10px;
        z-index: 20;
      ">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;" class="pulse-sos"></div>
        <span style="font-size: 12px; font-weight: 600; color: #f8fafc;">Live Geofence Radar: KENYA COMMUTE CORRIDORS</span>
      </div>

      <!-- Map Legend Footer -->
      <div style="
        position: absolute; 
        bottom: 12px; 
        right: 12px; 
        background: rgba(15, 23, 42, 0.85); 
        backdrop-filter: blur(8px); 
        padding: 6px 12px; 
        border-radius: 8px; 
        border: 1px solid rgba(255,255,255,0.15); 
        font-size: 11px;
        display: flex;
        gap: 12px;
        z-index: 20;
      ">
        <span style="color: #ef4444;">● Critical</span>
        <span style="color: #f97316;">● High</span>
        <span style="color: #f59e0b;">● Medium</span>
        <span style="color: #10b981;">● Safe</span>
      </div>
    </div>
  `;

  // Attach event listeners to pins
  if (onSelectIncident) {
    const pins = containerElement.querySelectorAll('.map-pin');
    pins.forEach(pin => {
      pin.addEventListener('click', (e) => {
        const id = pin.getAttribute('data-id');
        const selected = incidents.find(i => i.id === id);
        if (selected) onSelectIncident(selected);
      });
    });
  }
}
