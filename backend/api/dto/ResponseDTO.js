class ResponseDTO {
  /**
   * @param {object} entity
   * @param {Array<string>} errors
   */
  constructor(entity, errors) {
    this.entity = entity;
    this.errors = errors;
  }
}

module.exports = ResponseDTO;
