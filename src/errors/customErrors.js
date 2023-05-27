export class CustomError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
  }

  log() {
    console.error(this.name + ": " + this.message);
    if (this.details) {
      console.error("Details:", this.details);
    }
  }
}

export class AuthorizationError extends CustomError {
  constructor(message) {
    super(message, 401);
  }
}

export class BadRequestError extends CustomError {
  constructor(message) {
    super(message, 400);
  }
}

export class InternalServerError extends CustomError {
  constructor(message, details = null) {
    super(message, 500, details);
  }
}
