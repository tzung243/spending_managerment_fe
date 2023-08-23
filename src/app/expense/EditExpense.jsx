import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useForm, Controller } from "react-hook-form";
import * as dayjs from "dayjs";
import * as yup from "yup";

import { Messages } from "primereact/messages";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";

import CurrencySidebar from "./../common/CurrencySidebar";

import { expenseApiEndpoints, incomeApiEndpoints } from "./../../API";
import axios from "./../../Axios";
import { useTracked } from "./../../Store";

let messages;

const editExpenseValidationSchema = yup.object().shape({
  date: yup.string().required("Expense date field is required"),
  wallet: yup.string().required("Wallet field is required"),
  label_name: yup.string().required("Expense category field is required"),
  amount: yup.number().required("Expense amount field is required"),
  remarks: yup.string().max(200, "Remarks must be at most 200 characters"),
});

const EditExpense = (props) => {
  const [state, setState] = useTracked();
  const {
    register,
    handleSubmit,
    errors,
    setError,
    setValue,
    control,
    getValues,
  } = useForm({
    validationSchema: editExpenseValidationSchema,
  });
  const [submitting, setSubmitting] = useState(false);
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [wallet, setWallet] = useState({
    wallets: [],
    fetching: true,
  });
  useEffect(() => {
    requestExpenseCategory();
    requestExpenseInfo();
    requestWallet();
  }, []);

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
  const requestExpenseInfo = async () => {
    await axios
      .get(expenseApiEndpoints.create + "/" + props.match.params.expense_id, {})
      .then((response) => {
        // console.log('success', response.data);
        setValue([
          { id: response.data.id },
          { date: dayjs(response.data.date).toDate() },
          { wallet: response.data.wallet_name },
          { amount: response.data.amount },
          { label_name: response.data.label_name },
          { type: response.data.type == 1 ? "INCOME" : "EXPENSE" },
          { remarks: response.data.description },
        ]);
        setState((prev) => ({
          ...prev,
          currentCurrency: response.data.currency,
        }));
      })
      .catch((error) => {
        console.log("error", error.response);

        if (error.response.status === 401) {
          messages.show({
            severity: "error",
            detail: "Something went wrong. Try again.",
            sticky: true,
            closable: true,
            life: 5000,
          });
        }
      });
  };

  const submitUpdateExpense = (data) => {
    // console.log(data);
    data.description = data.remarks;
    data.date = dayjs(data.date).format("YYYY-MM-DD HH:mm:ss");
    for (let i = 0; i < wallet.wallets.length; i++) {
      if (wallet.wallets[i].name === data.wallet) {
        data.wallet_id = wallet.wallets[i].id;
      }
    }
    for (let i = 0; i < expenseCategories.length; i++) {
      if (expenseCategories[i].label_name === data.label_name) {
        data.label = expenseCategories[i].id;
      }
    }
    data.type = data.type === "INCOME" ? 1 : 2;
    // console.log("AAA", data);

    // data.expense_date = dayjs(data.expense_date).format("YYYY-MM-DD HH:mm:ss");
    // data.category_id = data.category.id;
    // data.currency_id = state.currentCurrency.id;

    axios
      .put(
        expenseApiEndpoints.create + "/" + props.match.params.expense_id,
        JSON.stringify(data)
      )
      .then((response) => {
        // console.log('success', response.data.request);

        if (response.status === 200) {
          setSubmitting(false);

          messages.show({
            severity: "success",
            detail: "Your expense info updated successfully.",
            sticky: false,
            closable: false,
            life: 5000,
          });
        }
      })
      .catch((error) => {
        console.log("error");
        console.log(error.response);

        setSubmitting(false);

        messages.clear();

        if (error.response.status === 422) {
          let errors = Object.entries(error.response.data).map(
            ([key, value]) => {
              return { name: key, message: value[0] };
            }
          );
          setError(errors);
        } else if (error.response.status === 401) {
          messages.show({
            severity: "error",
            detail: "Something went wrong. Try again.",
            sticky: true,
            closable: true,
            life: 5000,
          });
        }
      });
  };

  return (
    <div>
      <Helmet title="Edit Expense" />

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
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">
                Edit Expense
              </div>
              <div className="p-card-subtitle">
                Edit selected expense information below.
              </div>
            </div>
            <br />
            <form onSubmit={handleSubmit(submitUpdateExpense)}>
              <div className="p-fluid">
                <Controller
                  name="date"
                  defaultValue={new Date()}
                  onChange={([e]) => {
                    // console.log(e);
                    return e.value;
                  }}
                  control={control}
                  as={
                    <Calendar
                      name="date"
                      dateFormat="yy-mm-dd"
                      showTime={true}
                      hourFormat="12"
                      showButtonBar={true}
                      maxDate={new Date()}
                      touchUI={window.innerWidth < 768}
                    />
                  }
                />
                <p className="text-error"></p>
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
                      optionValue="name"
                      filterInputAutoFocus={false}
                      options={wallet.wallets}
                      style={{ width: "100%" }}
                      placeholder="Wallet"
                      optionLabel="name"
                    />
                  }
                />
                <p className="text-error">{errors.wallet?.message}</p>
              </div>
              <div className="p-fluid">
                <Controller
                  name="label_name"
                  onChange={([e]) => {
                    return e.value;
                  }}
                  // defaultValue={null}
                  control={control}
                  as={
                    <Dropdown
                      filter={true}
                      filterPlaceholder="Search here"
                      showClear={true}
                      filterInputAutoFocus={false}
                      options={expenseCategories}
                      optionValue="label_name"
                      style={{ width: "100%" }}
                      placeholder="Expense Category"
                      optionLabel="label_name"
                    />
                  }
                />
                {/* {console.log(expenseCategories)} */}
                <p className="text-error"></p>
              </div>
              <div className="p-fluid">
                <Controller
                  name="type"
                  onChange={([e]) => {
                    return e.value;
                  }}
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
                  label="Save Changes"
                  icon="pi pi-save"
                  className="p-button-raised"
                />
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditExpense);
