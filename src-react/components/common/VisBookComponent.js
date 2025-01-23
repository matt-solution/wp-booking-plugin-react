import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../../pages/home/index";
import ConfirmOrder from "../../pages/order/ConfirmOrder";
import Thankyou from "../../pages/order/Thankyou";
import CheckAvailability from "../../pages/order/CheckAvailability";
import SearchResult from "../../pages/result/index";
import { useTranslation } from 'react-i18next';

const VisBookComponent = () => {
  const { i18n } = useTranslation();

  const [currentLanguage, setCurrentLanguage] = useState();
  useEffect(() => {
    setCurrentLanguage(wpData?.currentLanguage);
    localStorage.setItem("lang", wpData?.currentLanguage);
    i18n.changeLanguage(wpData?.currentLanguage);
  }, []);

  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<SearchResult />} />
        <Route path="/order/check-availability" element={<CheckAvailability />} />
        <Route path="/order/confirm-order" element={<ConfirmOrder />} />
        <Route path="/order/*" element={<Thankyou />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default VisBookComponent;
