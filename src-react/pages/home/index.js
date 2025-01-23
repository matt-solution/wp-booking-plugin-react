import React, { useState, useEffect } from "react";
import PickUp from "../../components/common/Pickup";
import DatePickers from "../../components/common/DatePickers";
import MotorHome from "../../components/common/MotorHome";
import MotorHomeTip from "../../components/common/MotorHomeTip";
import MotorHomeServices from "../../services/motorhome.services";
import { GridLoader } from "react-spinners";
import moment from "moment";
import NoAvailable from "../../components/common/NoAvailable";
import MotorHomeFunctions from "../../services/motorhome.functions";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import images from "../../components/common/Images";




const Home = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentLocatioon, setCurrentLocations] = useState("base");
  const [landingProducts, setLandingProducts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 768px)");

    const handleMobileChange = (event) => {
      setIsMobile(event.matches);
    };

    handleMobileChange(mobileMediaQuery);

    mobileMediaQuery.addListener(handleMobileChange);

    return () => {
      mobileMediaQuery.removeListener(handleMobileChange);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    MotorHomeServices.getAllContents().then(
      (response) => {
        const products = response.data;
        const landingProducts = products.filter((product) =>
          product.acf.properties.find(
            (property) => property.propertyText === "Trondheim"
          )
        );
        setLandingProducts(landingProducts);
        setLoading(false);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();
        console.log("_content=>", _content);
      }
    );
  }, []);

  const onSetStartDate = (date) => {
    setStartDate(date);
  };

  const onSetEndDate = (date) => {
    setEndDate(date);
  };

  const onPickupPoint = (location) => {
    setCurrentLocations(location);
  };

  const onClickSearch = () => {
    const data = {
      location: currentLocatioon,
      startDate: startDate,
      endDate: endDate,
    };
    localStorage.setItem("homedata", JSON.stringify(data));

    navigate("/result");
  };

  return (
    <div className="motorhomes-container">
      <div className="position-relative motorhome-pickups">
        <img
          className="img-fluid background-logo"
          srcSet={`${images.home_mobile} 480w, ${images.home} 1920w`}
          src={images.home}
          alt="Image"
        />
        <div className="search-box position-absolute top-50 translate-middle">
          <h2 className="mt-5 px-5">
          {t('title')}
          </h2>
          <div className="pickup-picker">
            <PickUp onClickSelect={onPickupPoint} current={currentLocatioon} />
            <DatePickers
              startDate={startDate}
              setStartDate={onSetStartDate}
              endDate={endDate}
              setEndDate={onSetEndDate}
            />
          </div>

          <div className="my-5">
            <button
              className="motorhome-button motorhome-search-button"
              onClick={() => onClickSearch()}
            >
              {t('search')}
            </button>
          </div>
        </div>
        <div className="position-absolute top-50 main-logo-text">
          <img src={images.image5} className="img-fluid" alt="" />
        </div>
      </div>

      <div className="row pt-5 motorhomes">
        {isLoading ? (
          <div className="text-center">
            <GridLoader color="#36d7b7" />
          </div>
        ) : landingProducts?.length > 0 ? (
          landingProducts.map((product, index) => {
            return <MotorHome product={product} key={index} />;
          })
        ) : (
          <NoAvailable />
        )}
      </div>



      {/* <MotorHomeTip /> */}
    </div>
  );
};

export default Home;
