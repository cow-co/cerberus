import { addAlert, removeAlert } from "./alerts-slice";
import { generateAlert } from "../utils";
import conf from "../config/properties";
import store from "./store";
import { fetchImplants, fetchTaskTypes } from "../apiCalls";
import { setTaskTypes } from "./tasks-slice";
import { setImplants } from "./implants-slice";

const createErrorAlert = (errors) => {
  errors.forEach((error) => {
    const alert = generateAlert(error, "error");
    store.dispatch(addAlert(alert));
    setTimeout(() => store.dispatch(removeAlert(alert.id)), conf.alertsTimeout);
  });
};

const createSuccessAlert = (message) => {
  const alert = generateAlert(message, "success");
  store.dispatch(addAlert(alert));
  setTimeout(() => store.dispatch(removeAlert(alert.id)), conf.alertsTimeout);
};

const loadTaskTypes = async () => {
  const results = await fetchTaskTypes();
  store.dispatch(setTaskTypes(results.taskTypes));
};

export { createErrorAlert, createSuccessAlert, loadTaskTypes };
