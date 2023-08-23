import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import * as yup from "yup";
import * as dayjs from "dayjs";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Tooltip } from "primereact/tooltip";

import { Messages } from "primereact/messages";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { incomeApiEndpoints } from "./../../API";
import CurrencySidebar from "./../common/CurrencySidebar";
import { IncomeCategory } from "./../income/IncomeCategory";

import axios from "./../../Axios";
import { expenseApiEndpoints } from "./../../API";
import { useTracked } from "./../../Store";
const typeMap = {
  INCOME: 1,
  EXPENSE: 2,
};

const StyledSwal = Swal.mixin({
  customClass: {
    container: "container-class",
    popup: "popup-class",
    header: "header-class",
    title: "p-card-title",
    content: "content-class",
    closeButton: "close-button-class",
    image: "image-class",
    input: "input-class",
    actions: "actions-class",
    confirmButton:
      "p-button p-button-raised p-button-danger p-button-text-icon-left",
    cancelButton:
      "p-button p-button-raised p-button-info p-button-text-icon-left",
    footer: "footer-class",
  },
  buttonsStyling: false,
});

let messages;

const addExpenseValidationSchema = yup.object().shape({
  expense_date: yup.string().required("Expense date field is required"),
  wallet: yup.object().nullable().required("Wallet field is required"),
  category: yup
    .object()
    .nullable()
    .required("Expense category field is required"),
  type: yup.string().nullable().required("Type field is required"),
  amount: yup.string().required("Expense amount field is required"),
});

const Expense = (props) => {
  const [incomeCategories, setIncomeCategories] = useState({
    categories: [],
    fetching: true,
  });

  const deleteIncomeCategory = (data) => {
    console.log(data);
    StyledSwal.fire({
      title: "Are you sure?",
      text: `Confirm to delete wallet ${data.name}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText:
        '<span class="pi pi-trash p-button-icon-left"></span><span class="p-button-text">Delete</span>',
      cancelButtonText:
        '<span class="pi pi-ban p-button-icon-left"></span><span class="p-button-text">No</span>',
      // confirmButtonColor: '#f76452',
      // cancelButtonColor: '#3085d6',
      focusConfirm: false,
      focusCancel: true,
    }).then((result) => {
      if (result.value) {
        axios
          .delete(incomeApiEndpoints.incomeCategory + "/" + data.id, {})
          .then((response) => {
            // console.log(response.data);
            if (response.status === 200) {
              requestIncomeCategories();
              messages.clear();
              messages.show({
                severity: "success",
                detail: "Your wallet " + data.name + " deleted successfully.",
                sticky: false,
                closable: false,
                life: 5000,
              });
            }
          })
          .catch((error) => {
            // console.log('error', error.response);
            if (error.response.status === 404) {
              messages.clear();
              messages.show({
                severity: "error",
                detail: "Wallet " + data.name + " in use.",
                sticky: true,
                closable: true,
                life: 5000,
              });
            }

            if (error.response.status === 401) {
              messages.clear();
              messages.show({
                severity: "error",
                detail: "Something went wrong. Try again.",
                sticky: true,
                closable: true,
                life: 5000,
              });
            }
          });
      }
    });
  };

  const requestIncomeCategories = async () => {
    // console.log("requestIncomeCategories");
    setIncomeCategories({ ...incomeCategories, fetching: true });
    await axios
      .get(incomeApiEndpoints.incomeCategory + "/all")
      .then((response) => {
        // console.log(response);
        if (response.data) {
          setIncomeCategories({
            ...incomeCategories,
            categories: response.data,
            fetching: false,
          });
        }
      })
      .catch((error) => {
        // console.log(error);
      });
  };

  const [state] = useTracked();
  const {
    register,
    handleSubmit,
    setValue,
    errors,
    setError,
    reset,
    control,
    watch,
  } = useForm({
    validationSchema: addExpenseValidationSchema,
  });
  const [datatable, setDatatable] = useState({
    sortField: "date",
    sortOrder: -1,
  });
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [expenseSummary, setExpenseSummary] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [wallet, setWallet] = useState({
    wallets: [],
    fetching: true,
  });
  const [expense, setExpense] = useState({ expenses: {}, fetching: true });
  useEffect(() => {
    requestIncomeCategories();
    requestExpenseSummary();
    requestExpenseCategory();
    requestWallet();
  }, []);

  useEffect(() => {
    requestExpense();
  }, [datatable]);

  const requestWallet = async () => {
    setWallet({ ...wallet, fetching: true });
    await axios
      .get(incomeApiEndpoints.incomeCategory + "/all")
      .then((response) => {
        // console.log(response.data);
        if (response.data) {
          setWallet({
            ...wallet,
            wallets: response.data,
            fetching: false,
          });
        }
      })
      .catch((error) => {
        // console.log(error);
      });
  };

  const requestExpenseCategory = async () => {
    await axios
      .get(expenseApiEndpoints.expenseCategory, {})
      .then((response) => {
        // console.log(response.data);
        if (response.data.length > 0) {
          setExpenseCategories(response.data);
        } else {
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // console.log(expenseCategories);
  const requestExpense = async () => {
    setExpense({ ...expense, fetching: true });
    await axios
      .get(
        expenseApiEndpoints.create +
          "?sort_col=" +
          datatable.sortField +
          "&sort_order=" +
          (datatable.sortOrder > 0 ? "asc" : "desc"),
        {}
      )
      .then((response) => {
        // console.log("success", response.data);
        if (response.data) {
          setExpense({
            ...expense,
            expenses: response.data,
            fetching: false,
          });
        } else {
          setExpense({
            ...expense,
            fetching: false,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const requestExpenseSummary = async () => {
    await axios
      .get(expenseApiEndpoints.summary, {})
      .then((response) => {
        // console.log(response);
        setExpenseSummary(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteExpense = (data) => {
    // console.log(data);
    StyledSwal.fire({
      title: "Are you sure?",
      text: `Confirm to delete expense on ${data.spent_on}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText:
        '<span class="pi pi-trash p-button-icon-left"></span><span class="p-button-text">Delete</span>',
      cancelButtonText:
        '<span class="pi pi-ban p-button-icon-left"></span><span class="p-button-text">No</span>',
      // confirmButtonColor: '#f76452',
      // cancelButtonColor: '#3085d6',
      focusConfirm: false,
      focusCancel: true,
    }).then((result) => {
      if (result.value) {
        axios
          .delete(expenseApiEndpoints.expense + "/" + data.id, {})
          .then((response) => {
            // console.log(response.data);
            if (response.status === 200) {
              requestExpense();
              requestExpenseSummary();

              messages.show({
                severity: "success",
                detail:
                  "Your expense on " + data.spent_on + " deleted successfully.",
                sticky: false,
                closable: false,
                life: 5000,
              });
            }
          })
          .catch((error) => {
            console.log("error", error.response);

            if (error.response.status === 401) {
              messages.clear();
              messages.show({
                severity: "error",
                detail: "Something went wrong. Try again.",
                sticky: true,
                closable: true,
                life: 5000,
              });
            }
          });
      }
    });
  };

  const submitExpense = (data) => {
    // console.log(data.category);
    data.label_id = data.category.id;
    // data.currency_id = state.currentCurrency.id;
    data.wallet_id = data.wallet.id;
    data.date = dayjs(data.expense_date).format("YYYY-MM-DD HH:mm:ss");
    data.description = data.remarks;
    data.type = typeMap[data.type];
    data.amount = parseInt(data.amount);
    // console.log(data);
    axios
      .post(expenseApiEndpoints.create, JSON.stringify(data))
      .then((response) => {
        // console.log('success');
        // console.log(response.data);
        if (response.status === 200) {
          // console.log(response.data);

          reset();
          setSubmitting(false);
          setValue("expense_date", dayjs(response.data.date).toDate());
          requestExpense();
          requestExpenseSummary();
          messages.show({
            severity: "success",
            detail: "Your expense added.",
            sticky: false,
            closable: false,
            life: 5000,
          });
          control.setValue("expense_date", new Date());
          control.setValue("category", null);
          control.setValue("wallet", null);
          control.setValue("type", null);
        }
      })
      .catch((error) => {
        console.log("error", error.response);

        if (error.response.status === 401) {
          messages.clear();
          messages.show({
            severity: "error",
            detail: "Something went wrong. Try again.",
            sticky: true,
            closable: true,
            life: 5000,
          });
        } else if (error.response.status === 422) {
          let errors = Object.entries(error.response.data).map(
            ([key, value]) => {
              return { name: key, message: value[0] };
            }
          );
          setError(errors);
        }

        setSubmitting(false);
      });
  };

  const renderExpenseSummary = (data) => {
    // console.log(data);
    if (data) {
      return (
        <div>
          <div className="color-link text-center">
            {data.toLocaleString()}
            <span className="color-title">{" VND."}</span>
          </div>
          <hr />
        </div>
      );
    } else {
      return (
        <div>
          <div className="text-center">No expense data found.</div>
          <hr />
        </div>
      );
    }
  };

  return (
    <div>
      <Helmet title="Expense" />

      <CurrencySidebar
        visible={currencyVisible}
        onHide={(e) => setCurrencyVisible(false)}
      />

      <div className="p-grid p-nogutter">
        <div className="p-col-12">
          <div className="p-fluid">
            <Messages ref={(el) => (messages = el)} />
          </div>
        </div>
      </div>

      <div className="p-grid">
        <div className="p-col-12">
          <div className="p-fluid">
            <div className="p-grid">
              <div className="p-col-6">
                <div className="p-panel p-component">
                  <div className="p-panel-titlebar">
                    <span className="color-title text-bold">
                      Expense This Month
                    </span>
                  </div>
                  <div
                    className="p-panel-content-wrapper p-panel-content-wrapper-expanded"
                    id="pr_id_1_content"
                    aria-labelledby="pr_id_1_label"
                    aria-hidden="false"
                  >
                    <div className="p-panel-content">
                      {renderExpenseSummary(expenseSummary.expense_month)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-col-6">
                <div className="p-panel p-component">
                  <div className="p-panel-titlebar">
                    <span className="color-title text-bold">Expense Today</span>
                  </div>
                  <div
                    className="p-panel-content-wrapper p-panel-content-wrapper-expanded"
                    id="pr_id_1_content"
                    aria-labelledby="pr_id_1_label"
                    aria-hidden="false"
                  >
                    <div className="p-panel-content">
                      {renderExpenseSummary(expenseSummary.expense_today)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-grid">
        <div
          className="p-col-12 p-md-5
        "
        >
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">
                Add Expense
              </div>
              <div className="p-card-subtitle">
                Add your expense information below.
              </div>
            </div>
            <br />
            <form onSubmit={handleSubmit(submitExpense)}>
              <div className="p-fluid">
                <Controller
                  name="expense_date"
                  defaultValue={new Date()}
                  onChange={([e]) => {
                    // console.log(e);
                    return e.value;
                  }}
                  control={control}
                  as={
                    <Calendar
                      dateFormat="yy-mm-dd"
                      showTime={true}
                      hourFormat="12"
                      showButtonBar={true}
                      maxDate={new Date()}
                      touchUI={window.innerWidth < 768}
                    />
                  }
                />
                <p className="text-error">{errors.expense_date?.message}</p>
              </div>
              <div className="p-fluid">
                <Controller
                  name="wallet"
                  onChange={([e]) => {
                    return e.value;
                  }}
                  defaultValue={null}
                  control={control}
                  as={
                    <Dropdown
                      filter={true}
                      filterPlaceholder="Search here"
                      showClear={true}
                      filterInputAutoFocus={false}
                      options={wallet.wallets}
                      style={{ width: "100%" }}
                      placeholder="Wallet"
                      optionLabel="name"
                    />
                  }
                />
                {/* {console.log(wallet.wallets.map((item) => item.name))} */}
                <p className="text-error">{errors.wallet?.message}</p>
              </div>
              <div className="p-fluid">
                <Controller
                  name="category"
                  onChange={([e]) => {
                    return e.value;
                  }}
                  defaultValue={null}
                  control={control}
                  as={
                    <Dropdown
                      filter={true}
                      filterPlaceholder="Search here"
                      showClear={true}
                      filterInputAutoFocus={false}
                      options={expenseCategories}
                      style={{ width: "100%" }}
                      placeholder="Expense Category"
                      optionLabel="label_name"
                    />
                  }
                />
                {/* {console.log(expenseCategories)} */}
                <p className="text-error">{errors.category?.message}</p>
              </div>
              <div className="p-fluid">
                <Controller
                  name="type"
                  onChange={([e]) => {
                    return e.value;
                  }}
                  defaultValue={null}
                  control={control}
                  as={
                    <Dropdown
                      showClear={true}
                      filterInputAutoFocus={false}
                      options={["INCOME", "EXPENSE"]}
                      style={{ width: "100%" }}
                      placeholder="Type"
                    />
                  }
                />
                {/* {console.log(expenseCategories)} */}
                <p className="text-error">{errors.type?.message}</p>
              </div>
              <div className="p-fluid">
                <div className="p-inputgroup">
                  <input
                    type="number"
                    step="0.00"
                    ref={register}
                    keyfilter="money"
                    placeholder="Amount"
                    name="amount"
                    className="p-inputtext p-component p-filled"
                  />
                </div>
                <p className="text-error">{errors.amount?.message}</p>
              </div>
              <div className="p-fluid">
                <textarea
                  ref={register}
                  rows={5}
                  placeholder="Remarks"
                  name="remarks"
                  className="p-inputtext p-inputtextarea p-component p-inputtextarea-resizable"
                />
                <p className="text-error">{errors.remarks?.message}</p>
              </div>
              <div className="p-fluid">
                <Button
                  disabled={submitting}
                  type="submit"
                  label="Add Expense"
                  icon="pi pi-plus"
                  className="p-button-raised"
                />
              </div>
            </form>
          </Card>
        </div>

        <div className="p-col-12 p-md-7">
          <Card className="rounded-border">
            <div className="p-grid">
              <div className="p-col-6">
                <div className="p-card-title p-grid p-nogutter p-justify-between">
                  View Wallet
                </div>
                <div className="p-card-subtitle">
                  Here are list of my wallet.
                </div>
              </div>
              <div className="p-col-6" align="right">
                {incomeCategories?.fetching ? (
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
            <DataTable
              value={incomeCategories.categories}
              sortField={datatable.sortField}
              sortOrder={datatable.sortOrder}
              responsive={true}
              // paginator={true}
              totalRecords={incomeCategories.categories.total}
              lazy={true}
              scrollable
              scrollHeight="400px"
              first={incomeCategories.categories.from - 1}
              onPage={(e) => {
                // console.log(e);
                setDatatable({
                  ...datatable,
                  currentPage: e.page + 1,
                  rowsPerPage: e.rows,
                });
              }}
              onSort={(e) => {
                // console.log(e);
                setDatatable({
                  ...datatable,
                  sortField: e.sortField,
                  sortOrder: e.sortOrder,
                });
              }}
              className="text-center"
            >
              <Column field="name" header="Wallet Name" />

              <Column
                field="type"
                header="Type"
                body={(rowData) => (rowData.type === 1 ? "CASH" : "BANK")}
              />
              <Column field="amount" header="Amount" />
              <Column
                body={(rowData, column) => {
                  console.log(rowData);
                  return (
                    <div>
                      <Link to={`/income/category/${rowData.id}/edit`}>
                        <Button
                          label="Edit"
                          value={rowData.id}
                          icon="pi pi-pencil"
                          className="p-button-raised p-button-rounded p-button-info"
                        />
                      </Link>
                      <Button
                        label="Delete"
                        onClick={() => deleteIncomeCategory(rowData)}
                        icon="pi pi-trash"
                        className="p-button-raised p-button-rounded p-button-danger"
                      />
                    </div>
                  );
                }}
                header="Action"
                style={{ textAlign: "center", width: "8em" }}
              />
            </DataTable>
          </Card>
        </div>
        <div className="p-col-12 p-md-12">
          <Card className="rounded-border">
            <div className="p-grid">
              <div className="p-col-6">
                <div className="p-card-title p-grid p-nogutter p-justify-between">
                  View Expenses
                </div>
                <div className="p-card-subtitle">
                  Here are few expenses you've added.
                </div>
              </div>
              <div className="p-col-6" align="right">
                {expense.fetching ? (
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
            {/* <Tooltip
              target=".p-dt-tooltip"
              content="Edit"
              mouseTrack
              mouseTrackLeft={10}
            /> */}
            <DataTable
              value={expense.expenses}
              sortField={datatable.sortField}
              sortOrder={datatable.sortOrder}
              responsive={true}
              // paginator={true}
              // rows={datatable.rowsPerPage}
              // rowsPerPageOptions={[5, 10, 20]}
              totalRecords={expense.expenses.total}
              lazy={true}
              scrollable
              scrollHeight="400px"
              first={expense.expenses.from - 1}
              onSort={(e) => {
                // console.log(e);
                console.log(e.sortField);
                setDatatable({
                  ...datatable,
                  sortField: e.sortField,
                  sortOrder: e.sortOrder,
                });
              }}
              className="text-center"
            >
              {/* <Column field="id" header="Serial" /> */}
              <Column field="label_name" header="Category" />
              <Column field="wallet_name" header="Wallet" />
              <Column
                field="type"
                header="Type"
                body={(rowData) =>
                  Object.keys(typeMap).find(
                    (key) => typeMap[key] === rowData.type
                  )
                }
              />

              <Column
                field="amount"
                header="Amount"
                sortable={true}
                body={(rowData, column) => {
                  // console.log(rowData);
                  return rowData.amount.toLocaleString();
                }}
              />
              <Column
                // className="p-dt-tooltip"
                field="description"
                header="Description"
                bodyStyle={{ maxHeight: "400px", overflowY: "auto" }}
              />

              <Column
                field="date"
                header="Date"
                sortable={true}
                body={(rowData, column) => {
                  return dayjs(rowData.date).format("YYYY-MM-DD hh:mm a");
                }}
              />
              <Column
                body={(rowData, column) => {
                  // console.log(rowData);
                  return (
                    <div>
                      <Link to={`/expense/${rowData.id}/edit`}>
                        <Button
                          label="Edit"
                          value={rowData.id}
                          icon="pi pi-pencil"
                          className="p-button-raised p-button-rounded p-button-info"
                        />
                      </Link>
                      <Button
                        label="Delete"
                        onClick={() => deleteExpense(rowData)}
                        icon="pi pi-trash"
                        className="p-button-raised p-button-rounded p-button-danger"
                      />
                    </div>
                  );
                }}
                header="Action"
                style={{ textAlign: "center", width: "8em" }}
              />
            </DataTable>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Expense;
