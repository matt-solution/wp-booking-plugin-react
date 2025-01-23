import React, { useState, useEffect, useCallback, useRef } from "react";
import images from "../../components/common/Images";
import PickUp from "../../components/common/Pickup";
import { useLocation, useNavigate } from "react-router-dom";
import parser from "html-react-parser";
import MotorHomeServices from "../../services/motorhome.services";
import moment from "moment";
import DateRangePickers from "../../components/common/DateRangePickers";
import MotorHomeFunctions from "../../services/motorhome.functions";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import ConvertText from "../../components/common/ConvertText";
import Checkout from "./Checkout";
import CheckoutUserInfo from "./CheckoutUserInfo";
import { GridLoader } from "react-spinners";
import validator from "validator";

const ConfirmOrder = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;
  const propertyText = currentLanguage.startsWith("en")
    ? "propertyText"
    : `propertyText_${currentLanguage.replace("_", "-")}`;

  const name = currentLanguage.startsWith("en")
    ? "name"
    : `name_${currentLanguage.replace("_", "-")}`;

  const storedData = localStorage.getItem("product");
  const data = storedData ? JSON.parse(storedData) : null;

  const searchResult = JSON.parse(localStorage.getItem("searchResult"));
  const navigate = useNavigate();
  const { state } = useLocation();

  const [additionalPrices, setAddtionalPrices] = useState(0);
  const [totalPrices, setTotalPrices] = useState(0);
  const [pricePerStep, setPricePerStep] = useState(0);
  const [product, setProduct] = useState(data?.product || []);
  const [result] = useState(searchResult || []);
  const [selectedExtraValue, setSelectedExtraValue] = useState([]);
  const [productType, setProductType] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    result ? result[2] : state?.from || null
  );
  const [endDate, setEndDate] = useState(
    result ? result[3] : state?.to || null
  );
  const [currentLocation, setCurrentLocations] = useState(
    result
      ? result[4]
      : state?.location ||
          data?.product?.acf?.properties[0]?.[propertyText] ||
          "base"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [number_of_persons, setNumberOfPersons] = useState(1);
  const [confirmOrderStatus, setConfirmOrderStatus] = useState(0);
  const [cachedDates, setCachedDates] = useState([]);
  const [productPrices, setProductPrices] = useState([]);
  const [selectedDates, setSelectedDates] = useState([
    {
      startDate: startDate,
      endDate: endDate,
      key: "selection",
    },
  ]);

  const [countryCode, setCountryCode] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [conifirmEmail, setConifirmEmail] = useState();
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isReservationLoading, setReservationLoading] = useState(false);
  const [isAvailableReservation, setAvailableReservation] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const [reservatedData, setReservatedData] = useState({
    reservationId: "",
    encryptedCompanyId: "",
  });
  const reservatedDataRef = useRef(reservatedData);
  const [pingReservationChecked, setPingReservationChecked] = useState(false);

  // Responsive handler
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

  // Product setup
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("product"));
    if (!storedData || !storedData.product) {
      console.log("No product data found, navigating to /");
      navigate("/");
      return;
    }

    const parts = storedData.product.title?.rendered;
    const xd = parts.split(/\(|\)/);
    const data = xd.filter((part) => part.trim() !== "");

    setProductType(data[0] + "(" + data[1] + ")");
  }, [navigate]);

  const onPickupPoint = useCallback(
    (location) => {
      MotorHomeServices.getAllContents().then(
        (response) => {
          const products = response.data.filter((product) =>
            product.acf.properties.find(
              (property) => property.propertyText === location
            )
          );
          const sampleTypeProduct = products.find((item) =>
            item.title?.rendered.includes(productType)
          );

          setProduct(sampleTypeProduct);
          const data = localStorage.getItem("product");
          const product = {
            product: sampleTypeProduct,
            booked: JSON.parse(data).booked,
          };
          localStorage.setItem("product", JSON.stringify(product));
          setCurrentLocations(location);
          setStartDate(null);
          setEndDate(null);
          setCachedDates([]);
          setAvailableDates([]);
        },
        (error) => {
          console.error("Error:", error);
        }
      );
    },
    [productType]
  );

  const fetchPrices = useCallback(async (startDate, endDate, webProductId) => {
    try {
      setLoading(true);
      const response = await MotorHomeServices.getPrices(
        startDate,
        endDate,
        webProductId
      );
      setProductPrices(response.data);
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTotalPrice = useCallback(() => {
    if (productPrices?.prices?.length > 0) {
      const totalPrice =
        Number(productPrices.prices[0].calculatedPrice) +
        Number(additionalPrices);
      const pricePerStep = Number(productPrices.prices[0].pricePerStep);
      setPricePerStep(pricePerStep);
      setTotalPrices(totalPrice);
    }
  }, [productPrices, additionalPrices]);

  useEffect(() => {
    const start = startDate ? moment(startDate).format("YYYY-MM-DD") : null;
    const end = endDate ? moment(endDate).format("YYYY-MM-DD") : null;

    if (start && end && currentLocation !== "base") {
      fetchPrices(start, end, product.acf.web_product_id);
    }

    calculateTotalPrice();
  }, [startDate, endDate, currentLocation, product, fetchPrices]);

  useEffect(() => {
    calculateTotalPrice();
  }, [productPrices, calculateTotalPrice]);

  useEffect(() => {
    let totalPrice = 0;
    setNumberOfPersons(product?.acf?.maxPeople);
    product?.acf?.additional_services.length > 0 &&
      product.acf.additional_services
        .filter((each) => each.rules[0].selectedByDefault === true)
        .map((each) => {
          if (each.service_type === "perDay") {
            totalPrice +=
              Number(each.price) *
              MotorHomeFunctions.getAllDatesBetweenMonths(startDate, endDate);
          } else {
            totalPrice += Number(each.price);
          }
        });
    setAddtionalPrices(totalPrice);
  }, [product, startDate, endDate]);

  const onChangeEmailHandler = (data) => {
    setConifirmEmail(data);
    
    if (data) setIsEmailValid(validator.isEmail(data));
    else setIsEmailValid(true);

    if(data.length===0){
      setIsEmailValid(false);
    } 
  };

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

  const onChangeNumberOfPersonsClick = (e) => {
    setNumberOfPersons(e.target.value);
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
  };

  const handleStartMonthChange = (date) => {
    setStartDate(date);
  };

  const handleEndMonthChange = (date) => {
    setEndDate(date);
  };

  const onClickAdditionalSelect = (e, id, price) => {
    const count = Number(e.target.value);
    const total = Number(price) * count;
    let prices;
    if (selectedExtraValue.find((each) => each.id === id)) {
      prices =
        additionalPrices -
        selectedExtraValue.find((each) => each.id === id).total +
        total;
      setAddtionalPrices(prices);
      setSelectedExtraValue((prevData) => {
        return prevData.map((item) => {
          if (item.id === id) {
            return { ...item, ...{ count: count, total: total } };
          }
          return item;
        });
      });
    } else {
      prices = additionalPrices + total;
      setSelectedExtraValue([
        ...selectedExtraValue,
        { id: id, count: count, total: total },
      ]);
      setAddtionalPrices(prices);
    }

    const t_price =
      productPrices?.prices?.length > 0 &&
      productPrices.prices[0].pricePerStep *
        MotorHomeFunctions.getAllDatesBetweenMonths(startDate, endDate) +
        prices;
    setTotalPrices(t_price);
  };
  useEffect(() => {
    reservatedDataRef.current = reservatedData;
  }, [reservatedData]);

  const clearExistingInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const checkReservationStatus = async () => {
    console.log("reservatedData=>", reservatedDataRef.current);
    try {
      const response = await MotorHomeServices.createPingReservations(
        reservatedDataRef.current
      );
      if (response.status === 200) {
        setPingReservationChecked(true);
      } else {
        setPingReservationChecked(false);
        setConfirmOrderStatus(0);
      }
    } catch (error) {
      console.error("Error checking reservation status:", error);
    }
  };

  useEffect(() => {
    return () => clearExistingInterval();
  }, [intervalId]);

  useEffect(() => {
    if (pingReservationChecked) {
      const checkoutPaymentType = async () => {
        try {
          const response = await MotorHomeServices.checkoutPaymentType();
          console.log("checkoutPaymentType=>", response);
        } catch (error) {
          console.error("Error during checkout payment type:", error);
        }
      };

      const setupTerms = async () => {
        try {
          const response = await MotorHomeServices.setupTerms(reservatedData);
          if (response.terms) {
          }
        } catch (error) {
          console.error("Error during setupTerms:", error);
        }
      };

      checkoutPaymentType();
      setupTerms();
    }
  }, [pingReservationChecked, reservatedData]);

  const onClickConfirmOrder = async (status) => {
    setConfirmOrderStatus(status);
    if (status === 1) {
      try {
        // Fetch the product data
        const fromDate = moment(startDate).format("YYYY-MM-DD");
        const toDate = moment(endDate).format("YYYY-MM-DD");
        const numberOfPeople = Number(number_of_persons);
        const webProductId = Number(product.acf.web_product_id);
        setReservationLoading(true);

        const response = await MotorHomeServices.getWebProduct(
          fromDate,
          toDate,
          numberOfPeople,
          webProductId
        );
        const data = response.data;

        // Process additional services if available
        let additionalServices = [];
        if (data?.additionalServices?.length > 0) {
          data.additionalServices.forEach((item) => {
            if (item.rules?.selectedByDefault) {
              additionalServices.push({
                id: item.id,
                encryptedCompanyId: item.encryptedCompanyId,
                count: 1,
              });
            }
          });
        }

        // Prepare reservation data
        const reservationData = {
          fromDate,
          toDate,
          priceId: data.prices[0].id,
          numberOfPeople,
          webProductId,
          notes: "",
          guestsNames: "",
          additionalServices,
          additionalMerchandises: [],
        };

        // Request reservation
        const reservationResponse = await MotorHomeServices.createReservations(
          reservationData
        );
        console.log("Reservation created successfully!", reservationResponse);

        if (reservationResponse.error) {
          setConfirmOrderStatus(0);
        }
        if (reservationResponse[0].reservationId) {
          const data = {
            reservationId: reservationResponse[0].reservationId,
            encryptedCompanyId: reservationResponse[0].encryptedCompanyId,
          };
          setReservatedData(data);
          setAvailableReservation(true);
          setPingReservationChecked(true);

          clearExistingInterval();

          const id = setInterval(checkReservationStatus, 30000);

          setIntervalId(id);
        } else {
          setConfirmOrderStatus(0);
        }
      } catch (error) {
        setConfirmOrderStatus(0);
        console.log(
          "Error fetching product or creating reservation:",
          error.message
        );
      } finally {
        setReservationLoading(false);
      }
    }
  };

  const handlePhoneNumberChange = (value, country) => {
    setPhoneNumber(value);
    setCountryCode(country.dialCode);
  };

  return (
    <div className="order-container">
      {isLoading ? (
        <div className="text-center">
          <GridLoader color="#36d7b7" />
        </div>
      ) : (
        <div className="box-booked">
          <div className="motorhome-booked-description">
            <div className="row gx-4 pickup-picker bg-white px-3 pt-4">
              <div className="col-lg-6 col-12">
                <PickUp
                  current={currentLocation}
                  onClickSelect={onPickupPoint}
                />
              </div>
              <div className="col-lg-6 col-12">
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
              </div>
            </div>
            <div className="row gx-4 pickup-picker bg-white px-3 pt-4">
              <div className="col-md-6 motorhome-carousel">
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
                </div>
              </div>
              <div className="col-md-6">
                <div className="pt-3 motorhome-text5">
                  <span>{t("motorhome.specs.pretext")}</span>
                </div>
                <h2 className="pt-2  motorhome-title-g">
                  <span>
                    {MotorHomeFunctions.getObjectPropertyValue(
                      product.title?.rendered,
                      name
                    )}
                  </span>
                </h2>
                <ConvertText
                  content={MotorHomeFunctions.getObjectPropertyValue(
                    product.acf?.properties.find(
                      (property) => property.propertyKey === "description_long"
                    ),
                    propertyText
                  )}
                  limit={300}
                />
              </div>
            </div>
          </div>
          <div className="row motorhome-booked-description mt-5">
            <div className="col-md-7 bg-white px-3 pt-4">
              <div className="p-3 number-persons-complete d-flex flex-row justify-content-between">
                <div>
                  <select
                    className="number_of_persons px-1 py-1"
                    onChange={(e) => onChangeNumberOfPersonsClick(e)}
                    value={number_of_persons}
                  >
                    {[
                      ...Array(
                        product.acf?.properties?.find(
                          (property) => property.propertyKey === "persons_max"
                        ).propertyValue
                      ),
                    ].map((_each, index) => {
                      return (
                        <option key={index} value={index + 1}>
                          {index + 1}
                        </option>
                      );
                    })}
                  </select>
                  <span className="ps-2">{t("order.booking.required")}</span>
                </div>
                <div></div>
              </div>
              <div className="included-box mt-5">
                <p className="motorhome-text1 pt-4">
                  {t("order.booking.included")}
                </p>
                <div className="d-flex flex-row justify-content-between">
                  <span></span>
                  <div>
                    <span className="pe-4">{t("order.booking.price")}</span>
                    <span>{t("order.booking.total")}</span>
                  </div>
                </div>
                <hr />
                {product.acf?.additional_services.length > 0 &&
                  product.acf?.additional_services
                    .filter((each) => each.rules[0].selectedByDefault === true)
                    .map((each, index) => {
                      return (
                        <div
                          key={`${each.id}-${index}`}
                          className="d-flex flex-row justify-content-between mt-3"
                        >
                          <div className="d-flex flex-row ">
                            <div>
                              <img
                                src={images.checked}
                                className=""
                                alt="checkbox"
                              ></img>
                            </div>
                            <div className="ms-2">
                              {MotorHomeFunctions.getObjectPropertyValue(
                                each,
                                name
                              )}
                            </div>
                          </div>
                          <div className="d-flex flex-row justify-content-between">
                            <span className="col-6 pe-4">{each.price},-</span>
                            <span className="col-6">
                              {each.price *
                                (each.service_type === "perDay"
                                  ? MotorHomeFunctions.getAllDatesBetweenMonths(
                                      startDate,
                                      endDate
                                    )
                                  : 1)}
                              ,-
                            </span>
                          </div>
                        </div>
                      );
                    })}
              </div>
              <div className="addiotion-extras">
                <p className="motorhome-text1 pt-5 mt-4">
                  {t("order.booking.additional")}
                </p>
                <div className="d-flex flex-row justify-content-between">
                  <span></span>
                  <div>
                    <span className="pe-4">{t("order.booking.price")}</span>
                    <span>{t("order.booking.total")}</span>
                  </div>
                </div>
                <hr />
                {product.acf?.additional_services.length > 0 &&
                  product.acf?.additional_services
                    .filter((each) => each.rules[0].selectedByDefault === false)
                    .map((each, index) => {
                      return (
                        <>
                          <div className="d-flex flex-row justify-content-between">
                            <div>
                              <select
                                onChange={(e) =>
                                  onClickAdditionalSelect(e, index, each.price)
                                }
                              >
                                <option value="0">0</option>
                                {[...Array(each.rules[0].maxValue)].map(
                                  (_each, index) => {
                                    return (
                                      <option key={index} value={index + 1}>
                                        {index + 1}
                                      </option>
                                    );
                                  }
                                )}
                              </select>
                              <span className="ps-4">
                                {each.name.length > 70
                                  ? MotorHomeFunctions.getObjectPropertyValue(
                                      each,
                                      name
                                    ).substring(0, 50) + "..."
                                  : MotorHomeFunctions.getObjectPropertyValue(
                                      each,
                                      name
                                    )}
                              </span>
                            </div>
                            <div>
                              <span className="pe-4">{each.price},- </span>
                              <span>
                                {Number(each.price) *
                                  (Number(
                                    selectedExtraValue?.find(
                                      (value) => value.id === index
                                    )?.count
                                  )
                                    ? Number(
                                        selectedExtraValue.find(
                                          (value) => value.id === index
                                        ).count
                                      )
                                    : 0)}
                                ,-
                              </span>
                            </div>
                          </div>
                          <hr />
                        </>
                      );
                    })}
              </div>
            </div>
            <div className="col-md-5 px-3 pt-4">
              {confirmOrderStatus === 2 && (
                <CheckoutUserInfo
                  additionalPrice={additionalPrices}
                  totalPrice={totalPrices}
                  onClickConfirmOrder={onClickConfirmOrder}
                  reservatedData={reservatedData}
                />
              )}
              {confirmOrderStatus === 0 && (
                <>
                  <div className="p-5">
                    <div className="motorhome-text5">
                      {t("order.booking.total_price")}
                    </div>
                    <h2 className="motorhome-red">{totalPrices},-</h2>
                    <div className="mt-5">
                      <div>
                        <span>{t("order.booking.persons")}</span>
                        <span className="ps-3">{number_of_persons}</span>
                      </div>
                      <div>
                        <span>{t("order.booking.price_per_night")}</span>
                        <span className="ps-3">{pricePerStep},-</span>
                      </div>
                      <div>
                        <span>{t("order.booking.night")}</span>
                        <span className="ps-3">
                          {MotorHomeFunctions.getAllDatesBetweenMonths(
                            startDate,
                            endDate
                          )}
                        </span>
                      </div>
                      <div>
                        <span>{t("order.booking.addtionals")}</span>
                        <span className="ps-3">{additionalPrices}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div>
                        <span>{t("order.booking.pickup_point")}</span>
                        <span className="ps-3">{currentLocation}</span>
                      </div>
                      <div>
                        <span>{t("order.booking.model")}</span>
                        <span className="ps-3">
                          {parser(product.title?.rendered).split("-")[0]}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div>{t("order.booking.check_in_out")}</div>
                      <div>
                        <span>{moment(startDate).format("YYYY-MM-DD")}</span>
                        <span className="ps-2">{">"}</span>
                        <span className="ps-2">
                          {moment(endDate).format("YYYY-MM-DD")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-grid gap-2 col-10 mx-auto pb-5">
                    <button
                      className="motorhome-button number-persons-confirm"
                      onClick={() => onClickConfirmOrder(1)}
                    >
                      {t("order.booking.confirm_order")}
                    </button>
                  </div>
                </>
              )}
              {confirmOrderStatus === 1 &&
                isReservationLoading &&
                !isAvailableReservation && (
                  <div className="text-center">
                    <GridLoader color="#36d7b7" />
                  </div>
                )}
              {confirmOrderStatus === 1 &&
                !isReservationLoading &&
                isAvailableReservation && (
                  <Checkout
                    additionalPrice={additionalPrices}
                    totalPrice={totalPrices}
                    handlePhoneNumberChange={handlePhoneNumberChange}
                    phoneNumber={phoneNumber}
                    countryCode={countryCode}
                    onChangeEmailHandler={onChangeEmailHandler}
                    onClickConfirmOrder={onClickConfirmOrder}
                    isEmailValid={isEmailValid}
                    conifirmEmail={conifirmEmail}
                    // onChangeResponseVerificationHandler={onChangeResponseVerificationHandler}
                  />
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmOrder;
