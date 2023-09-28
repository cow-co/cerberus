const fetchTasks = async (implantId, showSent) => {
  // TODO Make the backend URL configurable#
  const response = await fetch(
    `http://localhost:5000/api/tasks/${implantId}?includeSent=true`
  );
  const json = await response.json();
  return json;
};

const fetchTaskTypes = async () => {
  // TODO Make the backend URL configurable#
  const response = await fetch("http://localhost:5000/api/task-types");
  const json = await response.json();
  return json;
};

const fetchImplants = async () => {
  // TODO Make the backend URL configurable
  const response = await fetch("http://localhost:5000/api/implants");
  const json = await response.json();
  return json;
};

const createTask = async (task) => {
  // TODO Make the backend URL configurable
  const response = await fetch("http://localhost:5000/api/tasks", {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify(task),
  });
  const json = await response.json();
  return json.errors;
};

const deleteTask = async (task) => {
  const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
    method: "DELETE",
  });
  const json = await response.json();
  return json.errors;
};

const register = async (username, password) => {
  const response = await fetch("http://localhost:5000/api/access/register", {
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
  const response = await fetch("http://localhost:5000/api/access/login", {
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
  const response = await fetch("http://localhost:5000/api/access/logout", {
    method: "DELETE",
  });
  const json = await response.json();
  return json.errors;
};

const findUserByName = async (username) => {
  const response = await fetch("http://localhost:5000/api/users/" + username);
  return response.json();
};

const changeAdminStatus = async (userId) => {
  const response = await fetch("http://localhost:5000/api/access/admin", {
    method: "PUT",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      userId,
    }),
  });
  return response.json.errors;
};

export {
  fetchImplants,
  fetchTasks,
  fetchTaskTypes,
  createTask,
  deleteTask,
  register,
  login,
  logout,
  findUserByName,
  changeAdminStatus,
};
