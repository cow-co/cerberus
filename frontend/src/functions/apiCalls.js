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

export { fetchImplants, fetchTasks, fetchTaskTypes, createTask };
