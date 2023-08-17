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
  expense: "/api/v1/expense",
  expenseCategory: "/transaction_label/",
  summary: "/api/v1/expense/summary",
};

export const incomeApiEndpoints = {
  income: "/api/v1/income",
  incomeCategory: "/wallet",
  summary: "/api/v1/income/summary",
};

export const currencyApiEndpoints = {
  currency: "/user",
};

export const reportApiEndpoints = {
  monthlyExpenseSummary: "/api/v1/report/expense/months/summary",
  monthlyIncomeSummary: "/api/v1/report/income/months/summary",
  transaction: "/api/v1/report/transaction",
};

export const chartApiEndpoints = {
  incomeExpenseCategories: "/api/v1/chart/income-expense/category",
  incomeExpenseMonthWise: "/api/v1/chart/income-expense/month-wise",
  incomeExpenseCategoryWise: "/api/v1/chart/income-expense/category-wise",
};
