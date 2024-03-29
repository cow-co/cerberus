import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

const generateAlert = (message, type) => {
  const uuid = uuidv4();
  const alert = {
    id: uuid,
    type: type,
    message: message,
  };
  return alert;
};

const isLoggedIn = () => {
  let isLoggedIn = false;
  if (Cookies.get("connect.sid")) {
    isLoggedIn = true;
  }
  return isLoggedIn;
};

const EMPTY_IMPLANT = { id: "", readOnlyACGs: [], operatorACGs: [] };
const EMPTY_TASK = {
  _id: "",
  implantId: "",
  taskType: { id: "", name: "" },
  params: [],
};
const EMPTY_TASK_TYPE = { _id: "", name: "", params: [] };
const EMPTY_USER = { _id: "", name: "", isAdmin: false, acgs: [] };

export {
  generateAlert,
  isLoggedIn,
  EMPTY_IMPLANT,
  EMPTY_TASK,
  EMPTY_TASK_TYPE,
  EMPTY_USER,
};
