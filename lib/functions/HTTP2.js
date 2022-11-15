import { connect, constants } from "http2";
import RequestManager from "../structures/RequestManager.js";

const { HTTP2_HEADER_STATUS } = constants;

export default function http2(options) {
  return new Promise(async (resolve) => {
    const parsed_options = await RequestManager.parseOptions(options);
    const clientSession = connect(parsed_options.url, parsed_options.client);
    const req = clientSession.request(parsed_options.request);

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
          data: RequestManager.parseResponseData(
            Buffer.concat(response_data),
            headers
          ),
        });
      });
    });

    if (parsed_options.payload?.length > 0) req.write(parsed_options.payload);

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
