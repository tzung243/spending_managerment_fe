import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { Messages } from "primereact/messages";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

import { incomeApiEndpoints } from "./../../API";
import axios from "./../../Axios";

let messages;

const incomeCategoryValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Wallet name field is required")
    .max(100, "Wallet name must be at most 100 characters"),
  type: yup.number().required("Type field is required"),
  amount: yup.number().required("Amount field is required"),
});

const EditIncomeCategory = (props) => {
  useEffect(() => {
    requestIncomeCategory();
  }, []);

  const { register, handleSubmit, errors, setError, setValue } = useForm({
    validationSchema: incomeCategoryValidationSchema,
  });
  const [submitting, setSubmitting] = useState(false);

  const requestIncomeCategory = async () => {
    await axios
      .get(
        incomeApiEndpoints.incomeCategory +
          "/" +
          props.match.params.category_id,
        {}
      )
      .then((response) => {
        // console.log('success', response.data);
        setValue("name", response.data.name);
        setValue("type", response.data.type);
        setValue("amount", response.data.amount);
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

  const submitUpdateIncomeCategory = async (data) => {
    await axios
      .put(
        incomeApiEndpoints.incomeCategory +
          "/" +
          props.match.params.category_id,
        JSON.stringify(data)
      )
      .then((response) => {
        console.log("success", response.data.request);

        if (response.status === 200) {
          setSubmitting(false);

          messages.show({
            severity: "success",
            detail: "Your wallet info updated successfully.",
            sticky: false,
            closable: false,
            life: 5000,
          });
        }
      })
      .catch((error) => {
        console.log("error", error);

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
      <Helmet title="Edit Income" />

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
                Edit Wallet
              </div>
              <div className="p-card-subtitle">
                Edit selected wallet information below.
              </div>
            </div>
            <br />
            <form onSubmit={handleSubmit(submitUpdateIncomeCategory)}>
              <div className="p-fluid">
                <input
                  // defaultValue={}
                  type="text"
                  placeholder="Wallet name"
                  name="name"
                  ref={register}
                  className="p-inputtext p-component p-filled"
                />
                <p className="text-error"></p>
              </div>
              <div className="p-fluid">
                <select
                  name="type"
                  id="type"
                  ref={register}
                  className="p-inputtext p-component p-filled"
                >
                  <option value="1">CASH</option>
                  <option value="2">BANK</option>
                </select>
                <p className="text-error"></p>
              </div>
              <div className="p-fluid">
                <input
                  ref={register}
                  type="text"
                  placeholder="Amount"
                  name="amount"
                  className="p-inputtext p-component p-filled"
                />
                <p className="text-error"></p>
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

export default React.memo(EditIncomeCategory);
