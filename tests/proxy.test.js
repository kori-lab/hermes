import Hermes from "@kori_xyz/hermes";

const response = await Hermes({
  url: "https://api.ipify.org/?format=json",
  proxy: "47.254.153.200:80",
  timeout: 10000,
});

/**
 * returns proxy ip
 */
console.log(response);
