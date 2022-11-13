// Hermes v1.2.6 Copyright (c) 2022 Kori <korinamez@gmail.com> and contributors
'use strict';

var http = require('http');
var https = require('https');
var http2$1 = require('http2');

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_SCHEME,
  HTTP2_HEADER_AUTHORITY,
} = http2$1.constants;

class RequestManager {
  constructor() {
    this.midia_types = ["image", "video", "audio"];
  }

  proxyParse(text) {
    var input = text;

    const protocol = input.split("://")[0];

    if (input.includes("@"))
      input = input.substring(input.lastIndexOf("@") + 1);
    else if (input.includes("://")) input = input.split("://")[1];

    const host = input.split(":")[0];
    const port = parseInt(input.split(":")[1]);

    input = text.split("://")[1];

    input = text.substring(0, text.lastIndexOf("@"));
    const [username, password] = input.split(":");

    return { host, port, protocol: protocol || "https", username, password };
  }

  proxyTunnel(url, proxy, headers = {}, timeout) {
    return new Promise((resolve, reject) => {
      const urlParsed = new URL(url);
      const parsed_proxy =
        typeof proxy == "object" ? proxy : this.proxyParse(proxy);

      if (parsed_proxy.username) {
        headers["Proxy-Authorization"] =
          "Basic " +
          Buffer.from(
            parsed_proxy.username + ":" + parsed_proxy.password
          ).toString("base64");
      }

      http.request({
        host: parsed_proxy.host,
        port: parsed_proxy.port,
        method: "CONNECT",
        maxVersion: "TLSv1.3",
        path: `${urlParsed.hostname}:${urlParsed.port ? urlParsed.port : 443}`,
        timeout,
        headers,
      })
        .on("connect", (response, socket) => {
          if (response.statusCode == 200) {
            resolve(socket);
          } else {
            reject(response);
          }
        })
        .on("error", (err) => reject(err))
        .on("timeout", (err) => reject("timeout to connect in proxy"))
        .end();
    });
  }

  parseResponseData(buffer, headers) {
    var data;

    try {
      data = JSON.parse(buffer.toString());

      return data;
    } catch (error) {
      if (
        headers["content-type"] &&
        this.midia_types.some((type) => headers["content-type"].includes(type))
      ) {
        data = buffer;
      } else {
        data = buffer.toString();
      }

      return data;
    }
  }

  async parseOptions(options = {}) {
    const parsed_url = new URL(options.url);

    const buffer = Buffer.from(
      typeof options.payload == "object"
        ? JSON.stringify(options.payload)
        : typeof options.payload != "string" && options.payload
        ? String(options.payload)
        : options.payload || ""
    );

    if (options.http2) {
      if (options.proxy) {
        options.socket = await this.proxyTunnel(
          options.url,
          options.proxy,
          {},
          15000
        );
      }

      return {
        url: options.url,
        payload: buffer,
        client: {
          maxVersion: "TLSv1.3",
          ALPNProtocols: ["h2", "http/1.1"],
          socket: options.socket,
        },
        request: {
          [HTTP2_HEADER_AUTHORITY]: parsed_url.host,
          [HTTP2_HEADER_PATH]: parsed_url.pathname || "/",
          [HTTP2_HEADER_SCHEME]: parsed_url.protocol.split(":")[0],
          [HTTP2_HEADER_METHOD]:
            http2$1.constants[`HTTP2_METHOD_${options.method?.toUpperCase()}`],
          "Content-Type":
            options?.headers && options?.headers["Content-Type"]
              ? options?.headers["Content-Type"]
              : "text/plain",
          "Content-Length": buffer.length,
          Accept: "*/*, image/*",
          ...options?.headers,
        },
      };
    } else {
      if (options.proxy) {
        options.agent = new https.Agent({
          socket: await this.proxyTunnel(
            options.url,
            options.proxy,
            options.headers,
            options.timeout || 15000
          ).catch((error) => {
            throw error;
          }),
          keepAlive: true,
        });
      } else {
        options.agent = new https.Agent(options);
      }

      return {
        url: options.url,
        payload: buffer,
        request: {
          origin: parsed_url.origin,
          href: parsed_url.href,
          protocol: parsed_url.protocol || "https:",
          hostname: parsed_url.hostname,
          path: parsed_url.pathname || "/",
          port: parsed_url.port || 443,
          method: options.method?.toUpperCase() || "GET",
          maxVersion: "TLSv1.3",
          timeout: options.timeout || 15000,
          headers: {
            accept: "application/json, text/plain, image/*, */*",
            "accept-language": "en-US,en;q=0.9",
            "Content-Length": buffer.length,
            ...options?.headers,
          },
          ...options,
        },
      };
    }
  }
}

var RequestManager$1 = new RequestManager();

function BaseRequest$1(options) {
  return new Promise(async (resolve, reject) => {
    const parsed_options = await RequestManager$1.parseOptions(options);

    const req = http.request(parsed_options.request, (res) => {
      const response_data = [];

      res.on("data", (chunk) => {
        response_data.push(chunk);
      });

      res.on("end", () => {
        res.data = RequestManager$1.parseResponseData(
          Buffer.concat(response_data),
          res.headers
        );

        resolve(res);
      });
    }).on("error", (error) => {
      reject(error);
    });

    if (parsed_options.payload?.length > 0) req.write(parsed_options.payload);

    req.end();
  });
}

function BaseRequest(options) {
  return new Promise(async (resolve, reject) => {
    const parsed_options = await RequestManager$1.parseOptions(options);

    const req = https.request(parsed_options.request, (res) => {
      const response_data = [];

      res.on("data", (chunk) => {
        response_data.push(chunk);
      });

      res.on("end", () => {
        res.data = RequestManager$1.parseResponseData(
          Buffer.concat(response_data),
          res.headers
        );

        resolve(res);
      });
    }).on("error", (error) => {
      reject(error);
    });

    if (parsed_options.payload?.length > 0) req.write(parsed_options.payload);

    req.end();
  });
}

const { HTTP2_HEADER_STATUS } = http2$1.constants;

function http2(options) {
  return new Promise(async (resolve) => {
    const parsed_options = await RequestManager$1.parseOptions(options);
    const clientSession = http2$1.connect(parsed_options.url, parsed_options.client);
    const req = clientSession.request(parsed_options.request);

    req.on("response", (headers, flags) => {
      const response_data = [];

      req.on("data", (chunk) => {
        response_data.push(chunk);
      });

      req.on("end", () => {
        req.close();
        clientSession.close();

        resolve({
          flags,
          status: headers[HTTP2_HEADER_STATUS],
          headers,
          data: RequestManager$1.parseResponseData(
            Buffer.concat(response_data),
            headers
          ),
        });
      });
    });

    if (parsed_options.payload?.length > 0) req.write(parsed_options.payload);

    req.end();
  });
}

function Request(options) {
  return options.http2
    ? http2(options)
    : options.url.includes("http:")
    ? BaseRequest$1(options)
    : BaseRequest(options);
}

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
        this.cookies = `; ${cookie.name}=${cookie.value}`;

        return true;
      } else {
        this.cookies = `${cookie.name}=${cookie.value}`;

        return true;
      }
    } else {
      if (this.cookies.includes(cookie.split("=")[0])) {
        return false;
      } else if (this.cookies) {
        this.cookies = `; ${cookie.trim()}`;

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
}

Request.Session = Session;

[
  "get",
  "post",
  "patch",
  "options",
  "delete",
  "head",
  "put",
  "link",
  "unlink",
  "purge",
].forEach((method) => {
  Request[method] = (options) => Request({ ...options, method });
});

module.exports = Request;
//# sourceMappingURL=hermes.cjs.map
