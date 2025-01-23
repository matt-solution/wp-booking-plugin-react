import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import PhoneNumberInput from "./PhoneNumberInput";
import MotorHomeServices from "../../services/motorhome.services";
import { GridLoader } from "react-spinners";


const Checkout = ({
  totalPrice,
  additionalPrice,
  handlePhoneNumberChange,
  phoneNumber,
  onChangeEmailHandler,
  onClickConfirmOrder,
  isEmailValid,
  conifirmEmail,
  countryCode
}) => {
  const { t } = useTranslation();
  const [isSelectedEmail, setSelectedEmail] = useState(true);
  const [isEmailSendCode, setEmailSendCode] = useState(false);
  const [isPhoneSendCode, setPhoneSendCode] = useState(false);
  const inputRef = useRef(null);
  const [isEmailButtonEnabled, setEmailButtonEnabled] = useState(false);
  const [isPhoneButtonEnabled, setPhoneButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEmailSendCode]);

  useEffect(() => {
    if (isSelectedEmail && isEmailValid) {
      setEmailButtonEnabled(true);
    } else {
      setEmailButtonEnabled(false);
    }
  }, [isSelectedEmail, isEmailValid]);

  useEffect(() => {
    console.log("phoneNumber.length=>", phoneNumber?.length, isSelectedEmail);
    if(phoneNumber?.length>9 && !isSelectedEmail){
      setPhoneButtonEnabled(true);
    } else{
      setPhoneButtonEnabled(false);
    }
  }, [phoneNumber]);


  const selectVerifyMethod = (method) => {
    if (method === 1) {
      setSelectedEmail(true);
    } else {
      setSelectedEmail(false);
    }
  };
  // console.log("isButtonEnabled=>", isButtonEnabled, isEmailSendCode);
  const onChangeResponseVerificationHandler = (data) => {
      if (!Number.isNaN(Number(data)) && data.length === 6) {
        setTokenValid(true);
        const emailValidToken = async () => {
          setIsLoading(true);
          try {
            const response = await MotorHomeServices.emailLoginValidation(data);
            if(response.data){
              onClickConfirmOrder(2);
            }
          } catch (error) {
            console.error("Error during setupTerms:", error);
          } finally{
            setIsLoading(false);
          }
        }
        emailValidToken();
      }else{
        setTokenValid(false);
      }
  };

  const onClickEmailSendCodeHandler = async () => {
    try {
      setIsLoading(true);
      const response = await MotorHomeServices.emailConfirmation(conifirmEmail);
      console.log("Email confirmation sent successfully!", response);
      if(response.status === 200){
        setEmailSendCode(true);
      }
    } catch (error) {
      console.log("Failed to send email confirmation.");
    } finally {
      setIsLoading(false);
    }
  };

  const onClickPhoneSendCodeHandler = async () => {
    try {
      const localNumber = phoneNumber.replace(countryCode, '');

      setIsLoading(true);
      const response = await MotorHomeServices.phoneNumberConfirmation(countryCode, localNumber);
      console.log("phone confirmation sent successfully!", response);
      if(response.status === 200){
        setPhoneSendCode(true);
      }
    } catch (error) {
      console.log("Failed to send phone confirmation.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className="p-5 d-flex flex-column gap-2">
        <div>ORDER SUMMARY</div>
        <div>{additionalPrice},-NOK</div>
        <div>{totalPrice},-NOK</div>

        <div>COMPLETE YOUR BOOKING</div>
        <div>Please verify one of the following to continue</div>
        <div className="d-flex">
          <button
            className={`w-50 me-2 ${
              isSelectedEmail
                ? "checkout-selected-email"
                : "checkout-unselected-email"
            }`}
            onClick={() => selectVerifyMethod(1)}
          >
            E-mail
          </button>
          <button
            className={`w-50 ${
              isSelectedEmail
                ? "checkout-unselected-email"
                : "checkout-selected-email"
            }`}
            onClick={() => selectVerifyMethod(2)}
          >
            Phone number
          </button>
        </div>
        {isLoading ? (
          <div className="text-center">
            <GridLoader color="#36d7b7" />
          </div>
        ) : (
          <></>
        )}
        {isSelectedEmail ? (
          <>
            <div>
              <input
                type="email"
                className="px-2 checkout-selected-emailbox"
                placeholder="E-mail"
                value={conifirmEmail}
                onChange={(e) => onChangeEmailHandler(e.target.value)}
              />
            </div>
            <div>
              <button
                className={`w-100 motorhome-button ${
                  isEmailValid ? "email-verified" : "email-unverified"
                }`}
                onClick={() => onClickEmailSendCodeHandler()}
                disabled={!isEmailButtonEnabled}
              >
                {isEmailButtonEnabled && isEmailSendCode
                  ? "Re-send code"
                  : "Send code"}
              </button>
            </div>
            {isEmailSendCode && (
              <div className="d-flex flex-column gap-3 verification-code">
                <hr />
                <div>Please enter the code you received:</div>
                <input
                  ref={inputRef}
                  type="text"
                  className="px-2 checkout-verification-codebox"
                  placeholder="Verification Code"
                  onChange={(e) =>
                    onChangeResponseVerificationHandler(e.target.value)
                  }
                />
                <span>{isTokenValid !== null && !isTokenValid && "Response Token is not valid..."}</span>
                <button
                  className={`w-100 motorhome-button ${
                    isEmailValid ? "email-verified" : "email-unverified"
                  }`}
                >
                  Confirm
                </button>
                <hr />
              </div>
            )}
          </>
        ) : (
          <>
            <PhoneNumberInput
              handlePhoneNumberChange={handlePhoneNumberChange}
              phoneNumber={phoneNumber}
            />
            <div>
              <button
                className={`w-100 motorhome-button ${
                  isPhoneButtonEnabled ? "email-verified" : "email-unverified"
                }`}
                onClick={() => onClickPhoneSendCodeHandler()}
                disabled={!isPhoneButtonEnabled}
              >
                {isPhoneButtonEnabled && isPhoneSendCode
                  ? "Re-send code"
                  : "Send code"}
              </button>
            </div>
            {isPhoneSendCode && (
              <div className="d-flex flex-column gap-3 verification-code">
                <hr />
                <div>Please enter the code you received:</div>
                <input
                  ref={inputRef}
                  type="text"
                  className="px-2 checkout-verification-codebox"
                  placeholder="Verification Code"
                  onChange={(e) =>
                    onChangeResponseVerificationHandler(e.target.value)
                  }
                />
                <button
                  className={`w-100 motorhome-button ${
                    isEmailValid ? "email-verified" : "email-unverified"
                  }`}
                >
                  Confirm
                </button>
                <hr />
              </div>
            )}
          </>
        )}

        <div>
          <button
            className="w-100 mt-5 motorhome-button number-persons-confirm"
            onClick={() => onClickConfirmOrder(1)}
          >
            {t("order.booking.complete_order")}
          </button>
        </div>
        <div>
          <button
            className="w-100 checkout-selected-email"
            onClick={() => onClickConfirmOrder(0)}
          >
            Back to search
          </button>
        </div>
      </div>
    </>
  );
};

export default Checkout;
