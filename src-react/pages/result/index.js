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


const SearchResult = () => {
  const { t } = useTranslation();
  const homedata = JSON.parse(localStorage.getItem("homedata"));
  const [startDate, setStartDate] = useState(homedata?.startDate || null);
  const [endDate, setEndDate] = useState(homedata?.endDate || null);
  const [currentLocation, setCurrentLocations] = useState(
    homedata?.location || "base"
  );
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [specialError, setSpecialServerError] = useState();
  const [prices, setAdditionalPrices] = useState([]);

  useEffect(() => {
    if (currentLocation != "base") {
      setLoading(true);
      setAllProducts([]);
      getProducts();
    }
  }, [currentLocation]);

  const getProducts = async () => {
    try {
      MotorHomeServices.getAllContents().then(
        (response) => {
          const products = response.data.filter((product) =>
            product.acf.properties.find(
              (property) => property.propertyText === currentLocation
            )
          );
          setProducts(products);
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          const _content =
            (error.response && error.response.data) ||
            error.message ||
            error.toString();
          console.log("_content=>", _content);
        }
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (allProducts.length > 0) {
      const totalPrices = [];
      allProducts.map((product, index) => {
        let totalPrice =
          Number(product.prices[0].pricePerStep) *
          MotorHomeFunctions.getAllDatesBetweenMonths(startDate, endDate);
    
        product.additionalServices
          ?.filter((each) => each.rules.selectedByDefault === true)
          .map((_each) => {
            if (_each.serviceType === "perDay") {
              totalPrice +=
                Number(_each.price) *
                MotorHomeFunctions.getAllDatesBetweenMonths(startDate, endDate);
            } else {
              totalPrice += Number(_each.price);
            }
          });
        totalPrices.push({ id: index, totalPrice: totalPrice });
      });
      setAdditionalPrices(totalPrices);
    }
  }, [allProducts]);
  
  console.log("prices", prices);  
  

  useEffect(() => {
    if (startDate != null && endDate != null && currentLocation === "base") {
      setLoading(true);
      setProducts([]);
      getAvailableProductsBySelectedRange();
    }
  }, [startDate, endDate]);

  const getAvailableProductsBySelectedRange = async () => {
    try {
      const startdate = moment(startDate).format("YYYY-MM-DD");
      const enddate = moment(endDate).format("YYYY-MM-DD");
      MotorHomeServices.checkAllAvailability(startdate, enddate).then(
        (response) => {
          const products = response.data?.accommodations?.filter(
            (product) => product.availability.available === true
          );
          setAllProducts(products);
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          const _content =
            (error.response && error.response.data) ||
            error.message ||
            error.toString();
          if (_content.code === "http_request_failed") {
            setAllProducts([]);
            setSpecialServerError(_content.message + "<br/>" + "Please retry");
          }
          console.log("_content=>", _content);
        }
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (startDate != null && endDate != null && currentLocation != "base") {
      setAllProducts([]);
      setLoading(true);
      getAvailablesAndPricesByProducts();
    }
  }, [products, startDate, endDate]);

  const getAvailablesAndPricesByProducts = async () => {
    try {
      const startdate = moment(startDate).format("YYYY-MM-DD");
      const enddate = moment(endDate).format("YYYY-MM-DD");
      (async () => {
        const data = await Promise.all(
          products.map(async (product, index) => {
            let totalPrice = 0;
            product?.acf?.additional_services.length > 0 && product.acf.additional_services.filter((each) => each.rules[0].selectedByDefault === true).map((_each) => {
            if (_each.service_type === "perDay") {
              totalPrice +=
                Number(_each.price) *
                MotorHomeFunctions.getAllDatesBetweenMonths(startDate, endDate);
              } else {
                totalPrice += Number(_each.price);
              }
            });

            const response = await MotorHomeServices.getPrices(
              startdate,
              enddate,
              product.acf.web_product_id
            );
            const available = response.data?.availability?.available;
            const calculatedPrice = response.data?.prices[0]?.calculatedPrice+totalPrice;
            return [available, calculatedPrice];
          })
        ).catch((error) => {
          console.error("Error in one of the promises:", error);
        });

        setResults(data);
        setLoading(false);
      })();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const onSetStartDate = (startdate) => {
    const data = {
      location: currentLocation,
      startDate: startdate,
      endDate: endDate,
    };
    localStorage.setItem("homedata", JSON.stringify(data));
    setStartDate(startdate);
  };

  const onSetEndDate = (enddate) => {
    const data = {
      location: currentLocation,
      startDate: startDate,
      endDate: enddate,
    };
    localStorage.setItem("homedata", JSON.stringify(data));
    setEndDate(enddate);
  };

  const onPickupPoint = (location) => {
    const data = {
      location: location,
      startDate: startDate,
      endDate: endDate,
    };
    localStorage.setItem("homedata", JSON.stringify(data));

    setCurrentLocations(location);
  };

  return (
    <div className="search-result-container">
      <div className="row gx-4 pickup-picker bg-white px-3 pt-4">
        <div className="col-lg-3 col-md-4 col-12">
          <PickUp current={currentLocation} onClickSelect={onPickupPoint} />
        </div>
        <div className="col-lg-5 col-md-8 col-12">
          <DatePickers
            startDate={startDate}
            setStartDate={onSetStartDate}
            endDate={endDate}
            setEndDate={onSetEndDate}
          />
        </div>
      </div>
      <h2 className="title pt-5">
        {t('result.title')}
      </h2>
      <div className="row gx-4 motorhomes pt-5">
        {specialError ?? specialError}
        {isLoading ? (
          <div className="text-center">
            <GridLoader color="#36d7b7" />
          </div>
        ) : allProducts.length === 0 && products.length > 0 ? (
          products.map((product, index) => {
            return results?.length > 0 ? (
              <MotorHome //booking available product
                product={product}
                key={index}
                searchResult={[
                  results[index][0],
                  results[index][1],
                  startDate,
                  endDate,
                  currentLocation,
                ]}
              />
            ) : (
              <MotorHome product={product} key={index} /> //booking unavailable product
            );
          })
        ) : products.length === 0 && allProducts.length > 0 ? (
          allProducts.map((product, index) => {
            //all products
            return (
              <MotorHome
                isAll={true}
                product={product}
                key={index}
                searchResult={[
                  product.availability.available,
                  prices.length > 0 && prices[index]?.totalPrice,
                  startDate,
                  endDate,
                  currentLocation,
                ]}
              />
            );
          })
        ) : (
          <div className="">
            <NoAvailable />
          </div>
        )}
      </div>
      {/* <MotorHomeTip /> */}
      </div>
  );
};

export default SearchResult;
