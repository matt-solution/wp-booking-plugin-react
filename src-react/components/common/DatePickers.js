import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import calendarIcon from '../../assets/img/calendar.png';
import arrowIcon from '../../assets/img/arrow.png';

const DatePickers = (props) => {
  const today = new Date();
  today.setDate(today.getDate() + 7);

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  return (
    <div className="date-pickers">
      <div className="d-flex flex-row">
        <div className="col-6">
          <DatePicker
            showIcon
            placeholderText="From"
            className="myDatePicker"
            onChange={(date) => props.setStartDate(date)}
            selected={props.startDate}
            startDate={props.startDate}
            minDate={today}
            filterDate={isWeekday}
            onMonthChange={props.handleStartMonthChange}
            icon={<img src={calendarIcon} className="calendar-icon" alt="Calendar Icon" />}
          />
        </div>
        <div className="col-6 border-start">
          <DatePicker
            showIcon
            selectsEnd
            selected={props.endDate}
            className="myDatePicker"
            placeholderText="To"
            onChange={(date) => props.setEndDate(date)}
            endDate={props.endDate}
            startDate={props.startDate}
            minDate={props.startDate}
            filterDate={isWeekday}
            onMonthChange={props.handleEndMonthChange}
            icon={<img src={arrowIcon} className="calendar-icon" alt="Arrow Icon" />}
          />
        </div>
      </div>
    </div>
  );
};

export default DatePickers;
