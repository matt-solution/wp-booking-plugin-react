import React from 'react';
import moment from 'moment';
import MotorHomeFunctions from '../../services/motorhome.functions';
import parser from 'html-react-parser';

const BookingSummary = ({ product, startDate, endDate, currentLocation, additionalPrices, productPrices, number_of_persons }) => {
  return (
    <div className="total-price-box">
      <div className="p-5">
        <div className="motorhome-text5">Total price</div>
        <h2 className="motorhome-red">
          {productPrices?.prices?.length > 0 &&
            productPrices.prices[0].pricePerStep *
              MotorHomeFunctions.getAllDatesBetweenMonths(startDate, endDate) +
              additionalPrices}
          ,-
        </h2>
        <div className="mt-5">
          <div>
            <span>Persons:</span>
            <span className="ps-3">{number_of_persons}</span>
          </div>
          <div>
            <span>Price per night:</span>
            <span className="ps-3">
              {productPrices?.prices?.length > 0 && productPrices.prices[0].pricePerStep}
              ,-
            </span>
          </div>
          <div>
            <span>Night:</span>
            <span className="ps-3">{MotorHomeFunctions.getAllDatesBetweenMonths(startDate, endDate)}</span>
          </div>
          <div>
            <span>Additionals:</span>
            <span className="ps-3">{additionalPrices}</span>
          </div>
        </div>
        <div className="mt-4">
          <div>
            <span>Pickup Point:</span>
            <span className="ps-3">{currentLocation}</span>
          </div>
          <div>
            <span>Model:</span>
            <span className="ps-3">{parser(product.title?.rendered).split("-")[0]}</span>
          </div>
        </div>
        <div className="mt-4">
          <div>Check-in and check out</div>
          <div>
            <span>{moment(startDate).format("YYYY-MM-DD")}</span>
            <span className="ps-2">{">"}</span>
            <span className="ps-2">{moment(endDate).format("YYYY-MM-DD")}</span>
          </div>
        </div>
      </div>
      <div className="d-grid gap-2 col-10 mx-auto pb-5">
        <button className="motorhome-button number-persons-confirm" onClick={gotoBookingSite}>
          Confirm order
        </button>
      </div>
    </div>
  );
};

export default BookingSummary;
