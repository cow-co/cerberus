import conf from "./config/properties";

const fetchTasks = async (implantId, showSent) => {
  let json = null;
  try {
    if (showSent === undefined) {
      showSent = true;
    }
    const response = await fetch(
      `${conf.apiURL}tasks/${implantId}?includeSent=${showSent}`
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
    const response = await fetch(`${conf.apiURL}task-types`);
    console.log("RESPONSE " + JSON.stringify(response));
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
    const response = await fetch(`${conf.apiURL}implants`);
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
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify(task),
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
      headers: new Headers({ "content-type": "application/json" }),
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

const deleteTask = async (task) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}tasks/${task._id}`, {
      method: "DELETE",
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

const deleteTaskType = async (taskTypeId) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}task-types/${taskTypeId}`, {
      method: "DELETE",
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

const register = async (username, password) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/register`, {
      method: "POST",
      headers: new Headers({ "content-type": "application/json" }),
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
  return json;
};

const login = async (username, password) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}access/login`, {
      method: "POST",
      headers: new Headers({ "content-type": "application/json" }),
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
    const response = await fetch(`${conf.apiURL}users/user/${username}`);
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
      headers: new Headers({ "content-type": "application/json" }),
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

const deleteUser = async (userId) => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}users/user/${userId}`, {
      method: "DELETE",
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

const checkSessionCookie = async () => {
  let json = null;
  try {
    const response = await fetch(`${conf.apiURL}users/check-session`);
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
  fetchImplants,
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
  checkSessionCookie,
};
