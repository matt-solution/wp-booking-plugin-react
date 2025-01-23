import React, { useState, useEffect, useCallback } from "react";
import images from "../../components/common/Images";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router-dom";
import PickUp from "../../components/common/Pickup";
import MobileDateRangePickers from "../../components/common/MobileDateRangePickers";
import parser from "html-react-parser";
import MotorHomeServices from "../../services/motorhome.services";
import { useTranslation } from 'react-i18next';
import MotorHomeFunctions from "../../services/motorhome.functions";


const MotorHome = (props) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const propertyText = currentLanguage.split("_")[0] !== "en" ? "propertyText_" + currentLanguage.replace("_", "-") : "propertyText";
  const name = currentLanguage.split("_")[0] !== "en" ? "name_" + currentLanguage.replace("_", "-") : "name";
  const navigate = useNavigate();
  const [lang, setLang] = useState(currentLanguage.split("_")[0] === "en");
  const [modelIndex, setModelIndex] = useState(null);
  const [modelFlag, setModelFlag] = useState(false);
  const [searchResult, setSearchResult] = useState();
  const [selectPickupPoint, setSelectPickupPoint] = useState(false);
  const [picked, setPicked] = useState("base");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [product, setProduct] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setSearchResult(props.searchResult);

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
    if (props.isAll) {
      MotorHomeServices.getAllContents().then(
        (response) => {
          const product = response.data.find(
            (product) => product.acf.web_product_id === props.product?.id
          );
          setProduct(product);
        },
        (error) => {
          const _content =
            (error.response && error.response.data) ||
            error.message ||
            error.toString();
          console.log("error=>", _content);
        }
      );
    }
  }, []);

  const onClickAboutModel = (e) => {
    setModelIndex(e);
    setModelFlag(!modelFlag);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const onClickBookfromMobile = (product) => {
    if (startDate != null && endDate != null)
      navigate("/order", {
        state: {
          product: product,
          booked: true,
          searchResult: searchResult,
          from: startDate,
          to: endDate,
          location: picked,
        },
      });
    else console.log("you must select date picker!");
  };

  const onClickBook = (_product, _searchResult) => {
    if (props.isAll) {
      const data = {
        product: product,
        booked: true,
      };
      localStorage.setItem("product", JSON.stringify(data));
      const location = props.product.properties.position_city.text;
      const searchResult = [
        _searchResult[0],
        _searchResult[1],
        _searchResult[2],
        _searchResult[3],
        location,
      ];
      localStorage.setItem("searchResult", JSON.stringify(searchResult));
    } else {
      const data = {
        product: _product,
        booked: true,
      };
      localStorage.setItem("product", JSON.stringify(data));
      localStorage.setItem("searchResult", JSON.stringify(_searchResult));
    }
    navigate("/order/confirm-order");
  };

  const onClickCheckAvailability = async (product_id) => {
    await MotorHomeServices.getAllContents().then(
      (response) => {
        const products = response.data;
        const result = products.find(
          (product) => product.acf.web_product_id === product_id
        );
        const product = {
          product: result,
          booked: false,
        };
        localStorage.setItem("product", JSON.stringify(product));
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();
        console.log("error=>", _content);
      }
    );

    if (isMobile) {
      setSelectPickupPoint(true);
    } else {
      navigate("/order/check-availability");
    }
  };

  const onPickupPoint = (location) => {
    setPicked(location);
  };

  return (
    <div className="col-xl-3 col-lg-4 col-sm-6 position-relative mobile">
      {searchResult ? (
        <p className="text-center position-absolute top-20 start-50 translate-middle header px-5 py-1">
          {props.isAll
            ? props.product.properties.position_city.text
            : props.product.acf.properties.find(
                (property) => property.propertyKey === "position_city"
              ).propertyText}
        </p>
      ) : null}
      <div className="motorhome mt-2">
        <div className="py-4 px-3">
          <div
            className={
              props.searchResult && !props.searchResult[0] ? "opacity-50" : null
            }
          >
            <div className="motorhome-carousel">
              <div
                id={"carousel" + props.product.id}
                className="carousel slide"
                data-bs-touch="false"
                data-bs-interval="false"
              >
                <div className="carousel-inner">
                  {props.isAll
                    ? props.product.images.map((image, index) => {
                        return (
                          <div
                            key={index}
                            className={`carousel-item ${
                              index === 0 ? "active" : ""
                            }`}
                          >
                            <img
                              src={MotorHomeServices.getFullImagePath(
                                image.imagePath,
                                props.product.id
                              )}
                              alt={`Image ${index}`}
                              className="m-carousels d-block w-100"
                            />
                          </div>
                        );
                      })
                    : props.product.acf?.images.map((image, index) => {
                        return (
                          <div
                            key={index}
                            className={`carousel-item ${
                              index === 0 ? "active" : ""
                            }`}
                          >
                            <img
                              src={MotorHomeServices.getFullImagePath(
                                image.image_path,
                                props.product.acf.web_product_id
                              )}
                              alt={`Image ${index}`}
                              className="m-carousels d-block w-100"
                            />
                          </div>
                        );
                      })}
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target={"#carousel" + props.product.id}
                  data-bs-slide="prev"
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target={"#carousel" + props.product.id}
                  data-bs-slide="next"
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">
                    {t('motorhome.specs.next')}
                  </span>
                </button>
              </div>
            </div>
            <h4 className="motorhome-label-g">
              {t('motorhome.specs.pretext')}
            </h4>
            <h2 className="motorhome-title-g">
              <span>
                {props.isAll
                  ? parser(props.product.name)
                  : lang
                  ? parser(props.product?.title?.rendered)
                  : parser(
                      MotorHomeFunctions.getObjectPropertyValue(
                        props.product.acf,
                        name
                      )
                    )}
              </span>
            </h2>
          </div>
          {(props.searchResult && props.searchResult[0]) ||
          !props.searchResult ? (
            <>
              <p className="pt-2 motorhome-description-g">
                {props.isAll
                  ? parser(props.product.description.short)
                  : parser(
                      MotorHomeFunctions.getObjectPropertyValue(
                        props.product.acf?.properties.find(
                          (property) => property.propertyKey === "description_short"
                        ),
                        propertyText
                      )
                    )}
              </p>

              {searchResult ? (
                <div className="d-flex flex-row justify-content-between py-3">
                  <div className="lh-1">
                    <div className="from">{t('motorhome.specs.from')}</div>
                    <div className="price pt-1">
                      <h2 className="unit">{props.searchResult[1]},-</h2>
                      <span className="currency">NOK</span>
                    </div>
                  </div>
                  <button
                    className="book-button px-3"
                    onClick={() =>
                      onClickBook(props.product, props.searchResult)
                    }
                  >
                    {t('motorhome.results.book')}
                  </button>
                </div>
              ) : null}

              <div className="row gx-2 pt-4 motorhome-property">
                <div className="col-4 ">
                  <div className="border border-1 border-black rounded-3 text-center pt-2 motorhome-properties">
                    <img src={images.seat} alt="seat" className="icon" />
                    <p className="status">
                      {props.isAll
                        ? props.product.maxPeople
                        : props.product.acf.maxPeople}{" "}
                      {t('motorhome.specs.seats')}
                    </p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border border-1 border-black rounded-3 text-center pt-2 motorhome-properties">
                    <img src={images.bed} alt="bed" className="icon" />
                    <p className="status">
                      {props.isAll
                        ? props.product.properties.persons_max.value
                        : props.product.acf.properties?.find(
                            (property) => property.propertyKey === "persons_max"
                          ).propertyValue}{" "}
                      {t('motorhome.specs.beds')}
                    </p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border border-1 border-black rounded-3 text-center pt-2 motorhome-properties">
                    <img src={images.classs} alt="class" className="icon" />
                    <p className="status">
                      {t('motorhome.specs.class')}{" "}
                      {props.isAll
                        ? props.product.properties.licence.text
                        : props.product.acf.properties?.find(
                            (property) => property.propertyKey === "licence"
                          ).propertyText}
                    </p>
                  </div>
                </div>
              </div>
              {!searchResult && !selectPickupPoint ? (
                <div className="d-grid gap-2 col-10 mx-auto mt-5">
                  <button
                    className="motorhome-check-available-button motorhome-button"
                    onClick={() =>
                      onClickCheckAvailability(props.product.acf.web_product_id)
                    }
                  >
                    {t('motorhome.results.check')}
                  </button>
                </div>
              ) : isMobile && selectPickupPoint ? (
                <div className="text-center journey-box">
                  <div className="title pt-3">
                    {t('order.booking.book_journey')}
                  </div>
                  <div className="pickup-point p-5 pt-2">
                    <PickUp onClickSelect={onPickupPoint} />
                  </div>
                </div>
              ) : null}
              {isMobile && picked !== "base" ? (
                <div className="p-4">
                  <MobileDateRangePickers
                    startDate={startDate}
                    endDate={endDate}
                    onHandleDateChange={handleDateChange}
                    highlightDates={availableDates}
                  />
                  <div className="text-center">
                    <button
                      className="book-button mt-3"
                      onClick={() => onClickBookfromMobile(props.product)}
                    >
                      {t('motorhome.results.book')}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-center hidden-box">
              <h3 className="motorhome-text3">{t('motorhome.results.sorry')}</h3>
              <p className="motorhome-text2">{t('motorhome.results.another')}</p>
              <div className="d-grid gap-2 col-10 mx-auto mt-5 pt-4">
                <button
                  className="motorhome-check-available-button motorhome-button"
                  onClick={() =>
                    onClickCheckAvailability(
                      props.isAll
                        ? props.product.id
                        : props.product.acf.web_product_id
                    )
                  }
                >
                  {t('motorhome.results.check')}
                </button>
              </div>
            </div>
          )}
        </div>
        {(props.searchResult && props.searchResult[0]) || !props.searchResult ? (
          <>
            <hr />
            <div className="d-flex flex-row justify-content-between mx-3">
              <h3
                className="motorhome-about-model"
                style={{
                  visibility:
                    modelIndex === null || modelIndex != props.product.id
                      ? "visible"
                      : modelIndex === props.product.id && !modelFlag
                      ? "visible"
                      : "hidden",
                }}
              >
                {t('motorhome.results.about')}
              </h3>
              <div onClick={() => onClickAboutModel(props.product.id)}>
                <img
                  src={
                    modelIndex === props.product.id && modelFlag
                      ? images.minus
                      : images.plus
                  }
                  className="plus"
                  alt="plus"
                />
              </div>
            </div>
            {modelIndex === props.product.id && modelFlag && (
              <div>
                <div className="mx-3">
                  <h3 className="motorhome-about-model">
                    {t('motorhome.results.about')}
                  </h3>
                  <p className="about pt-5">
                    {props.isAll
                      ? parser(props.product.description?.long)
                      : parser(
                          MotorHomeFunctions.getObjectPropertyValue(
                            props.product.acf?.properties.find(
                              (property) => property.propertyKey === "description_long"
                            ),
                            propertyText
                          )
                        )}
                  </p>
                  <br />
                </div>
                <div className="mx-2 module-youtube">
                  <ReactPlayer
                    url={
                      "https://www.youtube.com/watch?v=" +
                      (props.isAll
                        ? props.product?.properties?.youtube?.text
                        : props.product?.acf?.properties?.find(
                            (property) => property.propertyKey === "youtube"
                          ).propertyText)
                    }
                    width="100%"
                  />
                </div>
              </div>
            )}
          </>
        ) : null}
        <hr className="pb-2 mt-0" />
      </div>
    </div>
  );
};

export default MotorHome;