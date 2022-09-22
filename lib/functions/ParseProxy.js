function parse(input) {
  return stringToProxy(input);
}

function stringToProxy(input) {
  return { ...getAddress(input), ...getProtocol(input), ...getAuth(input) };
}

function getAddress(input) {
  if (input.includes("@")) input = input.substring(input.lastIndexOf("@") + 1);
  else if (input.includes("://")) input = input.split("://")[1];
  if (!input.includes(":")) throw new Error("Invalid address");
  const host = input.split(":")[0];
  const port = parseInt(input.split(":")[1]);
  if (/^\w+$/.test(host)) throw new Error("Invalid host");
  if (isNaN(port)) throw new Error("Invalid port");
  return { host, port };
}

function getProtocol(input) {
  if (!input.includes("://")) return { protocol: "http" };
  const protocol = input.split("://")[0];
  if (protocol.length < 3 || protocol.length > 6)
    throw new Error("Invalid protocol");
  return { protocol };
}

function getAuth(input) {
  if (!input.includes("@")) return undefined;
  if (input.includes("://")) input = input.split("://")[1];
  input = input.substring(0, input.lastIndexOf("@"));
  if (!input.includes(":")) throw new Error("Invalid auth");
  const [username, password] = input.split(":");
  return { username, password };
}

export default parse;
