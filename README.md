<div align="center">
    <img src="https://images.vexels.com/media/users/3/190673/isolated/preview/6c2710b0ba8104a74f20b22ce0d93cb6-curso-grego-deus-hermes.png" />
    <h1>powerful and fast</h1>
    <small>Make simple and fast stealth requests, supporting the recently tls versions and any proxies (auth/port:ip). having feature for random user-agents to make better stealth request</small>
</div>

[![npm version](https://img.shields.io/npm/v/@kori_xyz/hermes.svg)](https://www.npmjs.org/package/@kori_xyz/hermes)
[![code coverage](https://img.shields.io/coveralls/mzabriskie/@kori_xyz/hermes.svg)](https://coveralls.io/r/mzabriskie/@kori_xyz/hermes)
[![install size](https://img.shields.io/github/size/kori-lab/hermes)](https://img.shields.io/github/size/kori-lab/hermes)
[![npm downloads](https://img.shields.io/npm/dm/@kori_xyz/hermes.svg)](https://npm-stat.com/charts.html?package=@kori_xyz/hermes)
[![Known Vulnerabilities](https://snyk.io/test/npm/@kori_xyz/hermes/badge.svg)](https://snyk.io/test/npm/@kori_xyz/hermes)
[![Code quality](https://img.shields.io/npms-io/quality-score/@kori_xyz/hermes)](https://img.shields.io/npms-io/quality-score/@kori_xyz/hermes)

<br />

## Install
> Available for any computer running [nodejs](https://nodejs.org/)

yarn
```bash
yarn add @kori_xyz/hermes
```

npm 
```bash
npm install @kori_xyz/hermes
```

## Examples
> this module is avaliable for CommonJS or ESM/Typescript

### CommonJS

using proxy

```javascript
const Request = require("@kori_xyz/hermes");

Request({
  url: "https://api.ipify.org/?format=json",
  /**
   * automatic parse proxy (supporting auth config)
   */
  proxy: "47.254.153.200:80", // or "username:password@host:port"
  timeout: 10000,
}).then((response) => {
  /**
   * returns proxy ip
   */
  console.log(response.data);
});
```

downloading any media

```javascript
const Request = require("@kori_xyz/hermes");
const { writeFileSync } = require("fs");

Request({
  url: "https://pt.wikipedia.org/static/images/mobile/copyright/wikipedia.png",
}).then((response) => {
  // learn about https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  const mime_type = {
    media: response.headers["content-type"].split("/")[0],
    extension: response.headers["content-type"].split("/")[1],
  };

  const file_name = `./${mime_type.media}.${mime_type.extension}`;

  /**
   * saving media
   */
  writeFileSync(
    file_name,
    /**
     * `response.data` automatic transforms media in buffer
     */
    response.data,
    {
      flag: "w+",
    }
  );

  console.log(response.headers["content-type"], response.data.length);
});
```

### ESM/TS

using proxy

```javascript
import Request from "@kori_xyz/hermes";

const response = await Request({
  url: "https://api.ipify.org/?format=json",
  /**
   * automatic parse proxy (supporting auth config)
   */
  proxy: "47.254.153.200:80", // or "username:password@host:port"
  timeout: 10000,
});

/**
 * returns proxy ip
 */
console.log(response.data);
```

downloading any media

```javascript
import Request from "@kori_xyz/hermes";
import { writeFileSync } from "fs";

const response = await Request({
  url: "https://pt.wikipedia.org/static/images/mobile/copyright/wikipedia.png",
});

// learn about https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
const mime_type = {
  media: response.headers["content-type"].split("/")[0],
  extension: response.headers["content-type"].split("/")[1],
};
const file_name = `./${mime_type.media}.${mime_type.extension}`;

/**
 * saving media
 */
writeFileSync(
  file_name,
  /**
   * `response.data` automatic transforms media in buffer
   */
  response.data,
  {
    flag: "w+",
  }
);

console.log(response.headers["content-type"], response.data.length);
```

## Request Config

```javascript
{
  // `url` is the server URL that will be used for the request
  url: 'https://example.com/',

  // `method` is the request method to be used when making the request
  method: 'GET', // default

  // `headers` are custom headers to be sent
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // `data` is the data to be sent as the request body
  // Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
  // When no `transformRequest` is set, must be of one of the following types:
  // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - Browser only: FormData, File, Blob
  // - Node only: Stream, Buffer
  data: {
    firstName: 'Fred'
  },

  // syntax alternative to send data into the body
  // method post
  // only the value is sent, not the key
  data: 'Country=Foo&City=Bar',

  // `timeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `timeout`, the request will be aborted.
  timeout: 1000, // default is `5000` (5 seconds)

  // `proxy` defines the hostname, port, and protocol of the proxy server.
  // You can also define your proxy using the conventional `http_proxy` and
  // `https_proxy` environment variables. If you are using environment variables
  // for your proxy configuration, you can also define a `no_proxy` environment
  // variable as a comma-separated list of domains that should not be proxied.
  // Use `false` to disable proxies, ignoring environment variables.
  // `username` and `password` indicates that HTTP Basic auth should be used to connect to the proxy, and
  // supplies credentials.
  // This will set an `Proxy-Authorization` header, overwriting any existing
  // `Proxy-Authorization` custom headers you have set using `headers`.
  // If the proxy server uses HTTPS, then you must set the protocol to `https`.
  proxy: {
    protocol: 'https',
    host: '127.0.0.1',
    port: 80,
    username: 'foo',
    password: 'bar'
  },
}
```
## License

This project is licensed under the MIT - see the [LICENSE](https://github.com/kori-lab/fivem-lookup/blob/main/LICENSE) file for details.
