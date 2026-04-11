import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '0.75rem',
  marginTop: '1rem'
};

const defaultCenter = {
  lat: 20.5937, // Center of India
  lng: 78.9629
};

const libraries = ['places'];

export default function AddressSelector({ value, onChange, placeholder = 'Search for your address...' }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [manualAddress, setManualAddress] = useState(value || '');
  const [manualPincode, setManualPincode] = useState('');

  // Update manual address if value changes from outside
  useEffect(() => {
    if (value && value !== manualAddress) {
      setManualAddress(value);
    }
  }, [value]);

  const handleManualChange = (addr, pin) => {
    setManualAddress(addr);
    setManualPincode(pin);
    onChange({
      address: addr,
      pincode: pin,
      lat: null,
      lng: null
    });
  };

  if (!apiKey || apiKey === '.') {
    return (
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={manualAddress}
            onChange={(e) => handleManualChange(e.target.value, manualPincode)}
            placeholder={placeholder}
            rows="2"
            className="w-full px-4 py-2 border border-blue-100 bg-blue-50/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition resize-none"
          />
        </div>
        <div>
          <input
            type="text"
            value={manualPincode}
            onChange={(e) => handleManualChange(manualAddress, e.target.value.replace(/\D/g, ''))}
            placeholder="Pincode"
            maxLength="6"
            className="w-full px-4 py-2 border border-blue-100 bg-blue-50/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
          />
        </div>
        <p className="text-[10px] text-gray-400 italic">Google Maps is disabled. Please enter address manually.</p>
      </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [map, setMap] = useState(null);
  const searchInputRef = useRef(null);

  const {
    ready,
    value: searchValue,
    suggestions: { status, data },
    setValue: setSearchValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'in' } // Restrict to India by default
    },
    debounce: 300,
  });

  // Effect to set initial search value if passed from parent
  useEffect(() => {
    if (value && !searchValue) {
      setSearchValue(value, false);
    }
  }, [value, searchValue, setSearchValue]);

  const handleSelect = async (suggestion) => {
    const address = suggestion.description;
    setSearchValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      
      // Extract pincode
      const pincode = results[0].address_components.find(c => c.types.includes('postal_code'))?.long_name || '';
      
      onChange({
        address,
        pincode,
        lat,
        lng
      });

      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(16);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
  };

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });

    try {
      const results = await getGeocode({ location: { lat, lng } });
      const address = results[0].formatted_address;
      setSearchValue(address, false);

      const pincode = results[0].address_components.find(c => c.types.includes('postal_code'))?.long_name || '';

      onChange({
        address,
        pincode,
        lat,
        lng
      });
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  }, [onChange, setSearchValue]);

  if (loadError) return <div className="text-red-500 text-sm">Error loading Google Maps. Is your API key valid?</div>;
  if (!isLoaded) return <div className="animate-pulse bg-gray-100 h-10 rounded-lg"></div>;

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={!ready}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition pr-10"
        />
        {searchValue && (
          <button 
            type="button"
            onClick={() => { setSearchValue(''); clearSuggestions(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestions Popover */}
      {status === "OK" && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {data.map((suggestion) => (
            <li 
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm border-b last:border-0 border-gray-100 flex items-start gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-1 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{suggestion.description}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Interactive Map */}
      <div className="relative group">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={5}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {markerPosition && <Marker position={markerPosition} animation={2} />}
        </GoogleMap>
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-600 pointer-events-none">
          Click on map to pick location
        </div>
      </div>
    </div>
  );
}
