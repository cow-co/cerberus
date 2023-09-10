const fetchTasks = async (showSent) => {
  // TODO try/catch and error handling
  // TODO Make the backend URL configurable#
  const response = await fetch(
    "http://localhost:5000/api/implants?includeSent=true"
  );
  const json = await response.json();
  if (showSent) {
    return json.tasks;
  } else {
    return json.tasks.filter((task) => task.sent === false);
  }
};

const fetchImplants = async (showInactive) => {
  // TODO try/catch and error handling
  // TODO Make the backend URL configurable
  const response = await fetch("http://localhost:5000/api/implants");
  const json = await response.json();
  if (showInactive) {
    return json.implants;
  } else {
    return json.implants.filter((implant) => implant.isActive);
  }
};

export { fetchImplants, fetchTasks };
