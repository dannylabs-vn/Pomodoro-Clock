export class ErrorsHandling {
  constructor() {
    this.error = {};
  }
  setErrorStatus(status) {
    this.error.status = status;
  }
  setErrorsMessage(message) {
    this.error.message = message;
  }

  getErrorMessage() {
    return { status: this.error.status, message: this.error.message };
  }

  setError(status, message) {
    this.setErrorStatus(status);
    this.setErrorsMessage(message);
  }
  returnError(res) {
    res.status(this.error.status);
    res.json(this.getErrorMessage());
  }
  setErrorsDetails(details) {
    this.error.details = details;
  }
  logError() {
    console.error(this.error.details);
  }
}
