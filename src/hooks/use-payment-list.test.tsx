import { renderHook, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "vitest";
import { I18N } from "../constants/i18n";
import { server } from "../mocks/node";
import { usePaymentList } from "./use-payment-list";

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe("usePaymentList", () => {
  test("returns payments for default query", async () => {
    const { result } = renderHook(() => usePaymentList({}));

    await waitFor(() => {
      expect(result.current.payments.length).toBeGreaterThan(0);
    });

    expect(result.current.errorMessage).toBe("");
  });

  test("maps 404 response to i18n payment not found message", async () => {
    const { result } = renderHook(() => usePaymentList({ search: "pay_404" }));

    await waitFor(() => {
      expect(result.current.errorMessage).toBe(I18N.PAYMENT_NOT_FOUND);
    });

    expect(result.current.payments).toEqual([]);
  });

  test("maps 500 response to i18n internal server error message", async () => {
    const { result } = renderHook(() => usePaymentList({ search: "pay_500" }));

    await waitFor(() => {
      expect(result.current.errorMessage).toBe(I18N.INTERNAL_SERVER_ERROR);
    });

    expect(result.current.payments).toEqual([]);
  });
});
