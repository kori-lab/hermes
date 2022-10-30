import { request } from "http";
import ParseProxy from "./ParseProxy.js";

export default async function _connectProxy(url, proxy, headers = {}, timeout) {
  return new Promise((resolve, reject) => {
    const urlParsed = new URL(url);
    const parsed_proxy = typeof proxy == "object" ? proxy : ParseProxy(proxy);

    if (parsed_proxy.username && parsed_proxy.password) {
      headers["Proxy-Authorization"] =
        "Basic " +
        Buffer.from(parsed_proxy.username + ":" + parsed_proxy.password).toString("base64");
    }

    request({
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
