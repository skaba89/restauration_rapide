'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const createIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        ${icon}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const driverIcon = createIcon('#22c55e', '🛵');
const restaurantIcon = createIcon('#f97316', '🍳');
const destinationIcon = createIcon('#ef4444', '🏠');

interface Location {
  lat: number;
  lng: number;
}

interface RealMapProps {
  driverLocation: Location;
  restaurantLocation: Location;
  destinationLocation: Location;
  driverName?: string;
  destinationAddress?: string;
  showRoute?: boolean;
  className?: string;
}

// Component to fit bounds
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  
  // Use a ref to track if we've already fit bounds
  const mapInstance = map;
  const boundsKey = `${bounds[0][0]}-${bounds[0][1]}-${bounds[1][0]}-${bounds[1][1]}`;
  
  mapInstance.fitBounds(bounds, { padding: [50, 50] });
  
  return null;
}

export default function RealMap({
  driverLocation,
  restaurantLocation,
  destinationLocation,
  driverName = 'Livreur',
  destinationAddress = 'Votre adresse',
  showRoute = true,
  className = 'h-64',
}: RealMapProps) {
  const bounds: L.LatLngBoundsExpression = [
    [restaurantLocation.lat, restaurantLocation.lng],
    [destinationLocation.lat, destinationLocation.lng],
  ];

  // Create route path (simplified - in production use OpenRouteService API)
  const routePath: [number, number][] = [
    [restaurantLocation.lat, restaurantLocation.lng],
    [driverLocation.lat, driverLocation.lng],
    [destinationLocation.lat, destinationLocation.lng],
  ];

  return (
    <div className={`${className} rounded-lg overflow-hidden relative z-0`}>
      <MapContainer
        bounds={bounds}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Restaurant Marker */}
        <Marker 
          position={[restaurantLocation.lat, restaurantLocation.lng]} 
          icon={restaurantIcon}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold">Restaurant</p>
              <p className="text-sm text-muted-foreground">Le Petit Maquis</p>
            </div>
          </Popup>
        </Marker>

        {/* Driver Marker */}
        <Marker 
          position={[driverLocation.lat, driverLocation.lng]} 
          icon={driverIcon}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold">{driverName}</p>
              <p className="text-sm text-green-600">En route vers vous</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker 
          position={[destinationLocation.lat, destinationLocation.lng]} 
          icon={destinationIcon}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold">Votre position</p>
              <p className="text-sm text-muted-foreground">{destinationAddress}</p>
            </div>
          </Popup>
        </Marker>

        {/* Route Line */}
        {showRoute && (
          <Polyline 
            positions={routePath}
            pathOptions={{
              color: '#f97316',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

// Driver Map Component
export function DriverMap({
  driverLocation,
  orders,
  className = 'h-full',
}: {
  driverLocation: Location;
  orders: Array<{
    id: string;
    location: Location;
    address: string;
    status: string;
  }>;
  className?: string;
}) {
  const center: [number, number] = [driverLocation.lat, driverLocation.lng];

  return (
    <div className={`${className} rounded-lg overflow-hidden relative z-0`}>
      <MapContainer
        center={center}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Driver Marker */}
        <Marker 
          position={[driverLocation.lat, driverLocation.lng]} 
          icon={driverIcon}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold">Votre position</p>
            </div>
          </Popup>
        </Marker>

        {/* Order Markers */}
        {orders.map((order) => (
          <Marker 
            key={order.id}
            position={[order.location.lat, order.location.lng]} 
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold">{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.address}</p>
                <p className="text-xs text-green-600 mt-1">{order.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
