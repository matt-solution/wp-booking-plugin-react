import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MobileDateRangePickers = (props) => {
  return (
    <div className="date-pickers">
      <div className="d-flex flex-row">
        <div className="col-12">
          <DatePicker
            wrapperClassName="w-full"
            showIcon
            className="myDatePicker"
            selectsRange={true}
            startDate={props.startDate}
            endDate={props.endDate}
            onChange={props.onHandleDateChange}
            highlightDates={props.highlightDates}
            isClearable={true}
            icon={
              <svg
                width="23"
                height="21"
                viewBox="0 0 23 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.8022 1.9064H18.6718V3.18465C18.6718 3.41899 18.4801 3.61073 18.2457 3.61073H17.3936C17.1592 3.61073 16.9675 3.41899 16.9675 3.18465V1.9064H6.74152V3.18465C6.74152 3.41899 6.54978 3.61073 6.31543 3.61073H5.46327C5.22893 3.61073 5.03719 3.41899 5.03719 3.18465V1.9064H2.90678C1.73505 1.9064 0.776367 2.86509 0.776367 4.03681V18.5236C0.776367 19.6953 1.73505 20.654 2.90678 20.654H20.8022C21.9739 20.654 22.9326 19.6953 22.9326 18.5236V4.03681C22.9326 2.86509 21.9739 1.9064 20.8022 1.9064ZM21.2283 17.8845C21.2283 18.4703 20.749 18.9497 20.1631 18.9497H3.5459C2.96004 18.9497 2.4807 18.4703 2.4807 17.8845V8.29763C2.4807 8.06329 2.67243 7.87155 2.90678 7.87155H20.8022C21.0366 7.87155 21.2283 8.06329 21.2283 8.29763V17.8845Z"
                  fill="#3B3B3B"
                />
                <path
                  d="M6.74144 0.628169C6.74144 0.393825 6.5497 0.202087 6.31536 0.202087H5.46319C5.22885 0.202087 5.03711 0.393825 5.03711 0.628169V1.90642H6.74144V0.628169Z"
                  fill="#3B3B3B"
                />
                <path
                  d="M18.6716 0.628169C18.6716 0.393825 18.4799 0.202087 18.2455 0.202087H17.3934C17.159 0.202087 16.9673 0.393825 16.9673 0.628169V1.90642H18.6716V0.628169Z"
                  fill="#3B3B3B"
                />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MobileDateRangePickers;
