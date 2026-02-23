import { useRef, useState } from "react";
import { format } from "date-fns";
import {
  ClearButton,
  Container,
  ErrorBox,
  PaginationButton,
  PaginationRow,
  Select,
  SearchButton,
  SearchInput,
  StatusBadge,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TableWrapper,
  Title,
} from "./components";
import { CURRENCIES } from "../constants";
import { I18N } from "../constants/i18n";
import { usePaymentList } from "../hooks/use-payment-list";

type PaymentsPageState = {
  page: number;
  search: string;
  currency: string;
};

const formatDateTime = (dateValue: string): string => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return format(date, "dd/MM/yyyy HH:mm:ss");
};

export const PaymentsPage = () => {
  const [filters, setFilters] = useState<PaymentsPageState>({
    page: 1,
    search: "",
    currency: "",
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currencySelectRef = useRef<HTMLSelectElement>(null);

  const { page, search, currency } = filters;
  const pageSize = 5;
  const { paymentList, errorMessage } = usePaymentList({
    page,
    pageSize,
    search,
    currency,
  });

  const isPreviousDisabled = page === 1;
  const isNextDisabled = paymentList.length < pageSize;

  const onSearchClick = () => {
    const searchInput = searchInputRef.current?.value ?? "";
    const currencyInput = currencySelectRef.current?.value ?? "";

    setFilters((previousState) => ({
      ...previousState,
      page: 1,
      search: searchInput,
      currency: currencyInput,
    }));
  };

  const onClearFilters = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }

    if (currencySelectRef.current) {
      currencySelectRef.current.value = "";
    }

    setFilters({
      page: 1,
      search: "",
      currency: "",
    });
  };

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>

      <div>
        <SearchInput
          ref={searchInputRef}
          placeholder={I18N.SEARCH_PLACEHOLDER}
          aria-label={I18N.SEARCH_LABEL}
          defaultValue=""
        />
        <Select
          ref={currencySelectRef}
          aria-label={I18N.CURRENCY_FILTER_LABEL}
          defaultValue=""
        >
          <option value="">{I18N.CURRENCIES_OPTION}</option>
          {CURRENCIES.map((currencyOption) => (
            <option key={currencyOption} value={currencyOption}>
              {currencyOption}
            </option>
          ))}
        </Select>
        <SearchButton onClick={onSearchClick}>{I18N.SEARCH_BUTTON}</SearchButton>
        <ClearButton onClick={onClearFilters}>{I18N.CLEAR_FILTERS}</ClearButton>
      </div>

      {errorMessage ? <ErrorBox>{errorMessage}</ErrorBox> :
      (<TableWrapper>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>{I18N.TABLE_HEADER_PAYMENT_ID}</TableHeader>
              <TableHeader>{I18N.TABLE_HEADER_DATE}</TableHeader>
              <TableHeader>{I18N.TABLE_HEADER_AMOUNT}</TableHeader>
              <TableHeader>{I18N.TABLE_HEADER_CUSTOMER}</TableHeader>
              <TableHeader>{I18N.TABLE_HEADER_CURRENCY}</TableHeader>
              <TableHeader>{I18N.TABLE_HEADER_STATUS}</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {paymentList.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{formatDateTime(payment.date)}</TableCell>
                <TableCell>{payment.amount.toFixed(2)}</TableCell>
                <TableCell>{payment.customerName}</TableCell>
                <TableCell>{payment.currency}</TableCell>
                <TableCell>
                  <StatusBadge status={payment.status}>{payment.status}</StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        <PaginationRow>
          <PaginationButton
            onClick={() =>
              setFilters((previousState) => ({
                ...previousState,
                page: previousState.page - 1,
              }))
            }
            disabled={isPreviousDisabled}
          >
            {I18N.PREVIOUS_BUTTON}
          </PaginationButton>
          <span>
            {I18N.PAGE_LABEL} {page}
          </span>
          <PaginationButton
            onClick={() =>
              setFilters((previousState) => ({
                ...previousState,
                page: previousState.page + 1,
              }))
            }
            disabled={isNextDisabled}
          >
            {I18N.NEXT_BUTTON}
          </PaginationButton>
        </PaginationRow>
      </TableWrapper>)}
    </Container>
  );
};
