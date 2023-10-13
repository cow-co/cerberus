import conf from "../common/config/properties";

const fetchTasks = async (implantId, showSent) => {
  if (showSent === undefined) {
    showSent = true;
  }
  const response = await fetch(
    `${conf.apiURL}apitasks/${implantId}?includeSent=${showSent}`
  );
  const json = await response.json();
  return json;
};

const fetchTaskTypes = async () => {
  const response = await fetch(`${conf.apiURL}task-types`);
  const json = await response.json();
  return json;
};

const fetchImplants = async () => {
  const response = await fetch(`${conf.apiURL}implants`);
  const json = await response.json();
  return json;
};

const createTask = async (task) => {
  const response = await fetch(`${conf.apiURL}tasks`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify(task),
  });
  const json = await response.json();
  return json.errors;
};

const createTaskType = async (taskType) => {
  const response = await fetch(`${conf.apiURL}task-types`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify(taskType),
  });
  const json = await response.json();
  return json.errors;
};

const deleteTask = async (task) => {
  const response = await fetch(`${conf.apiURL}tasks/${task._id}`, {
    method: "DELETE",
  });
  const json = await response.json();
  return json.errors;
};

const deleteTaskType = async (taskTypeId) => {
  const response = await fetch(`${conf.apiURL}task-types/${taskTypeId}`, {
    method: "DELETE",
  });
  const json = await response.json();
  return json.errors;
};

const register = async (username, password) => {
  const response = await fetch(`${conf.apiURL}access/register`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      username,
      password,
    }),
  });
  const json = await response.json();
  return json.errors;
};

const login = async (username, password) => {
  const response = await fetch(`${conf.apiURL}access/login`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      username,
      password,
    }),
  });
  const json = await response.json();
  return json; // Because we will want to extract the returned username (which will have been trimmed etc) as well as the errors
};

const logout = async () => {
  const response = await fetch(`${conf.apiURL}access/logout`, {
    method: "DELETE",
  });
  const json = await response.json();
  return json.errors;
};

const findUserByName = async (username) => {
  const response = await fetch(`${conf.apiURL}users/user/${username}`);
  return response.json();
};

const changeAdminStatus = async (userId, makeAdmin) => {
  const response = await fetch(`${conf.apiURL}access/admin`, {
    method: "PUT",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      userId,
      makeAdmin,
    }),
  });
  return response.json.errors;
};

const deleteUser = async (userId) => {
  const response = await fetch(`${conf.apiURL}users/user/${userId}`, {
    method: "DELETE",
  });
  return response.json();
};

const checkSessionCookie = async () => {
  const response = await fetch(`${conf.apiURL}users/check-session`);
  return response.json();
};

export {
  fetchImplants,
  fetchTasks,
  fetchTaskTypes,
  createTask,
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
