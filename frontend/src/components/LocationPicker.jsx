import { useState } from 'react';
import { StateSelect, CitySelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';

function LocationPicker() {
  const [stateId, setStateId] = useState(0);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // 101 is the numeric ID for India in this library ('IN' country code)
  const INDIA_COUNTRY_ID = 101; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px' }}>
      <div>
        <label>Select State</label>
        <StateSelect
          countryid={INDIA_COUNTRY_ID}
          onChange={(state) => {
            setStateId(state.id);
            setSelectedState(state.name);
            setSelectedCity(null); // Reset city when state changes
          }}
          placeHolder="Select State"
        />
      </div>

      <div>
        <label>Select City</label>
        <CitySelect
          countryid={INDIA_COUNTRY_ID}
          stateid={stateId}
          onChange={(city) => setSelectedCity(city.name)}
          placeHolder="Select City"
        />
      </div>
    </div>
  );
}

export default LocationPicker;