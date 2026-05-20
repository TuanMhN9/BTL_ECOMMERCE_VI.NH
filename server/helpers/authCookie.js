const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";
const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_MAX_AGE_MS = 60 * 60 * 1000;

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
}

module.exports = {
  JWT_SECRET,
  AUTH_COOKIE_MAX_AGE_MS,
  getAuthCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};
