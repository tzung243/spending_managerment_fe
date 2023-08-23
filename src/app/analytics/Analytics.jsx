import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";

import { Messages } from "primereact/messages";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";

import { chartApiEndpoints, expenseApiEndpoints } from "./../../API";
import axios from "./../../Axios";

let messages;

const Analytics = (props) => {
  const [incomeExpenseCategoryId, setIncomeExpenseCategoryId] = useState(null);
  const [incomeExpenseCategories, setIncomeExpenseCategories] = useState([]);

  const [monthWiseChartData, setMonthWiseChartData] = useState({
    barChartData: {},
    barChartDataLoading: true,
  });

  const [categoryWiseChartData, setCategoryWiseChartData] = useState({
    barChartData: {},
    barChartDataOptions: {},
    barChartDataLoading: false,
  });

  const [categoryChartData, setCategoryChartData] = useState({
    barChartData: {},
    barChartDataLoading: false,
  });

  useEffect(() => {
    requestIncomeExpenseCategories();
    requestCategoryChartData();
    requestMonthWiseChartData();
  }, []);

  useEffect(() => {
    requestCategoryWiseChartData();
  }, [incomeExpenseCategoryId]);

  const requestIncomeExpenseCategories = () => {
    axios
      .get(expenseApiEndpoints.expenseCategory, {})
      .then((response) => {
        // console.log(response.data);
        setIncomeExpenseCategories(response.data);
      })
      .catch((error) => {
        // console.log(error);
        setIncomeExpenseCategories([]);
      });
  };

  function get12Months() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const months = Array.from({ length: 12 }).map((_, index) => {
      const month = (
        currentMonth - index <= 0
          ? currentMonth - index + 12
          : currentMonth - index
      )
        .toString()
        .padStart(2, "0");
      return `${currentYear}-${month}`;
    });
    return months;
  }
  const requestMonthWiseChartData = () => {
    axios
      .get(chartApiEndpoints.incomeExpenseMonthWise, {})
      .then((response) => {
        const transactionsByMonthAndType = {};
        response.data.forEach((transaction) => {
          const { formatted_date, transaction_type, total } = transaction;
          const month = formatted_date.substring(0, 7);

          if (!transactionsByMonthAndType[month]) {
            transactionsByMonthAndType[month] = { 1: 0, 2: 0 }; // Khởi tạo giá trị ban đầu cho cả 2 loại giao dịch
          }

          transactionsByMonthAndType[month][transaction_type] += total || 0;
        });

        const months = get12Months().sort((a, b) => {
          return a.localeCompare(b, "en", { numeric: true });
        });
        const types = [1, 2];
        const colorPalette = ["rgba(0, 123, 255, 0.6)", "rgba(255, 0, 0, 0.6)"];

        const labels = months;

        const datasets = types.map((type, index) => {
          const data = months.map((month) => {
            const transactionData = transactionsByMonthAndType[month];
            if (transactionData) {
              return transactionData[type];
            } else {
              return 0;
            }
          });
          // console.log(data);
          const label = type === 1 ? "Income" : "Expense";
          return {
            label,
            data,
            backgroundColor: colorPalette[index % colorPalette.length],
            borderColor: "rgba(0, 0, 0, 0.6)",
            borderWidth: 1,
          };
        });
        // console.log(datasets);
        setMonthWiseChartData({
          ...monthWiseChartData,
          barChartData: { labels, datasets },
          barChartDataLoading: false,
        });
      })
      .catch((error) => {
        // console.log(error);
        setMonthWiseChartData({
          ...monthWiseChartData,
          barChartDataLoading: false,
        });
      });
  };

  const requestCategoryChartData = () => {
    axios
      .get(chartApiEndpoints.category, {})
      .then((response) => {
        const transactionsByLabelAndType = {};
        response.data.forEach((transaction) => {
          const { label_name, transaction_type, total } = transaction;
          if (!transactionsByLabelAndType[label_name]) {
            transactionsByLabelAndType[label_name] = { 1: 0, 2: 0 }; // Khởi tạo giá trị ban đầu cho cả 2 loại giao dịch
          }
          transactionsByLabelAndType[label_name][transaction_type] +=
            total || 0;
        });
        axios.get(expenseApiEndpoints.expenseCategory, {}).then((response) => {
          // console.log(response.data);
          const labels = response.data.map((item) => item.label_name);
          const types = [1, 2];
          const colorPalette = [
            "rgba(0, 123, 255, 0.6)",
            "rgba(255, 0, 0, 0.6)",
          ];
          const datasets = types.map((type, index) => {
            const data = labels.map((label) => {
              const transactionData = transactionsByLabelAndType[label];
              if (transactionData) {
                return transactionData[type];
              } else {
                return 0;
              }
            });
            // console.log(data);
            const label = type === 1 ? "Income" : "Expense";
            return {
              label,
              data,
              backgroundColor: colorPalette[index % colorPalette.length],
              borderColor: "rgba(0, 0, 0, 0.6)",
              borderWidth: 1,
            };
          });
          // console.log(datasets);
          setCategoryChartData({
            ...categoryChartData,
            barChartData: { labels, datasets },
            barChartDataLoading: false,
          });
        });
      })
      .catch((error) => {
        // console.log(error);
        setMonthWiseChartData({
          ...monthWiseChartData,
          barChartDataLoading: false,
        });
      });
  };

  const requestCategoryWiseChartData = () => {
    if (incomeExpenseCategoryId) {
      setCategoryWiseChartData({
        ...categoryWiseChartData,
        barChartDataLoading: true,
      });
      // console.log(incomeExpenseCategoryId);
      axios
        .get(chartApiEndpoints.category + "/" + incomeExpenseCategoryId)
        .then((response) => {
          // console.log(response.data);
          const transactionsByMonthAndType = {};
          response.data.forEach((transaction) => {
            const { formatted_date, transaction_type, total } = transaction;
            const month = formatted_date.substring(0, 7);

            if (!transactionsByMonthAndType[month]) {
              transactionsByMonthAndType[month] = { 1: 0, 2: 0 }; // Khởi tạo giá trị ban đầu cho cả 2 loại giao dịch
            }

            transactionsByMonthAndType[month][transaction_type] += total || 0;
          });

          const months = get12Months().sort((a, b) => {
            return a.localeCompare(b, "en", { numeric: true });
          });
          const types = [1, 2];
          const colorPalette = [
            "rgba(0, 123, 255, 0.6)",
            "rgba(255, 0, 0, 0.6)",
          ];

          const labels = months;

          const datasets = types.map((type, index) => {
            const data = months.map((month) => {
              const transactionData = transactionsByMonthAndType[month];
              if (transactionData) {
                return transactionData[type];
              } else {
                return 0;
              }
            });
            // console.log(data);
            const label = type === 1 ? "Income" : "Expense";
            return {
              label,
              data,
              backgroundColor: colorPalette[index % colorPalette.length],
              borderColor: "rgba(0, 0, 0, 0.6)",
              borderWidth: 1,
            };
          });
          console.log(labels, datasets);
          setCategoryWiseChartData({
            ...categoryWiseChartData,
            barChartData: { labels, datasets },
            barChartDataLoading: false,
          });
        })
        .catch((error) => {
          // console.log(error);
          setCategoryWiseChartData({
            ...categoryWiseChartData,
            barChartDataLoading: false,
          });
        });
    }
  };

  return (
    <div>
      <Helmet title="Analytics" />

      <div className="p-grid p-nogutter">
        <div className="p-col-12">
          <div className="p-fluid">
            <Messages ref={(el) => (messages = el)} />
          </div>
        </div>
      </div>

      <div className="p-grid">
        <div className="p-col-12">
          <Card className="rounded-border">
            <div className="p-grid">
              <div className="p-col-9">
                <div className="p-card-title p-grid p-nogutter p-justify-between">
                  Monthly Income & Expense Chart
                </div>
                <div className="p-card-subtitle">
                  Glimpse of your incomes and expenses for a year.
                </div>
              </div>
              <div className="p-col-3" align="right">
                {monthWiseChartData.barChartDataLoading ? (
                  <ProgressSpinner
                    style={{ height: "25px", width: "25px" }}
                    strokeWidth={"4"}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
            <br />
            <div>
              <Chart type="bar" data={monthWiseChartData.barChartData} />
            </div>
          </Card>
        </div>

        <div className="p-col-12">
          <Card className="rounded-border">
            <div className="p-grid">
              <div className="p-col-9">
                <div className="p-card-title p-grid p-nogutter p-justify-between">
                  Category Chart
                </div>
                <div className="p-card-subtitle">
                  Glimpse of your incomes and expenses of category for a year.
                </div>
              </div>
              <div className="p-col-3" align="right">
                {categoryChartData.barChartDataLoading ? (
                  <ProgressSpinner
                    style={{ height: "25px", width: "25px" }}
                    strokeWidth={"4"}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
            <br />
            <div>
              <Chart type="bar" data={categoryChartData.barChartData} />
            </div>
          </Card>
        </div>

        <div className="p-col-12">
          <Card className="rounded-border">
            <div className="p-grid">
              <div className="p-col-9">
                <div className="p-card-title p-grid p-nogutter p-justify-between">
                  Category Wise Income & Expense Chart
                </div>
                <div className="p-card-subtitle">
                  Glimpse of your incomes and expenses for a category.
                </div>
              </div>
              <div className="p-col-3" align="right">
                {categoryWiseChartData.barChartDataLoading ? (
                  <ProgressSpinner
                    style={{ height: "25px", width: "25px" }}
                    strokeWidth={"4"}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
            <br />
            <div>
              <Dropdown
                onChange={(e) => setIncomeExpenseCategoryId(e.value)}
                value={incomeExpenseCategoryId}
                itemTemplate={(option) => {
                  return option.label_name;
                }}
                filter={true}
                filterBy="label_name"
                filterPlaceholder="Search here"
                showClear={true}
                filterInputAutoFocus={false}
                options={incomeExpenseCategories}
                style={{ width: "100%" }}
                placeholder="Select an Income Expense Category"
                optionLabel="label_name"
                optionValue="id"
              />
            </div>
            <br />
            <div>
              <Chart
                type="bar"
                data={categoryWiseChartData.barChartData}
                options={categoryWiseChartData.barChartDataOptions}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Analytics);
