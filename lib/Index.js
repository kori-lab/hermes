import Request from "./functions/Request.js";
import _Session from "./functions/Session.js";
import Proxy from "./functions/ParseProxy.js";

export default Request;
export function ParseProxy(raw_proxy) {
  return Proxy(raw_proxy);
}
export const Session = _Session;
