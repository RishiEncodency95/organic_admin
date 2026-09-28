export const IHWE_API_URL =
  process.env.NEXT_PUBLIC_IHWE_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:5001/api");

export const ihweApi = {
  getCorporateVisitors: async () => {
    try {
      const res = await fetch(`${IHWE_API_URL}/corporate-visitors`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch {
      return [];
    }
  },
  getGeneralVisitors: async () => {
    try {
      const res = await fetch(`${IHWE_API_URL}/general-visitors`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch {
      return [];
    }
  },
  getInternationalVisitors: async () => {
    try {
      const res = await fetch(`${IHWE_API_URL}/international-visitors`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch {
      return [];
    }
  },
  getBuyers: async () => {
    try {
      const res = await fetch(`${IHWE_API_URL}/buyer-registration`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch {
      return [];
    }
  },
  getInternationalBuyers: async () => {
    try {
      const res = await fetch(`${IHWE_API_URL}/international-buyer`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch {
      return [];
    }
  },
};
