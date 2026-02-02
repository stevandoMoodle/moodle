import { fetchUser } from "./api";

export function requestGetName(users) {
  return async function getName() {
    const user = await users() ?? await fetchUser();
    return user.name;
  };
}
