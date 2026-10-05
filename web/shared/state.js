/**
 * Keepsafe - Shared Global Reactive State Manager
 */
import { KeepsafeAPI } from './api.js';

class StateStore {
  constructor() {
    this.state = {
      incidents: [],
      geofences: [],
      activeIncident: null,
      activeView: 'map', // 'map' | 'report' | 'detail'
      activeSOS: null,
      sosModalOpen: false,
      filters: {
        category: 'all',
        severity: 'all',
        city: 'all',
        search: ''
      },
      loading: false,
      error: null
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // Actions
  async loadInitialData() {
    this.setState({ loading: true });
    try {
      const [incidents, geofences, activeSOS] = await Promise.all([
        KeepsafeAPI.getIncidents(this.state.filters),
        KeepsafeAPI.getGeofences(),
        KeepsafeAPI.getActiveSOS()
      ]);
      this.setState({
        incidents,
        geofences,
        activeSOS,
        loading: false
      });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  async setFilters(newFilters) {
    const updatedFilters = { ...this.state.filters, ...newFilters };
    this.setState({ filters: updatedFilters, loading: true });
    const incidents = await KeepsafeAPI.getIncidents(updatedFilters);
    this.setState({ incidents, loading: false });
  }

  setActiveView(view, incident = null) {
    this.setState({
      activeView: view,
      activeIncident: incident || (view === 'detail' ? this.state.activeIncident : null)
    });
  }

  openIncidentDetail(incident) {
    this.setState({
      activeIncident: incident,
      activeView: 'detail'
    });
  }

  async upvoteActiveIncident(id) {
    const updatedIncident = await KeepsafeAPI.upvoteIncident(id);
    if (updatedIncident) {
      const incidents = this.state.incidents.map(i => i.id === id ? updatedIncident : i);
      const activeIncident = this.state.activeIncident?.id === id ? updatedIncident : this.state.activeIncident;
      this.setState({ incidents, activeIncident });
    }
  }

  async submitReport(reportData) {
    this.setState({ loading: true });
    const created = await KeepsafeAPI.createIncident(reportData);
    const incidents = [created, ...this.state.incidents];
    this.setState({
      incidents,
      activeIncident: created,
      activeView: 'detail',
      loading: false
    });
  }

  async openSOSModal() {
    this.setState({ sosModalOpen: true });
  }

  async closeSOSModal() {
    this.setState({ sosModalOpen: false });
  }

  async triggerEmergencySOS(emergencyType) {
    this.setState({ loading: true });
    const sosData = await KeepsafeAPI.triggerSOS({ emergencyType });
    this.setState({
      activeSOS: sosData,
      sosModalOpen: true,
      loading: false
    });
  }

  async resolveActiveSOS() {
    await KeepsafeAPI.resolveSOS();
    this.setState({ activeSOS: null, sosModalOpen: false });
  }
}

export const globalStore = new StateStore();
