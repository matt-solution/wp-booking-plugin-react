import React, { useState, useEffect } from "react";
import moment from "moment";

const Thankyou = () => {
  const [orderedData, setOrderedData] = useState([]);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const ordereddata = JSON.parse(localStorage.getItem("orderedData"));
    const userdata = JSON.parse(localStorage.getItem("userData"));
    setOrderedData(ordereddata);
    setUserData(userdata);

  }, [])
  console.log("orderedData=>", orderedData);
  return (
    <div className="thanks">
      {orderedData && <>
      <div className="text-center motorhome-text1">Thanks for your order!</div>
      <div className="personal-information">
        <div className="name">Name: {orderedData?.orders[0].bookings[0].standardName}</div>
        <div className="name">Status: {orderedData?.orders[0].bookings[0].status}</div>
        <div className="name">Order Number: {orderedData?.id}</div>
        <div className="name">Registeration Date: {moment(orderedData.registrationDate).format("YYYY-MM-DD")}</div>
        <div className="name">User Name: {userData.firstName + " " + userData.lastName}</div>
        <div className="name">Address: {userData.address}</div>
        <div className="name">Mobile: {userData.mobile}</div>
        <div className="name">EMail: {userData.email}</div>
      </div></>}
    </div>
  );
};

export default Thankyou;
