import React from 'react';
import { useTranslation } from 'react-i18next';

const OrderDetails = ({ formData, handleChange }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.gender')}</label>
        <select
          className="form-select"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">{t('orderdetails.selectgender')}</option>
          <option value="male">{t('orderdetails.male')}</option>
          <option value="female">{t('orderdetails.female')}</option>
          <option value="other">{t('orderdetails.other')}</option>
        </select>
      </div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.name')}</label>
        <input
          type="text"
          className="form-control"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.surname')}</label>
        <input
          type="text"
          className="form-control"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
        />
      </div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.address')}</label>
        <input
          type="text"
          className="form-control"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.country')}</label>
        <input
          type="text"
          className="form-control"
          name="country"
          value={formData.country}
          onChange={handleChange}
        />
      </div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.cell')}</label>
        <input
          type="text"
          className="form-control"
          name="cell"
          value={formData.cell}
          onChange={handleChange}
        />
      </div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.mail')}</label>
        <input
          type="email"
          className="form-control"
          name="mail"
          value={formData.mail}
          onChange={handleChange}
        />
      </div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.repeatmail')}</label>
        <input
          type="email"
          className="form-control"
          name="repeatmail"
          value={formData.repeatmail}
          onChange={handleChange}
        />
      </div>
      <div className="mt-3">
        <label className="form-label">{t('orderdetails.message')}</label>
        <textarea
          className="form-control"
          name="message"
          value={formData.message}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default OrderDetails;
