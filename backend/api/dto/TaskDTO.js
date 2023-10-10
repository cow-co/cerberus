class TaskDTO {
  /**
   * @typedef {object} ParamValue
   * @property {string} name
   * @property {string} value
   *
   * @param {string} id MongoDB ID of the task
   * @param {number} order Integer value indicating the position in the queue to be sent to the implant
   * @param {string} implantId ID of the implant to send to
   * @param {Array<ParamValue>} params Values of the params to the task
   * @param {boolean} sent Whether the task has already been sent to the implant
   */
  constructor(id, order, implantId, params, sent) {
    this.id = id;
    this.order = order;
    this.implantId = implantId;
    this.params = params;
    this.sent = sent;
  }

  get id() {
    return this.id;
  }
}

module.exports = TaskDTO;
