import Request from "../lib/functions/Request.js";

const response = await Request({
  url: "https://api.ipify.org/?format=json",
  proxy: "47.254.153.200:80",
  timeout: 10000,
});

console.log(response);
