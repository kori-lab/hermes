import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const path = "./package.json";
const _package = JSON.parse(readFileSync(path).toString());

console.log(_package);
const new_version = incrementVersionNumber(_package.version);

_package.version = new_version;

writeFileSync(path, JSON.stringify(_package, null, 2));

execSync(
  `git add . && git commit -m "${new_version}" && git push && npm publish`
).toString();

function incrementVersionNumber(version, delimiter = ".") {
  const arr = version.split(delimiter);

  if (arr[arr.length - 1] == 9) {
    if (arr[arr.length - 2] == 9) {
      arr[arr.length - 3] = (Number(arr[arr.length - 3]) + 1).toString();
      arr[arr.length - 2] = "0";
      arr[arr.length - 1] = "0";
    } else {
      arr[arr.length - 2] = (Number(arr[arr.length - 2]) + 1).toString();
      arr[arr.length - 1] = "0";
    }
  } else if (arr[arr.length - 2] == 9 && arr[arr.length - 1] != 9) {
    arr[arr.length - 1] = (Number(arr[arr.length - 1]) + 1).toString();
  } else {
    arr[arr.length - 1] = (Number(arr[arr.length - 1]) + 1).toString();
  }

  const newVerion = `${arr}`.replace(",", ".").replace(",", ".");

  console.log(`Updated to version ${newVerion} from version ${version}`);

  return newVerion;
}
