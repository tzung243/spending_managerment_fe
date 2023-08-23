export const host = process.env.REACT_APP_API_HOST;
console.log("host", host);
export const authApiEndpoints = {
  login: "/user/login",
  refresh: "/user/refresh",
  register: "/user/register",
  logout: "/user/logout",
  sendPin: "/user/send_code",
  verifyMobile: "/user/mobile_verify",
};

export const userApiEndpoints = {
  user: "/api/v1/user",
  password: "/user/password",
  profile: "/user",
  self: "/user",
};

export const expenseApiEndpoints = {
  create: "/transaction",
  expense: "/transaction/expense",
  expenseCategory: "/transaction_label/",
  summary: "/transaction/summary",
};

export const incomeApiEndpoints = {
  income: "transaction/income",
  incomeCategory: "/wallet",
  summary: "/api/v1/income/summary",
};

export const currencyApiEndpoints = {
  currency: "/user",
};

export const reportApiEndpoints = {
  monthlyExpenseSummary: "/api/v1/report/expense/months/summary",
  monthlyIncomeSummary: "/api/v1/report/income/months/summary",
  transaction: "/analytics/report",
};

export const chartApiEndpoints = {
  incomeExpenseCategories: "/api/v1/chart/income-expense/category",
  incomeExpenseMonthWise: "/analytics/monthly",
  category: "/analytics/label",
  incomeExpenseCategoryWise: "/api/v1/chart/income-expense/category-wise",
};
