import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const DEFAULT_LATITUDE = 9.5919;
export const DEFAULT_LONGITUDE = 77.9732;

export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export function isValidLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}

export function isValidCoordinate(latitude: unknown, longitude: unknown): boolean {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
}

let defaultIcon: L.Icon | undefined;
function getDefaultIcon(): L.Icon {
  if (!defaultIcon) {
    defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }
  return defaultIcon;
}

L.Marker.prototype.options.icon = getDefaultIcon();

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  scrollWheelZoom?: boolean;
  draggable?: boolean;
  onLocationChange?: (latitude: number, longitude: number) => void;
  popupText?: string;
  className?: string;
}

function ClickHandler({
  enabled,
  onLocationChange,
}: {
  enabled: boolean;
  onLocationChange?: (latitude: number, longitude: number) => void;
}) {
  const active = useRef(enabled);
  useEffect(() => {
    active.current = enabled;
  }, [enabled]);

  useMapEvents({
    click(e) {
      if (active.current && onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function CenterRefresher({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);
  return null;
}

export default function LeafletMap({
  latitude,
  longitude,
  zoom = 16,
  scrollWheelZoom = false,
  draggable = false,
  onLocationChange,
  popupText,
  className,
}: LeafletMapProps) {
  const lat = isValidLatitude(latitude) ? latitude : DEFAULT_LATITUDE;
  const lng = isValidLongitude(longitude) ? longitude : DEFAULT_LONGITUDE;
  const editable = Boolean(onLocationChange);

  return (
    <div className={className ?? 'map-container'}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        className="h-full w-full"
        style={{ height: '100%', minHeight: 300 }}
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        {editable && (
          <ClickHandler enabled={editable} onLocationChange={onLocationChange} />
        )}
        <Marker
          position={[lat, lng]}
          draggable={editable || draggable}
          eventHandlers={
            editable && onLocationChange
              ? {
                  dragend: (e) => {
                    const marker = e.target as L.Marker;
                    const pos = marker.getLatLng();
                    onLocationChange(pos.lat, pos.lng);
                  },
                }
              : undefined
          }
        >
          {popupText && <Popup>{popupText}</Popup>}
        </Marker>
        {editable && <CenterRefresher latitude={lat} longitude={lng} />}
      </MapContainer>
    </div>
  );
}
