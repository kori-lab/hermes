import request from "./functions/Request.js";
import _Session from "./functions/Session.js";

export default request;
export const Session = _Session;

module.exports.defaults = request;
module.exports.Session = _Session;

[
  "head",
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "purge",
  "link",
  "unlink",
].forEach(function (method) {
  module.exports[method] = request;
});
