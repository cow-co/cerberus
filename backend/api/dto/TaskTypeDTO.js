class TaskTypeDTO {
  /**
   *
   * @param {string} id The MongoDB ID of this task type
   * @param {string} name Name of the task type
   * @param {Array<string>} params The names of the params
   */
  constructor(id, name, params) {
    this.id = id;
    this.name = name;
    this.params = params;
  }
}
