import Request from "./functions/Request.js";
import Proxy from "./functions/ParseProxy.js";

export default Request;
export function ParseProxy(raw_proxy) {
  return Proxy(raw_proxy);
}
