import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import images from "../components/Images";
import PickUp from "../components/Pickup";
import DatePickers from "../components/DatePickers";
import MotorHome from "../components/MotorHome";
import MotorHomeTip from "../components/MotorHomeTip";
import MotorHomeServices from "../../services/motorhome.services";
import { GridLoader } from "react-spinners";
import { useTranslation } from 'react-i18next';
import NoAvailable from "../components/NoAvailable";

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
        <div className="search-box position-absolute top-50 start-50 translate-middle">
          <h2 className="mt-5">
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
      <div className="row gx-5 pt-5 motorhome-overviews">
        <div className="col-4">
          <div className="box">
            <img
              src={images.image46}
              className="img-fluid w-100"
              alt="Third slide"
            />
            <div className="p-5">
              <div className="motorhome-overviews-title">
                <h2 class="overviews-title">{t('home.overview.title1')}</h2>
              </div>
              <div className="pt-5 motorhome-overviews-description">
                <p class="overviews-description">
                {t('home.overview.description1')}
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-center">
                <button className="motorhome-button motorhome-readmore-button">
                {t('readmore')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="box">
            <img
              src={images.image45}
              className="img-fluid w-100"
              alt="Third slide"
            />
            <div className="p-5">
              <div className="pt-2 motorhome-overviews-title">
              <h2 class="overviews-title">{t('home.overview.title2')}</h2>
              </div>
              <div className="pt-5 motorhome-overviews-description">
                <p>
                {t('home.overview.description2')}
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-center">
                <button className="motorhome-button motorhome-readmore-button">
                {t('readmore')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="box">
            <img
              src={images.image47}
              className="img-fluid w-100"
              alt="Third slide"
            />
            <div className="p-5">
              <div className="pt-2 motorhome-overviews-title">
              <h2 class="overviews-title">{t('home.overview.title1')}</h2>
              </div>
              <div className="pt-5 motorhome-overviews-description">
                <p>
                {t('home.overview.description2')}
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-center">
                <button className="motorhome-button motorhome-readmore-button">
                {t('readmore')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-between pt-5 motorhome-details">
        <div className="col-md-7 col-12">
          <img
            className="img-fluid h-100"
            src={isMobile ? images.image11 : images.image1}
          ></img>
        </div>
        <div className="col-md-5 col-12 position-relative text-center">
          <img
            className="img-fluid"
            src={isMobile ? images.image12 : images.image2}
          ></img>
          <div className="position-absolute top-50 start-50 translate-middle silence">
            <img src={images.logo_star} className="pb-5" />
            <h2 className="point pb-5">
            {t('home.details.title')}
            </h2>
            <button className="pickup px-4 py-3 mt-5">
            {t('home.details.pickup')}
            </button>
          </div>
        </div>
      </div>
      {/* <MotorHomeTip /> */}
      </div>
  );
};

export default Home;
