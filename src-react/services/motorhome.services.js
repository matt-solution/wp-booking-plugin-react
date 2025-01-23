import axios from "axios";
import config from "./config";

const WP_API_URL = config.WP_Rest_API;
const WS_Visbook_RemoteTestAPI = config.RemoteTestAPI;

const getAllContents = async() => {
  return await axios.get(WP_API_URL);
};

const emailConfirmation = async(email) => {
  return await axios.post(config.RemoteTestAPI+"email-confirmation", {email});
};
const phoneNumberConfirmation = async(countryCode, phoneNumber) => {
  return await axios.post(config.RemoteTestAPI+"phonenumber-confirmation", {countryCode, phoneNumber});
};

const checkAvailability = async(start, end, product_id, entity_id = '10268') => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'availability/?product_id=' + product_id + '&end_date=' + end);
};

const getPrices = async(start, end, product_id, entity_id = '10268') => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'webproducts/?start_date=' + start + '&end_date=' + end + '&product_id=' + product_id);
};

const checkAllAvailability = async(start, end, entity_id = '10268') => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'webproducts/?start_date=' + start + '&end_date=' + end );
};

const createReservations = async(reservationData) => {
  try {
    const response = await axios.post(WS_Visbook_RemoteTestAPI + 'reservations', reservationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting reservation:', error);
    throw error;
  }
};

const createPingReservations = async(reservationData) => {
  try {
    const response = await axios.post(WS_Visbook_RemoteTestAPI + 'reservations/ping', reservationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('Error posting reservation:', error);
    throw error;
  }
};

const getWebProduct = async(fromDate, toDate, numberOfPeople, webProductId, entity_id = '10268') => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'getProductbyId/?from=' + fromDate + '&to=' + toDate + '&webProductId=' + webProductId);
};

const checkoutPaymentType = async() => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'checkout/paymentTypes');
};

const setupTerms = async(reservationData) => {
  try {
    const response = await axios.post(WS_Visbook_RemoteTestAPI + 'setup/terms', reservationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting reservation:', error);
    throw error;
  }
};

const emailLoginValidation = async (token) => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'validation/email', {
    params: {
      token: token
    },
    withCredentials: true
  });
};

const getUserData = async () => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'user', {
    withCredentials: true
  });
};

const getOrderGroups = async () => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'ordergroups', {
    withCredentials: true
  });
};

const checkout = async (payload) => {
  return await axios.post(WS_Visbook_RemoteTestAPI + 'checkout', payload, {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true
  });
};

const getOrderedData = async (orderGroupId) => {
  return await axios.get(WS_Visbook_RemoteTestAPI + 'ordergroups/id', {
    params: {
      orderGroupId: orderGroupId
    },
    withCredentials: true
  });
}

const getFullImagePath = (image, webProductId) => {
  const imagePathParts = image.split('/');
  const folderName = imagePathParts[1];
  const fileName = imagePathParts[2];

  // Construct the full URL
  return `${config.imageBaseURL}${webProductId}/${folderName}_${fileName}`;
};

const MotorHomeServices = {
  getAllContents,
  checkAvailability,
  getPrices,
  getFullImagePath,
  checkAllAvailability,
  emailConfirmation,
  phoneNumberConfirmation,
  createReservations,
  getWebProduct,
  createPingReservations,
  checkoutPaymentType,
  setupTerms,
  emailLoginValidation,
  getUserData,
  getOrderGroups,
  checkout,
  getOrderedData
};

export default MotorHomeServices;
