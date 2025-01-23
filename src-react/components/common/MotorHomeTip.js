import React from "react";
import { Link } from "react-router-dom";
import images from "../../components/common/Images";
import { useTranslation } from 'react-i18next';

const MotorHomeTip = () => {
  const { t } = useTranslation();
  return (
    <div className="row justify-content-center gx-3 py-5 motorhome-tips">
      <div className="col-sm-6 d-flex flex-row mobile">
        <div className="col-sm-6 bg-white skinship-left">
          <div className="logo d-flex justify-content-center align-items-center text-center pt-5">
            <Link to="/">
              <img
                src={images.header_logo}
                className="motorhome-tip-logo"
                alt="motorhome-logo"
              />
            </Link>
            <span>{t("home.tips.title")}</span>
          </div>
          <h3 className="d-flex justify-content-center align-items-center text-center py-5 feature-text">
            {t("home.tips.vacations")}
          </h3>
          <div className="d-flex align-items-center justify-content-center pt-5 tip">
            <button className="motorhome-button motorhome-desktop-order-button">
              {t("home.tips.information")}
            </button>
          </div>
        </div>
        <div className="col-sm-6">
          <img className="img-fluid skinship-right" src={images.image4} alt="tip" />
        </div>
      </div>
      <div className="col-sm-6 position-relative silence-mobile">
        <img
          className="img-fluid rounded rounded-3 h-100"
          src={images.image3}
          alt="silence"
        />
        <div className="position-absolute top-50 translate-middle silence">
          {t("home.tips.silence")}
        </div>
      </div>
    </div>
  );
};

export default MotorHomeTip;
