import { request, Agent } from "https";
import http from "http";
import { Transform } from "stream";
import { URL } from "url";
import UserAgent from "user-agents";
import ParseProxy from "./ParseProxy.js";

const midia_types = ["image", "video", "audio"];

/**
 * @param {{String}} {url}
 */
function BaseRequest({
  url,
  port,
  method,
  headers,
  payload_data_json = "",
  proxy,
  timeout = 5000,
  randomUserAgent = false,
}) {
  return new Promise(async (resolve, reject) => {
    const payload_data = Buffer.from(
      typeof payload_data_json == "object"
        ? JSON.stringify(payload_data_json)
        : payload_data_json
    );
    const parsed_url = new URL(url);

    const options = {
      origin: parsed_url.origin,
      href: parsed_url.href,
      protocol: parsed_url.protocol,
      hostname: parsed_url.hostname,
      path: parsed_url.pathname,
      port: port ? port : parsed_url.port ? parsed_url.port : 443,
      method: method ? method.toLowerCase() : "GET",
      maxVersion: "TLSv1.3",
      timeout,
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "Content-Length": payload_data.length,
        ...headers,
      },
    };

    if (randomUserAgent) {
      options.headers["User-Agent"] = new UserAgent().toString();
    }

    const isConnectProxy = Boolean(
      proxy && (typeof proxy == "object" ? proxy.ip : proxy?.includes(":"))
    );

    if (isConnectProxy) {
      const json_proxy = ParseProxy(proxy);
      console.log(json_proxy)
      options.agent = await _connectProxy(
        url,
        json_proxy,
        options.headers,
        timeout
      ).catch((error) => reject(error));
    }

    if (!isConnectProxy) {
      options.agent = new Agent(options);
    }

    const req = request(
      {
        ...options,
      },
      (res) => {
        const response_data = new Transform();

        res.on("data", (chunk) => {
          response_data.push(chunk);
        });

        res.on("end", () => {
          const raw_data = response_data.read();

          try {
            res.data = JSON.parse(raw_data.toString());
            resolve(res);
          } catch (error) {
            if (
              midia_types.some((type) =>
                res.headers["content-type"].includes(type)
              )
            ) {
              res.data = raw_data;
            } else {
              res.data = raw_data.toString();
            }

            resolve(res);
          }
        });
      }
    ).on("error", (error) => {
      if (error.message) {
        error.response.status = error.response?.statusCode;
        error.response.data = error.response._body;
      }

      reject(error);
    });

    if (payload_data.length > 0) req.write(payload_data);
    req.end();
  });
}

export default BaseRequest;

async function _connectProxy(url, proxy, headers = {}, timeout) {
  return new Promise((resolve, reject) => {
    const urlParsed = new URL(url);

    if (proxy.username && proxy.password) {
      headers["Proxy-Authorization"] =
        "Basic " +
        Buffer.from(proxy.username + ":" + proxy.password).toString("base64");
    }

    http
      .request({
        host: proxy.host,
        port: proxy.port,
        method: "CONNECT",
        maxVersion: "TLSv1.3",
        path: `${urlParsed.hostname}:${urlParsed.port ? urlParsed.port : 443}`,
        timeout,
        headers,
      })
      .on("connect", (res, socket) => {
        if (res.statusCode == 200) {
          resolve(new Agent({ socket: socket, keepAlive: true }));
        } else {
          reject(res);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("timeout", (err) => {
        reject("timeout to connect in proxy");
      })
      .end();
  });
}
