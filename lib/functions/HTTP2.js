import { connect, constants } from "http2";
import ProxyTunnel from "./ProxyTunnel.js";

export default function http2({
  url,
  method = "get",
  payload = "",
  proxy,
  headers = {},
}) {
  return new Promise(async (resolve) => {
    const options = {
      maxVersion: "TLSv1.3",
      ALPNProtocols: ["h2", "http/1.1"],
    };

    if (proxy) {
      options.socket = await ProxyTunnel(url, proxy, {}, 15000);
    }

    const parsed_url = new URL(url);
    const clientSession = connect(url, {
      ...options,
    });

    const {
      HTTP2_HEADER_PATH,
      HTTP2_HEADER_STATUS,
      HTTP2_HEADER_METHOD,
      HTTP2_HEADER_SCHEME,
    } = constants;

    const buffer = Buffer.from(
      typeof payload == "object"
        ? JSON.stringify(payload)
        : typeof payload != "string" && payload
        ? String(payload)
        : payload
    );

    const req = clientSession.request({
      [HTTP2_HEADER_PATH]: parsed_url.pathname,
      [HTTP2_HEADER_SCHEME]: "https:",
      [HTTP2_HEADER_METHOD]: constants[`HTTP2_METHOD_${method.toUpperCase()}`],
      "Content-Type": headers["Content-Type"] || "text/plain",
      "Content-Length": buffer.length,
      Accept: "*/*, image/*",
      ...headers,
    });

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
          data: parseData(response_data),
        });
      });
    });

    if (payload) req.write(buffer);

    req.end();
  });
}

function parseData(buffer) {
  const string = Buffer.concat(buffer).toString();

  try {
    return JSON.parse(string);
  } catch (error) {
    return string;
  }
}
