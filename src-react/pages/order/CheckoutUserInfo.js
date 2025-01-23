import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import PhoneNumberInput from "./PhoneNumberInput";
import MotorHomeServices from "../../services/motorhome.services";
import { GridLoader } from "react-spinners";

const CheckoutUserInfo = ({
  totalPrice,
  additionalPrice,
  onClickConfirmOrder,
  reservatedData,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    address: "",
    zipCode: "",
    city: "",
    mobile: "",
  });

  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await MotorHomeServices.getUserData();
        if (response.data) {
          setFormData((prevData) => ({
            ...prevData,
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
            email: response.data.email || "",
            company: response.data.company || "",
            address: response.data.address || "",
            zipCode: response.data.zipCode || "",
            city: response.data.city || "",
            mobile: response.data.mobile || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getUserData();
  }, []);

  const handlePhoneNumberInputChange = (localNumber) => {
    setFormData((prevData) => ({ ...prevData, mobile: localNumber }));
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  }, []);

  const validate = useCallback(() => {
    const tempErrors = {};
    if (!formData.firstName) tempErrors.firstName = t("validation.required");
    if (!formData.lastName) tempErrors.lastName = t("validation.required");
    if (!formData.zipCode) tempErrors.zipCode = t("validation.required");
    if (!formData.city) tempErrors.city = t("validation.required");
    if (!agreeTerms) tempErrors.agreeTerms = t("validation.agree_terms");
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }, [formData, agreeTerms, t]);

  const handleCompleteOrder = async () => {
    if (validate()) {
      try {
        setIsLoading(true);
        const response = await MotorHomeServices.getOrderGroups();
        if (response.data && response.data.length > 0) {
          const payload = {
            reservationId: reservatedData.reservationId,
            encryptedCompanyId: reservatedData.encryptedCompanyId,
            amount: totalPrice,
            ...formData,
          };
          const checkoutResponse = await MotorHomeServices.checkout(payload);
          console.log("checkoutResponse=>", checkoutResponse);
          if (checkoutResponse.status === 200 && checkoutResponse.data.terminalUrl) {
            const terminalUrl = checkoutResponse.data.terminalUrl;
            console.log("terminalUrl=>", terminalUrl);  
            const queryString = terminalUrl.split('orderGroupId=')[1];
            const getOrderedresponse = await MotorHomeServices.getOrderedData(queryString);
            if(getOrderedresponse.data){
              localStorage.setItem("orderedData", JSON.stringify(getOrderedresponse.data))
              localStorage.setItem("userData", JSON.stringify(formData));
              window.location.href = `${terminalUrl}`;
            }else{
                setIsLoading(false);
            }
          }else{
            setIsLoading(false);
          }
        }else{
            setIsLoading(false);
        }
      } catch (error) {
        console.error("Error completing order:", error);
        setIsLoading(false);
      }
    } else {
      console.log("Form is invalid, show error messages");
    }
  };

  return isLoading ? (
    <div className="text-center">
      <GridLoader color="#36d7b7" />
    </div>
  ) : (
    <div className="p-5 d-flex flex-column gap-2">
      <div>{t("order.booking.summary")}</div>
      <div>{additionalPrice}, NOK-</div>
      <div>{totalPrice}, NOK-</div>

      <div>{t("order.complete_booking")}</div>

      <div className="d-flex flex-column gap-2">
        <div className="d-flex flex-row gap-2">
          <InputField
            className="checkout-selected-emailbox"
            type="text"
            placeholder={t("order.first_name")}
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
          />
          <InputField
            className="checkout-selected-emailbox"
            type="text"
            placeholder={t("order.last_name")}
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
          />
        </div>
        <div>
          <input
            className="checkout-selected-emailbox"
            type="email"
            value={formData.email}
            readOnly
          />
        </div>
        <div>
          <PhoneNumberInput
            handlePhoneNumberChange={handlePhoneNumberInputChange}
            phoneNumber={formData.mobile}
          />
        </div>
        <InputField
          className="checkout-selected-emailbox"
          type="text"
          placeholder={t("order.company")}
          name="company"
          value={formData.company}
          onChange={handleInputChange}
        />
        <InputField
          className="checkout-selected-emailbox"
          type="text"
          placeholder={t("order.address")}
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
        <div className="d-flex flex-row gap-2">
          <InputField
            className="checkout-selected-emailbox"
            type="text"
            placeholder={t("order.zip_code")}
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            error={errors.zipCode}
          />
          <InputField
            className="checkout-selected-emailbox"
            type="text"
            placeholder={t("order.city")}
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            error={errors.city}
          />
        </div>
        <div className="d-flex flex-row mt-4">
          <input
            type="checkbox"
            className="mt-n1 me-1"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
          />
          <div className="d-flex flex-row ms-2 text-start">
            <div>{t("order.agree_with")}</div>
            <Link to="#">{t("order.terms_and_conditions")}</Link>
          </div>
        </div>
        {errors.agreeTerms && (
          <span className="error">{errors.agreeTerms}</span>
        )}
        <div>
          <button
            className="w-100 mt-5 motorhome-button number-persons-confirm"
            onClick={handleCompleteOrder}
          >
            {t("order.booking.complete_order")}
          </button>
        </div>
        <div>
          <button
            className="w-100 checkout-selected-email"
            onClick={() => onClickConfirmOrder(0)}
          >
            {t("order.back_to_search")}
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  className,
  type,
  placeholder,
  name,
  value,
  onChange,
  error,
}) => (
  <div>
    <input
      className={className}
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      required
    />
    {error && <span className="error">{error}</span>}
  </div>
);

export default CheckoutUserInfo;
