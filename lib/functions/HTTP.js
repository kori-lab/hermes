"use strict";

import { request } from "http";
import RequestManager from "../structure/RequestManager.js";

function BaseRequest(options) {
  return new Promise(async (resolve, reject) => {
    const parsed_options = await RequestManager.parseOptions(options);

    const req = request(parsed_options.request, (res) => {
      const response_data = [];

      res.on("data", (chunk) => {
        response_data.push(chunk);
      });

      res.on("end", () => {
        res.data = RequestManager.parseResponseData(
          Buffer.concat(response_data),
          res.headers
        );

        resolve(res);
      });
    }).on("error", (error) => {
      reject(error);
    });

    if (parsed_options.payload?.length > 0) req.write(parsed_options.payload);

    req.end();
  });
}

export default BaseRequest;
