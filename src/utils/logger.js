import { CustomError } from "../errors/customErrors.js";

export function logError(error) {
  if (error instanceof CustomError) {
    error.log();
  } else {
    console.error(error);
  }
}
