import { request, Agent } from "https";
import UserAgent from "user-agents";
import _connectProxy from "./ProxyTunnel.js";

const midia_types = ["image", "video", "audio"];

/**
 * @param {{String}} {url}
 */
function BaseRequest({
  url,
  port,
  method,
  headers,
  payload = "",
  proxy,
  timeout = 5000,
  randomUserAgent = false,
}) {
  return new Promise(async (resolve, reject) => {
    const payload_data = Buffer.from(
      typeof payload == "object" ? JSON.stringify(payload) : payload
    );
    const parsed_url = new URL(url);

    const options = {
      origin: parsed_url.origin,
      href: parsed_url.href,
      protocol: parsed_url.protocol,
      hostname: parsed_url.hostname,
      path: parsed_url.pathname,
      port: port ? port : parsed_url.port ? parsed_url.port : 443,
      method: method ? method.toUpperCase() : "GET",
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
      options.agent = new Agent({
        socket: await _connectProxy(url, proxy, options.headers, timeout).catch(
          (error) => reject(error)
        ),
        keepAlive: true,
      });
    }

    if (!isConnectProxy) {
      options.agent = new Agent(options);
    }

    const req = request(
      {
        ...options,
      },
      (res) => {
        const response_data = [];

        res.on("data", (chunk) => {
          response_data.push(chunk);
        });

        res.on("end", () => {
          const raw_data = Buffer.concat(response_data).toString();

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
      reject(error);
    });

    if (payload_data.length > 0) req.write(payload_data);
    req.end();
  });
}

export default BaseRequest;
