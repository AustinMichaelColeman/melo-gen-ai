import { AuthorizationError, BadRequestError } from "../errors/customErrors.js";

export function validateAuthorizationHeader(authHeader) {
  if (!authHeader) {
    throw new AuthorizationError("Unauthorized");
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
    typeof title !== "string" ||
    title.length === 0 ||
    title.length > 150
  ) {
    throw new BadRequestError(
      "Invalid title. Title must be between 1 and 150 characters."
    );
  }

  if (
    !searchQueries ||
    typeof searchQueries !== "object" ||
    !Array.isArray(searchQueries) ||
    searchQueries.length === 0 ||
    searchQueries.length > 3 ||
    !searchQueries.every((query) => typeof query === "string")
  ) {
    throw new BadRequestError(
      `Invalid searchQueries. Must include between 1 and ${process.env.SONG_LIMIT} (inclusively) search queries.`
    );
  }

  return { title, searchQueries };
}
