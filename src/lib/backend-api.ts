/**
 * Backend API Client for Render Express Server
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.warn('Backend server is offline or unreachable:', error.message);
    return { status: 'offline', error: error.message };
  }
}

export async function fetchBackendAnalyticsSummary() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/analytics/summary`);
    if (!res.ok) throw new Error(`Analytics fetch failed: ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error('Error fetching backend analytics:', error);
    return null;
  }
}
