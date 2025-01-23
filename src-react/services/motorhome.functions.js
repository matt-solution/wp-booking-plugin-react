import moment from "moment";

const getAllDatesBetweenMonths = (startMonth, endMonth) => {
  const startMoment = moment(startMonth, 'YYYY-MM-DD');
  const endMoment = moment(endMonth, 'YYYY-MM-DD');
  const allDates = [];
  let currentMoment = startMoment.clone();
  
  while (currentMoment.isBefore(endMoment)) { // This will ensure it stops a day before the endMonth
    allDates.push(currentMoment.format('YYYY-MM-DD'));
    currentMoment.add(1, 'day');
  }

  return allDates.length;
};

const getObjectPropertyValue = (obj, key) =>{
  return obj[key];
}

const MotorHomeFunctions = {
  getAllDatesBetweenMonths,
  getObjectPropertyValue
}

export default MotorHomeFunctions;