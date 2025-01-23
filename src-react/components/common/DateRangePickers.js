import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { GridLoader } from "react-spinners";
import images from "../../components/common/Images";

const DateRangePickers = (props) => {
  const specialElementRef = useRef(null);
  const closebuttonRef = useRef(null);
  const [showPicker, setshowPicker] = useState(false);
  const dateRangePickerRef = useRef(null);
  const [selectedDates, setSelectedDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    const closeButton = document.querySelector(".btn-close");

    const handleCloseButtonClick = () => {
      setshowPicker(false);
    };

    if (closeButton) {
      closeButton.addEventListener("click", handleCloseButtonClick);
    }

    return () => {
      if (closeButton) {
        closeButton.removeEventListener("click", handleCloseButtonClick);
      }
    };
  }, [props.onClickCloseCalendar]);

  useEffect(() => {
    const nextMonthButton = document.querySelector(".rdrNextButton");
    const handleNextMonthButtonClick = () => {
      const currentDate =
        dateRangePickerRef.current.dateRange.calendar.state.focusedDate;
      const twoMonthsLater = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 2,
        currentDate.getDate()
      );
      props.handleEndMonthChange(twoMonthsLater);
    };

    if (nextMonthButton) {
      nextMonthButton.addEventListener("click", handleNextMonthButtonClick);
    }

    return () => {
      if (nextMonthButton) {
        nextMonthButton.removeEventListener(
          "click",
          handleNextMonthButtonClick
        );
      }
    };
  }, [props.handleEndMonthChange]);

  useEffect(() => {
    const prevMonthButton = document.querySelector(".rdrPprevButton");
    const handleNextMonthButtonClick = () => {
      const currentDate =
        dateRangePickerRef.current.dateRange.calendar.state.focusedDate;
      const twoMonthsBefore = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      if (twoMonthsBefore >= new Date())
        props.handleStartMonthChange(twoMonthsBefore);
    };

    if (prevMonthButton) {
      prevMonthButton.addEventListener("click", handleNextMonthButtonClick);
    }

    return () => {
      if (prevMonthButton) {
        prevMonthButton.removeEventListener(
          "click",
          handleNextMonthButtonClick
        );
      }
    };
  }, [props.handleStartMonthChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        specialElementRef.current &&
        !specialElementRef.current.contains(event.target)
      ) {
        setshowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (props.selectedDates[0].endDate > props.selectedDates[0].startDate) {
      setshowPicker(false);
    }
  }, [props.selectedDates]);

  const isDateAvailable = (date) => {
    return props?.highlightDates?.includes(moment(date).format("YYYY-MM-DD"));
  };

  const getAllDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handleSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    const allDates = getAllDatesInRange(startDate, endDate);
    const isAvailable = allDates.every((each) =>
      props.highlightDates.includes(each)
    );

    if (isAvailable) {
      props.onSetDateRange([ranges.selection]);
    }
  };

  return (
    <div className="date-pickers" ref={specialElementRef}>
      <div className="d-flex">
        <div
          className="col-11"
          onClick={() => {
            setshowPicker(!showPicker);
          }}
        >
          <button className="col-5 py-3 btn-datepicker-calendar">
            <img className="me-2" src={images.calendar} alt="calendar" />
            <span className="input-text">
              {props?.startDate
                ? moment(props?.startDate).format("YYYY-MM-DD")
                : "From"}
            </span>
          </button>
          <button className="col-5 py-3 btn-datepicker-arrow">
            <img className="me-2" src={images.arrow} alt="arrow" />
            <span className="input-text">
              {props?.endDate
                ? moment(props?.endDate).format("YYYY-MM-DD")
                : "To"}
            </span>
          </button>
        </div>
        {props.startDate && (
          <button
            ref={closebuttonRef}
            className="col-1 btn-close cancel"
            onClick={props.onClickCloseCalendar}
          ></button>
        )}
      </div>
      <div className="position-absolute w-100">
        {showPicker && (
          <DateRangePicker
            ref={dateRangePickerRef}
            onChange={handleSelect}
            months={2}
            ranges={props.selectedDates}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            showMonthAndYearPickers={true}
            showDateDisplay={true}
            minDate={new Date()}
            direction={props.direction ? "vertical" : "horizontal"}
            className="custom-date-range"
            dayContentRenderer={(date) => {
              const isSelected = props?.selectedDates?.some(
                (range) => date >= range.startDate && date <= range.endDate
              );
              const isAvailable = isDateAvailable(date);
              const classNames = [
                "custom-date-cell",
                isSelected
                  ? "selected"
                  : isAvailable
                  ? "available"
                  : "unavailable",
              ];
              return (
                <div className={classNames.join("-")}>{date.getDate()}</div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DateRangePickers;