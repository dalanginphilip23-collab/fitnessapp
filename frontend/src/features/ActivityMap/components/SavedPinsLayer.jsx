import { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { getSavedPinIcon } from './mapIcons';

// Renders the user's saved location pins. When `addMode` is active, a click
// anywhere on the map is captured and forwarded so the parent can create a
// pin at that exact spot. Each pin opens a popup with its name + delete.

const SavedPinsLayer = ({ pins = [], onDeletePin, addMode, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!addMode) return undefined;

    const handleClick = (e) => {
      onMapClick?.([e.latlng.lat, e.latlng.lng]);
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [addMode, map, onMapClick]);

  return (
    <>
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.latitude, pin.longitude]}
          icon={getSavedPinIcon()}
        >
          <Popup>
            <div className="min-w-32">
              <p className="font-bold text-[var(--text-primary)] text-xs">
                {pin.name || 'Saved pin'}
              </p>
              <p className="text-[9px] text-[var(--text-muted)] mt-0.5">
                {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
              </p>
              <button
                onClick={() => onDeletePin?.(pin)}
                className="mt-2 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg px-2 py-1"
              >
                Remove pin
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default SavedPinsLayer;
