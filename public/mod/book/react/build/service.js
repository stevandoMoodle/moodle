var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// public/mod/book/react/src/service.ts
import { fetchUser } from "external-lib";
async function getUserName(id) {
  const user = await fetchUser(id);
  return user.name;
}
__name(getUserName, "getUserName");
export {
  getUserName
};
//# sourceMappingURL=service.js.map
