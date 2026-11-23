import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./api";

function httpError(status: number, data: unknown) {
  const error = new AxiosError("Request failed");
  error.response = { status, data } as AxiosResponse;
  return error;
}

describe("getErrorMessage", () => {
  it("uses the message sent by the backend", () => {
    expect(getErrorMessage(httpError(409, { message: "E-mail já cadastrado.", error: "Conflict" }))).toBe(
      "E-mail já cadastrado.",
    );
  });

  it("ignores generic Spring reason phrases and falls back to a Portuguese message", () => {
    expect(getErrorMessage(httpError(404, { message: "Not Found", error: "Not Found" }))).toBe(
      "Não encontramos o que você procurava.",
    );
  });

  it("joins validation errors", () => {
    const error = httpError(400, {
      errors: [{ field: "name", defaultMessage: "must not be blank" }],
    });
    expect(getErrorMessage(error)).toBe("name: must not be blank");
  });

  it("explains when the API is unreachable", () => {
    expect(getErrorMessage(new AxiosError("Network Error", "ERR_NETWORK"))).toMatch(/backend está em execução/);
  });
});
