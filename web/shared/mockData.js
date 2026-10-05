/**
 * Keepsafe - Shared Mock Data for Kenyan Commuter Safety Platform
 */

export const KENYAN_CITIES = [
  { id: 'nairobi', name: 'Nairobi', lat: -1.286389, lng: 36.817223 },
  { id: 'mombasa', name: 'MOMBASA', lat: -4.043477, lng: 39.668206 },
  { id: 'kisumu', name: 'KISUMU', lat: -0.091702, lng: 34.767956 },
  { id: 'nakuru', name: 'Nakuru', lat: -0.303099, lng: 36.080026 },
  { id: 'eldoret', name: 'Eldoret', lat: 0.514277, lng: 35.269780 }
];

export const INCIDENT_CATEGORIES = {
  ROBBERY: { id: 'robbery', label: 'Robbery / Theft', icon: 'shield-alert', color: '#ef4444' },
  HARASSMENT: { id: 'harassment', label: 'Harassment', icon: 'user-x', color: '#f97316' },
  SCAM: { id: 'scam', label: 'Matatu / Transit Scam', icon: 'alert-triangle', color: '#eab308' },
  HAZARD: { id: 'hazard', label: 'Road Hazard', icon: 'alert-circle', color: '#3b82f6' },
  FLOODING: { id: 'flooding', label: 'Flooding / Weather', icon: 'cloud-rain', color: '#06b6d4' }
};

export const SEVERITY_LEVELS = {
  LOW: { id: 'low', label: 'Low Risk', color: '#10b981', badgeClass: 'badge-low' },
  MEDIUM: { id: 'medium', label: 'Medium Risk', color: '#f59e0b', badgeClass: 'badge-medium' },
  HIGH: { id: 'high', label: 'High Danger', color: '#f97316', badgeClass: 'badge-high' },
  CRITICAL: { id: 'critical', label: 'CRITICAL EMERGENCY', color: '#ef4444', badgeClass: 'badge-critical' }
};

export const INITIAL_GEOFENCES = [
  {
    id: 'geo-1',
    name: 'Nairobi CBD High-Density Zone',
    city: 'Nairobi',
    center: { lat: -1.2845, lng: 36.8248 },
    radiusMeters: 1200,
    riskLevel: 'caution',
    activeIncidentsCount: 5,
    description: 'High commuter density near Kencom, Globe Roundabout, and Fire Station. Increased reports of phone snatching during rush hours (5 PM - 8 PM).',
    recommendedAction: 'Keep smartphones concealed when boarding matatus near Koja and Otieno Oyoo street.'
  },
  {
    id: 'geo-2',
    name: 'Thika Superhighway (Githurai 45 - Roysambu)',
    city: 'Nairobi',
    center: { lat: -1.2173, lng: 36.8872 },
    radiusMeters: 2500,
    riskLevel: 'danger',
    activeIncidentsCount: 8,
    description: 'Frequent matatu speed racing, rogue conductor fare extortion, and pedestrian crossover hazards.',
    recommendedAction: 'Use designated footbridges at Roysambu and avoid late night non-standard route matatus.'
  },
  {
    id: 'geo-3',
    name: 'Mombasa Road Flood & Construction Corridor',
    city: 'Nairobi',
    center: { lat: -1.3325, lng: 36.8610 },
    radiusMeters: 3000,
    riskLevel: 'caution',
    activeIncidentsCount: 3,
    description: 'Drainage overflow near Bellevue and Cabanas during rains causes severe traffic gridlock and stalled vehicles.',
    recommendedAction: 'Commuters advised to check real-time water levels before using the lower deck service lanes.'
  },
  {
    id: 'geo-4',
    name: 'Nakuru Highway - Limuru Escarpment Fog Zone',
    city: 'Nakuru',
    center: { lat: -1.1085, lng: 36.6432 },
    radiusMeters: 4000,
    riskLevel: 'safe',
    activeIncidentsCount: 1,
    description: 'Heavy fog reduces visibility below 20 meters early morning and late evening.',
    recommendedAction: 'Ensure fog lights are on and maintain a 50m vehicle gap.'
  }
];

export const INITIAL_INCIDENTS = [
  {
    id: 'inc-101',
    title: 'Boda-boda Phone Snatching at Globe Flyover',
    category: 'robbery',
    severity: 'high',
    city: 'Nairobi',
    locationName: 'Globe Cinema Roundabout, Nairobi CBD',
    coordinates: { lat: -1.2801, lng: 36.8205 },
    route: 'Kipande Road / Slip Road',
    description: 'Two riders on an unmarked red motorcycle snatched a phone from a passenger looking out of a matatu window during slow traffic.',
    upvotes: 24,
    downvotes: 1,
    status: 'active',
    timestamp: '15 mins ago',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    reporter: 'Commuter_Kev',
    verifiedByCommunity: true,
    comments: [
      { id: 'c1', author: 'NairobiCommuter', text: 'This spot is getting worse after 6 PM! Be extra careful near the flyover window.', timestamp: '10 mins ago' },
      { id: 'c2', author: 'SafiriSalama', text: 'Polisi patrol team was spotted near Slip Road 5 mins ago.', timestamp: '4 mins ago' }
    ]
  },
  {
    id: 'inc-102',
    title: 'Conductor Fare Extortion on Route 44 Matatu',
    category: 'scam',
    severity: 'medium',
    city: 'Nairobi',
    locationName: 'Roysambu Stage, Thika Road',
    coordinates: { lat: -1.2185, lng: 36.8850 },
    route: 'Thika Superhighway',
    description: 'Crew doubled the agreed KES 70 fare to KES 150 midway through the journey and refused to drop off passengers who protested.',
    upvotes: 18,
    downvotes: 2,
    status: 'active',
    timestamp: '42 mins ago',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    reporter: 'Wanjiku_M',
    verifiedByCommunity: true,
    comments: [
      { id: 'c3', author: 'MatatuWatch', text: 'Sacco registration registration plate KCX 412Y reported to NTSA hotline.', timestamp: '20 mins ago' }
    ]
  },
  {
    id: 'inc-103',
    title: 'Flash Flooding under Bellevue Flyover',
    category: 'flooding',
    severity: 'high',
    city: 'Nairobi',
    locationName: 'Mombasa Road, Bellevue Interchange',
    coordinates: { lat: -1.3280, lng: 36.8480 },
    route: 'MOMBASA ROAD',
    description: 'Heavy downpour caused deep water pooling across 2 lanes. Small cars stalling. Expressway lower deck impassable.',
    upvotes: 45,
    downvotes: 0,
    status: 'active',
    timestamp: '1 hour ago',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    reporter: 'RoadSafetyKE',
    verifiedByCommunity: true,
    comments: [
      { id: 'c4', author: 'DriverJohn', text: 'Use Southern Bypass option if heading towards JKIA!', timestamp: '35 mins ago' }
    ]
  },
  {
    id: 'inc-104',
    title: 'Street Lighting Failure & Mugging Alert',
    category: 'robbery',
    severity: 'critical',
    city: 'Nairobi',
    locationName: 'Ngara Bus Stop Footbridge',
    coordinates: { lat: -1.2750, lng: 36.8280 },
    route: 'Murang\'a Road',
    description: 'All street lights are out between Ngara stage and Fig Tree. Gang of three targeting lone pedestrians descending footbridge stairs.',
    upvotes: 62,
    downvotes: 1,
    status: 'active',
    timestamp: '2 hours ago',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    reporter: 'NightCommuter',
    verifiedByCommunity: true,
    comments: [
      { id: 'c5', author: 'Amina_S', text: 'Please walk in groups if exiting matatus at Ngara tonight!', timestamp: '1 hour ago' }
    ]
  },
  {
    id: 'inc-105',
    title: 'Deep Pothole & Broken Axle Hazard',
    category: 'hazard',
    severity: 'low',
    city: 'MOMBASA',
    locationName: 'Nyali Bridge Approach',
    coordinates: { lat: -4.0480, lng: 39.6750 },
    route: 'Mombasa - Malindi Highway',
    description: 'Large unmarked pothole right after the bridge hump causing abrupt braking and near collisions.',
    upvotes: 11,
    downvotes: 0,
    status: 'active',
    timestamp: '3 hours ago',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    reporter: 'CoastDriver',
    verifiedByCommunity: false,
    comments: []
  },
  {
    id: 'inc-106',
    title: 'Harassment & Unsolicited Luggage Grabbing',
    category: 'harassment',
    severity: 'medium',
    city: 'KISUMU',
    locationName: 'Kisumu Main Bus Park',
    coordinates: { lat: -0.0950, lng: 34.7620 },
    route: 'Oginga Odinga Street',
    description: 'Aggressive luggage handlers seizing bags from arriving passengers and demanding illegal handling fees.',
    upvotes: 29,
    downvotes: 3,
    status: 'active',
    timestamp: '4 hours ago',
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    reporter: 'Otieno_B',
    verifiedByCommunity: true,
    comments: []
  }
];

export const EMERGENCY_CONTACTS = [
  { name: 'National Police Service', phone: '999 / 112', type: 'Police' },
  { name: 'Kenya Red Cross Ambulance', phone: '1199', type: 'Medical' },
  { name: 'St John Ambulance Kenya', phone: '0721 225 285', type: 'Medical' },
  { name: 'NTSA Road Safety Patrol', phone: '0709 932 000', type: 'Traffic' },
  { name: 'Gender-Based Violence Helpline', phone: '1195', type: 'Support' }
];
