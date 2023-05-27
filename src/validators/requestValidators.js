import { AuthorizationError, BadRequestError } from "../errors/customErrors.js";

export function validateAuthorizationHeader(authHeader) {
  if (!authHeader) {
    throw new AuthorizationError("Authorization header is required");
  }

  const authParts = authHeader.split(" ");
  if (authParts.length !== 2 || authParts[0].toLowerCase() !== "bearer") {
    throw new AuthorizationError(
      "Invalid authorization format. Expected 'Bearer <token>'"
    );
  }
  const access_token = authParts[1];
  return access_token;
}

export function validateRequestBody(body) {
  const { title, searchQueries } = body;
  if (
    !title ||
    !searchQueries ||
    (Array.isArray(searchQueries) && searchQueries.length === 0)
  ) {
    throw new BadRequestError(
      "Title and at least one search query are required"
    );
  }

  return { title, searchQueries };
}
