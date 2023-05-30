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
  const { title } = body;

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

  const { searchQueries } = body;
  if (
    !searchQueries ||
    typeof searchQueries !== "object" ||
    !Array.isArray(searchQueries) ||
    searchQueries.length === 0 ||
    !searchQueries.every((query) => typeof query === "string")
  ) {
    throw new BadRequestError(
      `Invalid searchQueries. Must include at least 1 search query.`
    );
  }

  const { privacyStatus } = body;
  if (
    (privacyStatus && typeof privacyStatus !== "string") ||
    (typeof privacyStatus === "string" &&
      !["private", "public", "unlisted"].includes(privacyStatus))
  ) {
    throw new BadRequestError(
      "Invalid privacyStatus. Must be one of 'public', 'private', or 'unlisted'."
    );
  }

  return { title, searchQueries, privacyStatus };
}
