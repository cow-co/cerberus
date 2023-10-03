const generateAlert = (message, type) => {
  const uuid = uuidv4();
  const alert = {
    id: uuid,
    type: type,
    message: message,
  };
  return alert;
};

export { generateAlert };
