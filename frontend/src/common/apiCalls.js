import conf from "./config/properties";
import store from "./redux/store";

// TODO JSDocs for these

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

const getToken = () => {
  let token = store.getState().users.token;
  if (!token) {
    token = localStorage.getItem("token");
  }
  return token;
};

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

const setTask = async (task) => {
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

const deleteUser = async () => {
  console.log(store.getState().users.selectedUser);
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
