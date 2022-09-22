import Request from "./lib/functions/Request.js";
import Proxy from "./lib/functions/ParseProxy.js";

export default Request;
export function ParseProxy(raw_proxy) {
  return Proxy(raw_proxy);
}
