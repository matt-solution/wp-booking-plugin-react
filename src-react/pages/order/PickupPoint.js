import React from 'react';
import { useTranslation } from 'react-i18next';

const PickupPoint = ({ locations, currentLocation, onChange }) => {
  const { t } = useTranslation();
  return (
    <select
      className="form-select"
      value={currentLocation}
      onChange={onChange}
    >
      <option disabled value="">
        {t('pickuppoint.select')}
      </option>
      {locations.map((location, index) => (
        <option key={index} value={location}>
          {location}
        </option>
      ))}
    </select>
  );
};

export default PickupPoint;
