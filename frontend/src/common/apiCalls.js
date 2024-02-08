import conf from "./config/properties";
import store from "./redux/store";

/**
 * Gets the (non-sensitive) security configuration, including whether PKI is enabled,
 * and what the password requirements are.
 * @returns The JSON returned by the request
 */
const getSecurityConfig = async () => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/config`);
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Grabs the JWT from local memory
 * @returns The JWT, if it exists in memory
 */
const getToken = () => {
  let token = store.getState().users.token;
  if (!token) {
    token = localStorage.getItem("token");
  }
  return token;
};

/**
 * Grab the list of tasks for the given implant
 * @param {string} implantId The (implant-determined, *not* database) implant ID
 * @param {boolean} showSent Should we include sent implants
 * @returns
 */
const fetchTasks = async (implantId, showSent) => {
  let json = null;
  try {
    if (showSent === undefined) {
      showSent = true;
    }
    const response = await fetch(
      `${conf.apiURL}tasks/${implantId}?includeSent=${showSent}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Get the list of available task types
 * @returns The JSON from the response
 */
const fetchTaskTypes = async () => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}task-types`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Get the list of available implants
 * @returns The JSON from the response
 */
const fetchImplants = async () => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}implants`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Deletes the implant selected in Redux
 * @returns The JSON from the response
 */
const deleteImplant = async () => {
  let json = null;
  try {
    const response = await fetch(
      `${conf.apiURL}implants/${store.getState().implants.selected.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Updates the selected task
 * @returns The JSON from the response
 */
const setTask = async () => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}tasks`, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        authorization: `Bearer ${getToken()}`,
      }),
      body: JSON.stringify(store.getState().tasks.selected),
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Creates a new task type
 * @param {object} taskType
 * @returns The JSON from the response
 */
const createTaskType = async (taskType) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}task-types`, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        authorization: `Bearer ${getToken()}`,
      }),
      body: JSON.stringify(taskType),
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Deletes the selected task
 * @returns The JSON from the response
 */
const deleteTask = async () => {
  let json = null;
  try {
    const response = await fetch(
      `${conf.apiURL}tasks/${store.getState().tasks.selected._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Deletes the task type which is stored in Redux tasks.selectedType
 * @returns The JSON from the response
 */
const deleteTaskType = async () => {
  let json = null;
  try {
    const response = await fetch(
      `${conf.apiURL}task-types/${store.getState().tasks.selectedType._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Registers our user
 * @param {string} username Not used by backend if PKI is enabled
 * @param {string} password Not used by backend if PKI is enabled
 * @param {string} confirmPassword Not used by backend if PKI is enabled
 * @returns The JSON from the response
 */
const register = async (username, password, confirmPassword) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/register`, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        authorization: `Bearer ${getToken()}`,
      }),
      body: JSON.stringify({
        username,
        password,
        confirmPassword,
      }),
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Logs us in
 * @param {string} username
 * @param {string} password
 * @returns The JSON from the response
 */
const login = async (username, password) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/login`, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        authorization: `Bearer ${getToken()}`,
      }),
      body: JSON.stringify({
        username,
        password,
      }),
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json; // Because we will want to extract the returned username (which will have been trimmed etc) as well as the errors
};

/**
 * Logs the user out
 * @returns The JSON from the response
 */
const logout = async () => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/logout`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Finds the given user
 * @param {string} username
 * @returns The JSON from the response
 */
const findUserByName = async (username) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}users/user/${username}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Changes whether the given user is an admin
 * @param {string} userId
 * @param {boolean} makeAdmin
 * @returns The JSON from the response
 */
const changeAdminStatus = async (userId, makeAdmin) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/admin`, {
      method: "PUT",
      headers: new Headers({
        "content-type": "application/json",
        authorization: `Bearer ${getToken()}`,
      }),
      body: JSON.stringify({
        userId,
        makeAdmin,
      }),
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Deletes the user stored in the redux state
 * @returns The JSON from the response
 */
const deleteUser = async () => {
  let json = null;
  try {
    const response = await fetch(
      `${conf.apiURL}users/user/${store.getState().users.selectedUser.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Checks that our JWT is valid
 * @returns The JSON from the response
 */
const checkToken = async () => {
  let json = null;

  try {
    const response = await fetch(`${conf.apiURL}users/whoami`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Get the list of available parameter types
 * @returns The JSON from the response
 */
const getParamTypes = async () => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}task-types/param-data-types`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Get the list of available groups
 * @returns The JSON from the response
 */
const getGroups = async () => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/acgs`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      groups: [],
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Deletes the group currently stored in the groups.selected redux state
 * @returns The JSON from the HTTP response
 */
const deleteGroup = async () => {
  let json = null;
  try {
    const response = await fetch(
      `${conf.apiURL}access/acgs/${store.getState().groups.selected._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Create a new access control group
 * @param {object} acg
 * @returns The JSON from the response
 */
const createGroup = async (acg) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/acgs`, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        authorization: `Bearer ${getToken()}`,
      }),
      body: JSON.stringify(acg),
    });
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

/**
 * Change the access control groups for the given implant
 * @param {string} implantId
 * @param {array} acgs
 * @returns The JSON from the response
 */
const editACGs = async (implantId, acgs) => {
  let json = null;
  try {
    const response = await fetch(
      `${conf.apiURL}access/implants/${implantId}/acgs`,
      {
        method: "POST",
        headers: new Headers({
          "content-type": "application/json",
          authorization: `Bearer ${getToken()}`,
        }),
        body: JSON.stringify(acgs),
      }
    );
    json = await response.json();
  } catch (err) {
    console.error(err);
    json = {
      errors: ["Error when calling API. Check console for details."],
    };
  }
  return json;
};

export {
  getSecurityConfig,
  fetchImplants,
  deleteImplant,
  fetchTasks,
  fetchTaskTypes,
  setTask,
  createTaskType,
  deleteTask,
  deleteTaskType,
  register,
  login,
  logout,
  findUserByName,
  changeAdminStatus,
  deleteUser,
  checkToken,
  getParamTypes,
  getGroups,
  createGroup,
  deleteGroup,
  editACGs,
};
