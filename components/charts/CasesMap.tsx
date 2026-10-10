"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { casesApi, CaseMapPin } from "@/lib/casesApi";
import { CASE_STATUS_META } from "@/lib/statusMeta";

// Matches globals.css's status-* tokens (danger/pending/accent/neutral) — kept as literal hex
// here because Leaflet's divIcon renders raw HTML/CSS outside Tailwind's class pipeline.
const PRIORITY_COLORS: Record<CaseMapPin["priority"], string> = {
  CRITICAL: "#991b1b",
  HIGH: "#92400e",
  NORMAL: "#8b6a3e",
  LOW: "#57534e",
};

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// Geographic center of India — the sane default before any pins have loaded (or if geocoding
// hasn't resolved coordinates for any open case yet).
const INDIA_CENTER: [number, number] = [22.9734, 78.6569];

export default function CasesMap() {
  const router = useRouter();
  const [pins, setPins] = useState<CaseMapPin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casesApi
      .mapData()
      .then(setPins)
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-72 items-center justify-center text-xs text-text-muted">Loading map…</div>;
  }

  if (pins.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-center text-xs text-text-muted">
        No open cases have a mapped location yet — pins appear once a request&apos;s address is geocoded.
      </div>
    );
  }

  const center: [number, number] = [
    pins.reduce((sum, p) => sum + p.lat, 0) / pins.length,
    pins.reduce((sum, p) => sum + p.lng, 0) / pins.length,
  ];

  return (
    <MapContainer center={pins.length ? center : INDIA_CENTER} zoom={pins.length > 1 ? 6 : 11} scrollWheelZoom={false} className="h-72 w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <Marker key={pin._id} position={[pin.lat, pin.lng]} icon={pinIcon(PRIORITY_COLORS[pin.priority])}>
          <Popup>
            <div className="text-xs">
              <p className="font-semibold text-text-primary">{pin.caseId}</p>
              <p className="mt-0.5 text-text-secondary">
                {CASE_STATUS_META[pin.status].label} · {pin.city}
              </p>
              <button onClick={() => router.push(`/cases/${pin._id}`)} className="mt-1.5 font-semibold text-accent hover:underline">
                View Case →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
