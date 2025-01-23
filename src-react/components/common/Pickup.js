import React, { useState, useEffect } from "react";
import MotorHomeServices from "../../services/motorhome.services";
import { useTranslation } from 'react-i18next';

const PickUp = (props) => {
  const [locations, setLocations] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    MotorHomeServices.getAllContents().then(
      (response) => {
        let locations = [];
        const products = response.data;
        products.map((product) =>
          locations.push(
            product.acf.properties.find(
              (property) => property.propertyKey === "position_city"
            ).propertyText
          )
        );
        setLocations([...new Set(locations.sort())]);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();
        console.log("error=>", _content);
      }
    );
  }, []);

  return (
    <select
      className="form-select pickup-point"
      aria-label="pickup-point"
      onChange={(e) => props.onClickSelect(e.target.value)}
      value={props.current}
    >
      <option disabled="disabled" value="base">
        {t('pickup.label.title')}
      </option>
      {locations?.map((location, index) => {
        return (
          <option key={index} value={location}>
            {location}
          </option>
        );
      })}
    </select>
  );
};

export default PickUp;
