import { api } from "./api";
import type { UpdateUserRequest, User } from "@/types/api";

export const userService = {
  async me() {
    const { data } = await api.get<User>("/users/me");
    return data;
  },
  async update(body: UpdateUserRequest) {
    const { data } = await api.patch<User>("/users/me", body);
    return data;
  },
  async remove() {
    await api.delete("/users/me");
  },
};
