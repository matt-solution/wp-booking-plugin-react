import React, { useState, useEffect, useCallback } from "react";
import images from "../../components/common/Images";
import PickUp from "../../components/common/Pickup";
import ReactPlayer from "react-player";
import { useLocation, useNavigate } from "react-router-dom";
import parser from "html-react-parser";
import MotorHomeServices from "../../services/motorhome.services";
import { GridLoader } from "react-spinners";
import moment from "moment";
import DateRangePickers from "../../components/common/DateRangePickers";
import NoAvailable from "../../components/common/NoAvailable";
import MotorHomeFunctions from "../../services/motorhome.functions";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";

const CheckAvailability = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const currentLanguage = i18n.language;
  const propertyText =
    currentLanguage.split("_")[0] != "en"
      ? "propertyText_" + currentLanguage.replace("_", "-")
      : "propertyText";
  const name =
    currentLanguage.split("_")[0] != "en"
      ? "name_" + currentLanguage.replace("_", "-")
      : "name";
  const [lang, setLang] = useState(currentLanguage.split("_")[0] === "en");
  const data = JSON.parse(localStorage.getItem("product"));
  const searchResult = JSON.parse(localStorage.getItem("searchResult"));
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [booked, setBooked] = useState(data?.booked ? data.booked : false); // false: from Check Availability, true: from Book
  const [product, setProduct] = useState(data?.product ? data.product : []);
  const [result, setSearchResult] = useState(searchResult ? searchResult : []);
  const [productType, setProductType] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isProductLoading, setProductLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    result && booked ? result[2] : state?.from ? state.from : null
  );
  const [endDate, setEndDate] = useState(
    result && booked ? result[3] : state?.to ? state.to : null
  );
  const [currentLocation, setCurrentLocations] = useState(
    result && booked
      ? result[4]
      : state?.location
      ? state.location
      : data?.product
      ? data.product.acf.properties[0].propertyText
      : "base"
  );
  const [cachedDates, setCachedDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([
    {
      startDate: startDate,
      endDate: endDate,
      key: "selection",
    },
  ]);

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
    if (!JSON.parse(localStorage.getItem("product"))?.product) {
      navigate("/");
      return;
    }

    const parts = parser(product.title?.rendered);
    const xd = parts.split(/\(|\)/);
    const data = xd.filter((part) => part.trim() != "");

    setProductType(data[0] + "(" + data[1] + ")");
  }, []);

  const onPickupPoint = useCallback((location) => {
    setProductLoading(true);
    MotorHomeServices.getAllContents().then(
      (response) => {
        const products = response.data.filter((product) =>
          product.acf.properties.find(
            (property) => property.propertyText === location
          )
        );
        const sampeTypeProduct = products.find((item) =>
          item.title?.rendered.includes(productType)
        );
        setProduct(sampeTypeProduct);
        const data = localStorage.getItem("product");
        const product = {
          product: sampeTypeProduct,
          booked: JSON.parse(data).booked,
        };
        localStorage.setItem("product", JSON.stringify(product));
        setCurrentLocations(location);
        setStartDate(null);
        setEndDate(null);
        setCachedDates([]);
        setAvailableDates([]);
        setProductLoading(false);
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
  const getProductPrice = useCallback(() => {
    if (
      startDate != null &&
      endDate != null &&
      currentLocation != "base" &&
      booked
    ) {
      setLoading(true);
      const startdate = moment(startDate).format("YYYY-MM-DD");
      const enddate = moment(endDate).format("YYYY-MM-DD");
      (async () => {
        const data = await MotorHomeServices.getPrices(
          startdate,
          enddate,
          product.acf.web_product_id
        )
          .then((response) => {
            // setProductPrices(response.data);
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            console.error("Error in one of the promises:", error);
          });
      })();
    }
  }, []);
  useEffect(() => {
    console.log("here", startDate, endDate, currentLocation, booked);
    if (
      startDate != null &&
      endDate != null &&
      currentLocation != "base" &&
      booked
    ) {
      setLoading(true);
      const startdate = moment(startDate).format("YYYY-MM-DD");
      const enddate = moment(endDate).format("YYYY-MM-DD");
      (async () => {
        const data = await MotorHomeServices.getPrices(
          startdate,
          enddate,
          product.acf.web_product_id
        )
          .then((response) => {
            // setProductPrices(response.data);
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            console.error("Error in one of the promises:", error);
          });
      })();
    } else {
      const end_date = endDate ? endDate : new Date();
      const start_date = startDate ? startDate : new Date();

      if (
        cachedDates.includes(moment(start_date).format("YYYY-MM")) &&
        cachedDates.includes(moment(end_date).format("YYYY-MM"))
      )
        return;

      setLoading(true);
      let availables = [];
      let newAvailableDate, newCachedDate;

      if (cachedDates.length > 0) {
        if (cachedDates.includes(moment(start_date).format("YYYY-MM"))) {
          newAvailableDate = moment(end_date).format("YYYY-MM");
          newCachedDate = [...cachedDates, newAvailableDate];
        } else {
          newAvailableDate = moment(start_date).format("YYYY-MM");
          newCachedDate = [...cachedDates, newAvailableDate];
        }

        availables.push(newAvailableDate);
        setCachedDates(newCachedDate);
      } else {
        for (let i = 0; i < 4; i++) {
          const date = moment(end_date);
          const nextMonthDate = date.add(i, "months");
          availables.push(moment(nextMonthDate).format("YYYY-MM"));
        }
        setCachedDates(availables);
      }

      (async () => {
        let newAvailableDates = [];
        const data = await Promise.all(
          availables.map(async (each) => {
            const response = await MotorHomeServices.checkAvailability(
              each,
              each,
              product.acf.web_product_id
            );
            const _availables = response.data.items.filter(
              (each) => each.webProducts[0].availability.available === true
            );
            const _availableDates =
              _availables.length > 0 &&
              _availables.map((each) =>
                newAvailableDates.push(moment(each.date).format("YYYY-MM-DD"))
              );

            return [_availableDates];
          })
        );

        if (availableDates.length > 0) {
          const newData = [...availableDates, ...newAvailableDates];
          setAvailableDates(newData);
        } else {
          setAvailableDates(newAvailableDates);
        }

        setLoading(false);
      })();
    }
  }, [product, endDate, startDate, booked]);

  useEffect(() => {
    let totalPrice = 0;
    // setNumberOfPersons(product?.acf?.maxPeople);
    product?.acf?.additional_services.length > 0 &&
      product.acf.additional_services
        .filter((each) => each.rules[0].selectedByDefault === true)
        .map((_each) => {
          if (_each.service_type === "perDay") {
            totalPrice +=
              Number(_each.price) *
              MotorHomeFunctions.getAllDatesBetweenMonths(startDate, endDate);
          } else {
            totalPrice += Number(_each.price);
          }
        });
    // setAddtionalPrices(totalPrice);
  }, []);
  const onClickCloseCalendar = () => {
    const selectedData = [
      {
        startDate: null,
        endDate: null,
        key: "selection",
      },
    ];
    setSelectedDates(selectedData);
    setEndDate(null);
    setStartDate(null);
    
    const data = localStorage.getItem("searchResult");
    const searchResult = [
      JSON.parse(data)[0],
      JSON.parse(data)[1],
      null,
      null,
      JSON.parse(data)[4],
    ];
    localStorage.setItem("searchResult", JSON.stringify(searchResult));
  };
  
  const onSetDateRange = (range) => {
    setSelectedDates(range);
    setStartDate(range[0].startDate);
    setEndDate(range[0].endDate);
    const searchResult = JSON.parse(localStorage.getItem("searchResult"));
    const data = [
      searchResult ? searchResult[0] : null,
      searchResult ? searchResult[1] : null,
      range[0].startDate,
      range[0].endDate,
      currentLocation,
    ];
    localStorage.setItem("searchResult", JSON.stringify(data));
    // console.log("range=>", range);
  };

  const onClickBook = () => {
    if (currentLocation && startDate && endDate) {
      getProductPrice();
      const data = localStorage.getItem("product");
      const product = {
        product: JSON.parse(data).product,
        booked: true,
      };
      localStorage.setItem("product", JSON.stringify(product));
      setBooked(true);
      navigate("/order/confirm-order");
    } else console.log("no data");
  };

  const handleStartMonthChange = (date) => {
    setStartDate(date);
  };

  const handleEndMonthChange = (date) => {
    setEndDate(date);
  };

  return (
    <div className="order-container">
        <div className="row box">
           <div className="col-lg-5 col-12 motorhome-description mt-5 py-3">

            {isProductLoading ? (
              <div className="text-center">
                <GridLoader color="#36d7b7" />
              </div>
            ) : (
              <>
                <div className="motorhome-carousel">
                  <div
                    id="carousel"
                    className="carousel slide"
                    data-bs-touch="false"
                    data-bs-interval="false"
                  >
                    <div className="carousel-inner">
                      {product.acf?.images.map((image, index) => {
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
                                product.acf.web_product_id
                              )}
                              alt={`Image ${index}`}
                              className="m-carousels-details d-block w-100"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target="#carousel"
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
                      data-bs-target="#carousel"
                      data-bs-slide="next"
                    >
                      <span
                        className="carousel-control-next-icon"
                        aria-hidden="true"
                      ></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </div>
                </div>
                <h4 className="motorhome-label-g">
                  {t("motorhome.specs.pretext")}
                </h4>
                <h2 className="motorhome-title-g">
                  <span>
                    {lang
                      ? (product?.title?.rendered)
                      : (
                          MotorHomeFunctions.getObjectPropertyValue(
                            product.acf,
                            name
                          )
                        )}
                  </span>
                </h2>

                <div className="row gx-5 p-3 motorhome-property">
                  <div className="col-4">
                    <div className="border rounded-3 text-center pt-2 motorhome-properties">
                      <img src={images.seat} alt="seat" />
                      <div className="">
                        {product?.acf?.maxPeople} {t("motorhome.specs.seats")}
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded-3 text-center pt-2 motorhome-properties">
                      <img src={images.bed} alt="bed" />
                      <div className="">
                        {product?.acf?.maxPeople} {t("motorhome.specs.beds")}
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded-3 text-center pt-2 motorhome-properties">
                      <img src={images.classs} alt="class" />
                      <div className="">
                        {t("motorhome.specs.class")}{" "}
                        {
                          product?.acf?.properties?.find(
                            (property) => property.propertyKey === "licence"
                          ).propertyText
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="pt-5 motorhome-description mobile">
                  {(
                    MotorHomeFunctions.getObjectPropertyValue(
                      product.acf?.properties.find(
                        (property) =>
                          property.propertyKey === "description_long"
                      ),
                      propertyText
                    )
                  )}
                </h4>
                <div className="mobile py-5">
                  <ReactPlayer
                    url={
                      "https://www.youtube.com/watch?v=" +
                      product.acf?.properties?.find(
                        (property) => property.propertyKey === "youtube"
                      ).propertyText
                    }
                    width="100%"
                  />
                </div>
              </>
            )}
          </div>
          <div className="col-lg-7 col-12">
            <div className="ordered p-5">
              <h2 className="text-center label mt-5">
                {t("order.booking.lets_go")}
              </h2>
              <div className="text-center journey-box">
                <div className="title pt-3">
                  {t("order.booking.book_journey")}
                </div>
                <div className="pickup-point p-5 pt-2">
                  <PickUp
                    current={currentLocation}
                    onClickSelect={onPickupPoint}
                  />
                </div>
              </div>
              {isLoading ? (
                <div className="text-center">
                  <GridLoader color="#36d7b7" />
                </div>
              ) : startDate != null &&
                endDate != null &&
                endDate > startDate ? null : (
                <NoAvailable />
              )}
              {currentLocation != "base" ? (
                <div className="py-4 px-3">
                <DateRangePickers
                    direction={true}
                    isLoading={isLoading}
                    selectedDates={selectedDates}
                    highlightDates={availableDates}
                    handleStartMonthChange={handleStartMonthChange}
                    handleEndMonthChange={handleEndMonthChange}
                    onSetDateRange={onSetDateRange}
                    startDate={startDate}
                    endDate={endDate}
                    onClickCloseCalendar={onClickCloseCalendar}
                  />
                  <div className="text-center">
                    <button
                      className="book-button mt-5"
                      onClick={(e) => onClickBook(e)}
                    >
                      {t("order.booking.book")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
    </div>
  );
};

export default CheckAvailability;
