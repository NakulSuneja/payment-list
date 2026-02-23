import { useEffect, useState } from "react";
import { API_URL } from "../constants";
import { I18N } from "../constants/i18n";
import type { Payment } from "../types/payment";

type UsePaymentListParams = {
    search?: string;
    page?: number;
    currency?: string;
    pageSize?: number;
};

const mapErrorMessage = (message?: string): string => {
    const normalized = (message ?? "").toLowerCase();

    if (normalized.includes("internal server error")) {
        return I18N.INTERNAL_SERVER_ERROR;
    }

    if (normalized.includes("payment not found")) {
        return I18N.PAYMENT_NOT_FOUND;
    }

    return I18N.SOMETHING_WENT_WRONG;
};

export const usePaymentList = ({
    search = "",
    currency = "",
    page = 1,
    pageSize = 5,
}: UsePaymentListParams): {
    paymentList: Payment[];
    errorMessage: string;
} => {
    const [paymentList, setPaymentList] = useState<Payment[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const params = new URLSearchParams({
            search,
            currency,
            page: String(page),
            pageSize: String(pageSize),
        });

        const fetchPayments = async () => {
            try {
                setErrorMessage("");

                const response = await fetch(`${API_URL}?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const payload = (await response.json()) as { message?: string };
                    setPaymentList([]);
                    setErrorMessage(mapErrorMessage(payload.message));
                    return;
                }

                const payload = (await response.json()) as
                    | Payment[]
                    | { payments?: Payment[] };
                setPaymentList(Array.isArray(payload) ? payload : payload.payments ?? []);
            } catch (fetchError) {
                if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
                    return;
                }
                setPaymentList([]);
                setErrorMessage(I18N.SOMETHING_WENT_WRONG);
            }
        };

        void fetchPayments();

        return () => {
            controller.abort();
        };
    }, [currency, page, pageSize, search]);

    return { paymentList, errorMessage };
};