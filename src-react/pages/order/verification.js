import React from 'react';
import { useTranslation } from 'react-i18next';

const Verification = ({ code, onChange, onSubmit }) => {
  const { t } = useTranslation();
  return (
    <div className="verification">
      <h2>{t('verification.title')}</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">{t('verification.code')}</label>
          <input
            type="text"
            className="form-control"
            value={code}
            onChange={onChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {t('verification.submit')}
        </button>
      </form>
    </div>
  );
};

export default Verification;
