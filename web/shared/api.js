/**
 * Keepsafe - Shared API Client & LocalStorage Repository
 */
import { INITIAL_INCIDENTS, INITIAL_GEOFENCES, INCIDENT_CATEGORIES, SEVERITY_LEVELS } from './mockData.js';

const STORAGE_KEYS = {
  INCIDENTS: 'keepsafe_incidents_v1',
  GEOFENCES: 'keepsafe_geofences_v1',
  ACTIVE_SOS: 'keepsafe_active_sos_v1'
};

// Initialize default state in localStorage if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GEOFENCES)) {
    localStorage.setItem(STORAGE_KEYS.GEOFENCES, JSON.stringify(INITIAL_GEOFENCES));
  }
}

initializeStorage();

const delay = (ms = 250) => new Promise(res => setTimeout(res, ms));

export const KeepsafeAPI = {
  // Fetch Incidents
  async getIncidents(filters = {}) {
    await delay(150);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.INCIDENTS) || '[]');
    let result = [...data];

    if (filters.category && filters.category !== 'all') {
      result = result.filter(i => i.category === filters.category);
    }
    if (filters.severity && filters.severity !== 'all') {
      result = result.filter(i => i.severity === filters.severity);
    }
    if (filters.city && filters.city !== 'all') {
      result = result.filter(i => i.city.toLowerCase() === filters.city.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.locationName.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }

    return result;
  },

  // Get Incident by ID
  async getIncidentById(id) {
    await delay(100);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.INCIDENTS) || '[]');
    return data.find(i => i.id === id) || null;
  },

  // Report New Incident
  async createIncident(incidentData) {
    await delay(300);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.INCIDENTS) || '[]');
    const newIncident = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      title: incidentData.title || 'Untitled Incident',
      category: incidentData.category || 'hazard',
      severity: incidentData.severity || 'medium',
      city: incidentData.city || 'Nairobi',
      locationName: incidentData.locationName || 'Nairobi Area',
      coordinates: incidentData.coordinates || { lat: -1.286389, lng: 36.817223 },
      route: incidentData.route || 'Local Commute Corridor',
      description: incidentData.description || '',
      upvotes: 1,
      downvotes: 0,
      status: 'active',
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      reporter: incidentData.reporter || 'ActiveCommuter',
      verifiedByCommunity: false,
      comments: []
    };

    const updated = [newIncident, ...data];
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));
    return newIncident;
  },

  // Upvote / Verify Incident
  async upvoteIncident(id) {
    await delay(150);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.INCIDENTS) || '[]');
    const index = data.findIndex(i => i.id === id);
    if (index !== -1) {
      data[index].upvotes += 1;
      if (data[index].upvotes >= 5) {
        data[index].verifiedByCommunity = true;
      }
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(data));
      return data[index];
    }
    return null;
  },

  // Add Comment to Incident
  async addComment(incidentId, author, text) {
    await delay(200);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.INCIDENTS) || '[]');
    const incident = data.find(i => i.id === incidentId);
    if (incident) {
      const newComment = {
        id: `c-${Date.now()}`,
        author: author || 'KenyanCommuter',
        text: text,
        timestamp: 'Just now'
      };
      incident.comments.push(newComment);
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(data));
      return incident;
    }
    return null;
  },

  // Get Geofences
  async getGeofences() {
    await delay(100);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GEOFENCES) || '[]');
  },

  // Trigger SOS Alert
  async triggerSOS(sosPayload) {
    await delay(250);
    const sosData = {
      id: `sos-${Date.now()}`,
      userId: sosPayload.userId || 'usr_commuter_99',
      userName: sosPayload.userName || 'Juma Omondi',
      userPhone: sosPayload.userPhone || '+254 712 345 678',
      locationName: sosPayload.locationName || 'Live Location: Thika Road, Roysambu Flyover',
      coordinates: sosPayload.coordinates || { lat: -1.2185, lng: 36.8850 },
      emergencyType: sosPayload.emergencyType || 'Immediate Danger / Assault Threat',
      timestamp: new Date().toISOString(),
      status: 'active',
      dispatchTarget: 'National Police 999 & Red Cross 1199'
    };
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SOS, JSON.stringify(sosData));
    return sosData;
  },

  // Get Active SOS Alert
  async getActiveSOS() {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SOS);
    return data ? JSON.parse(data) : null;
  },

  // Resolve SOS Alert
  async resolveSOS() {
    await delay(150);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SOS);
    return true;
  }
};
