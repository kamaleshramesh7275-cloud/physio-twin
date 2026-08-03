const API_BASE = `http://${window.location.hostname}:8000`;

export const api = {
  async getDashboard(userId: string) {
    const res = await fetch(`${API_BASE}/analytics/dashboard/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return res.json();
  },
  
  async getWeeklyLetter(userId: string, apiKey: string) {
    const res = await fetch(`${API_BASE}/analytics/weekly-letter/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ api_key: apiKey }),
    });
    if (!res.ok) throw new Error("Failed to generate letter");
    return res.json();
  },

  async submitVisionSession(data: any) {
    const res = await fetch(`${API_BASE}/sessions/vision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit session");
    return res.json();
  },

  async getSessionHistory(userId: string) {
    const res = await fetch(`${API_BASE}/sessions/history/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch session history");
    return res.json();
  },

  async getDeepInsights(userId: string, apiKey: string) {
    const res = await fetch(`${API_BASE}/analytics/deep-insights/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ api_key: apiKey }),
    });
    if (!res.ok) throw new Error("Failed to generate deep insights");
    return res.json();
  }
};
