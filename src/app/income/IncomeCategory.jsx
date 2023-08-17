import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

import { Messages } from "primereact/messages";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { Column } from "primereact/column";

import { incomeApiEndpoints } from "./../../API";
import axios from "./../../Axios";

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

const incomeWalletValidationSchema = yup.object().shape({
  name: yup.string().required("name field is required"),
  type: yup.string().required("type field is required"),
  amount: yup.string().required("amount field is required"),
});

const IncomeCategory = (props) => {
  const { register, handleSubmit, reset, errors, setError, watch } = useForm({
    validationSchema: incomeWalletValidationSchema,
  });

  const [datatable, setDatatable] = useState({
    sortField: "id",
    sortOrder: -1,
    rowsPerPage: 5,
    currentPage: 1,
  });
  const [incomeCategories, setIncomeCategories] = useState({
    categories: [],
    fetching: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    requestIncomeCategories();
  }, [datatable]);

  const requestIncomeCategories = async () => {
    // setIncomeCategories({ ...incomeCategories, fetching: true });
    await axios
      .get(incomeApiEndpoints.incomeCategory + "/all")
      .then((response) => {
        console.log(response.data);
        if (response.data) {
          setIncomeCategories((prev) => ({
            categories: [...prev.categories, response.data],
            fetching: false,
          }));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteIncomeCategory = (data) => {
    // console.log(data);
    StyledSwal.fire({
      title: "Are you sure?",
      text: `Confirm to delete income category ${data.category_name}.`,
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

              messages.show({
                severity: "success",
                detail:
                  "Your income category " +
                  data.category_name +
                  " deleted successfully.",
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
                detail: "Income category " + data.category_name + " in use.",
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

  // console.log(watch("name"));

  const submitWallet = (data) => {
    console.log(data);
    setSubmitting(true);
    axios
      .post(incomeApiEndpoints.incomeCategory, JSON.stringify(data))
      .then((response) => {
        console.log("success", response.data);

        if (response.status === 200) {
          messages.show({
            severity: "success",
            detail:
              "New income category " +
              response.data.request.category_name +
              " added.",
            sticky: false,
            closable: false,
            life: 5000,
          });
          reset();
          setSubmitting(false);
          requestIncomeCategories();
        }
      })
      .catch((error) => {
        // console.log("error");
        // console.log(error.response);

        if (error.response.status === 400) {
          messages.clear();
          messages.show({
            severity: "error",
            detail: error.response.data.detail,
            sticky: true,
            closable: true,
            life: 5000,
          });
        }

        if (error.response.status === 422) {
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

  return (
    <div>
      <Helmet title="Income Category" />

      <div className="p-grid p-nogutter">
        <div className="p-col-12">
          <div className="p-fluid">
            <Messages ref={(el) => (messages = el)} />
          </div>
        </div>
      </div>

      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">
                Add Wallet
              </div>
              <div className="p-card-subtitle">Enter wallet name below.</div>
            </div>
            <br />
            <form onSubmit={handleSubmit(submitWallet)}>
              <div className="p-fluid">
                <input
                  type="text"
                  placeholder="Wallet name"
                  name="name"
                  ref={register}
                  className="p-inputtext p-component p-filled"
                />
                <p className="text-error">{errors.category_name?.message}</p>
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
                  label="Add Wallet"
                  icon="pi pi-plus"
                  className="p-button-raised"
                />
              </div>
            </form>
          </Card>
        </div>

        <div className="p-col-12 p-md-6">
          <Card className="rounded-border">
            <div className="p-grid">
              <div className="p-col-6">
                <div className="p-card-title p-grid p-nogutter p-justify-between">
                  View Incomes Categories
                </div>
                <div className="p-card-subtitle">
                  Here are list of income categories.
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
              value={incomeCategories.categories.data}
              sortField={datatable.sortField}
              sortOrder={datatable.sortOrder}
              responsive={true}
              paginator={true}
              rows={datatable.rowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              totalRecords={incomeCategories.categories.total}
              lazy={true}
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
              <Column field="id" header="Serial" sortable={true} />
              <Column
                field="category_name"
                header="Category Name"
                sortable={true}
              />
              <Column
                body={(rowData, column) => {
                  // console.log(rowData);
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
      </div>
    </div>
  );
};

export default React.memo(IncomeCategory);
