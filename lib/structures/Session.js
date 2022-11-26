"use strict";

import Request from "../functions/Request.js";

class Session {
  constructor() {
    this.cookies = "";
  }

  async req(options) {
    const parsed_options = this.addCookiesInOptions(options);
    const response = await Request(parsed_options);

    try {
      if (response.headers["set-cookie"]) {
        if (this.cookies)
          this.cookies +=
            "; " +
            response.headers["set-cookie"]
              .map((c) => c.split(";")[0])
              .join("; ");
        else
          this.cookies = response.headers["set-cookie"]
            .map((c) => c.split(";")[0])
            .join("; ");
      }
    } catch (error) {}

    return response;
  }

  addCookie(cookie) {
    if (typeof cookie == "object") {
      if (this.cookies.includes(cookie.name)) {
        return false;
      } else if (this.cookies) {
        this.cookies += `; ${cookie.name}=${cookie.value}`;

        return true;
      } else {
        this.cookies = `${cookie.name}=${cookie.value}`;

        return true;
      }
    } else {
      if (this.cookies.includes(cookie.split("=")[0])) {
        return false;
      } else if (this.cookies) {
        this.cookies += `; ${cookie.trim()}`;

        return true;
      } else {
        this.cookies = `${cookie.trim()}`;

        return true;
      }
    }
  }

  removeCookie(cookie_name) {
    if (this.cookies.includes(cookie_name)) {
      this.cookies = this.cookies.replace(
        this.cookies.slice(this.cookies.indexOf(cookie_name)).split(" ")[0],
        ""
      );

      return true;
    } else return false;
  }

  addCookiesInOptions(options) {
    if (this.cookies) {
      if (options.headers && options.headers?.cookie) {
        options.headers.cookie += "; " + this.cookies;
      } else {
        options.headers.cookie = this.cookies;
      }
    }

    return options;
  }

  json() {
    this.cookies
      .split("; ")
      .map(function (c) {
        return c.trim().split("=").map(decodeURIComponent);
      })
      .filter((a) => a.trim())
      .reduce(function (a, b) {
        try {
          a[b[0]] = JSON.parse(b[1]);
        } catch (e) {
          a[b[0]] = b[1];
        }
        return a;
      }, {});
  }
}

export default Session;
