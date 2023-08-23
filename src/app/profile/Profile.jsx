import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { Messages } from "primereact/messages";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

import { userApiEndpoints } from "./../../API";
import axios from "./../../Axios";
import { useTracked } from "./../../Store";
import Swal from "sweetalert2";
import { logout } from "./../../Axios";
let messages;

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
    // cancelButton:
    //   "p-button p-button-raised p-button-info p-button-text-icon-left",
    footer: "footer-class",
  },
  buttonsStyling: false,
});
const passwordValidationSchema = yup.object().shape({
  old_password: yup
    .string()
    .required("This field is required")
    .min(8, "Password must be at most 8 character"),
  new_password: yup
    .string()
    .required("This field is required")
    .min(8, "Password must be at most 8 character"),
  confirm_password: yup
    .string()
    .required("This field is required")
    .oneOf([yup.ref("new_password")], "Confirm password does not match"),
});

const updateProfileValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name field is required")
    .min(4, "Name must be at most 4 character"),
  email: yup
    .string()
    .required("Email field is required")
    .min(6, "Email must be at most 6 character"),
  currency: yup.object().required("Currency field is required"),
});

const Profile = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  // const [state, setState] = useState({ user: {} });
  const [state] = useTracked();
  const { register, handleSubmit, errors, reset, setValue, setError } = useForm(
    {
      validationSchema: passwordValidationSchema,
    }
  );
  const [submitting, setSubmitting] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleUpdateProfileClick = () => {
    // Perform any necessary form validation or data manipulation here

    // Call submitUpdateProfile function
    const nameInput = document.getElementById("name");
    const nameValue = nameInput.value;
    const emailInput = document.getElementById("email");
    const emailValue = emailInput.value;
    const updatedData = {
      name: nameValue,
      email: emailValue,
    };
    submitUpdateProfile(updatedData);
  };
  const submitChangePassword = (data) => {
    setSubmitting(true);
    axios
      .put(userApiEndpoints.password, JSON.stringify(data))
      .then((response) => {
        // console.log('success');
        // console.log(response.data);

        if (response.status === 200) {
          reset();
          setSubmitting(false);
          StyledSwal.fire({
            title: "Success",
            text: `Your password updated successfully. Re-login.`,
            icon: "warning",
            // showCancelButton: true,
            confirmButtonText:
              '<span class="pi pi-trash p-button-icon-left"></span><span class="p-button-text">Logout</span>',
            // cancelButtonText:
            //   '<span class="pi pi-ban p-button-icon-left"></span><span class="p-button-text">No</span>',
            // confirmButtonColor: '#f76452',
            // cancelButtonColor: '#3085d6',
            focusConfirm: true,
            // focusCancel: true,
          }).then((result) => {
            logout();
          });
        }
      })
      .catch((error) => {
        console.log("error");
        console.log(error.response);

        reset();
        setSubmitting(false);

        messages.clear();

        if (error.response.status === 401) {
          messages.show({
            severity: "error",
            detail: "Something went wrong. Try again.",
            sticky: true,
            closable: true,
            life: 5000,
          });
        }

        if (error.response.status === 422) {
          if (error.response.data.detail === "password_mismatch") {
            messages.show({
              severity: "error",
              detail: "Current password does not match.",
              sticky: true,
              closable: true,
              life: 5000,
            });
          } else if (error.response.data.detail === "old_password") {
            messages.show({
              severity: "error",
              detail: "Your new password is same as old password.",
              sticky: true,
              closable: true,
              life: 5000,
            });
          }
        }

        if (error.response.status === 400) {
          messages.show({
            severity: "error",
            detail: error.response.data.detail,
            sticky: true,
            closable: true,
            life: 5000,
          });
        }
      });
  };

  const submitUpdateProfile = (data) => {
    console.log(JSON.stringify(data));
    axios
      .put(userApiEndpoints.profile, JSON.stringify(data))
      .then((response) => {
        // console.log("success", response.data["user"]["name"]);
        if (response.status === 200) {
          setSubmitting(false);
          setValue([
            { name: response.data["user"]["name"] },
            { email: response.data["user"]["email"] },
          ]);

          // let { _, ...rest } = response.data;
          // setState((prev) => ({ ...prev, user: rest }));

          // messages.show({
          //   severity: "success",
          //   detail: "Your profile info updated successfully.",
          //   sticky: false,
          //   closable: false,
          //   life: 5000,
          // });

          StyledSwal.fire({
            title: "Success",
            text: `Your profile info updated successfully. Re-login.`,
            icon: "warning",
            // showCancelButton: true,
            confirmButtonText:
              '<span class="pi pi-trash p-button-icon-left"></span><span class="p-button-text">Logout</span>',
            // cancelButtonText:
            //   '<span class="pi pi-ban p-button-icon-left"></span><span class="p-button-text">No</span>',
            // confirmButtonColor: '#f76452',
            // cancelButtonColor: '#3085d6',
            focusConfirm: true,
            // focusCancel: true,
          }).then((result) => {
            logout();
          });
        }
      })
      .catch((error) => {
        console.log("error", error.response);

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
        if (error.response.status === 400) {
          messages.show({
            severity: "error",
            detail: error.response.data.detail,
            sticky: true,
            closable: true,
            life: 5000,
          });
        }
      });
  };

  return (
    <div>
      <Helmet title="Profile" />
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
                Profile Info
                {!isEditing && (
                  <Button
                    label="Edit"
                    className="p-button-secondary"
                    onClick={handleEditClick}
                  />
                )}
              </div>
              <div className="p-card-subtitle">
                Detail of your current account information.
              </div>
            </div>
            <div className="p-grid p-nogutter p-justify-between">
              <h3 className="color-title p-col-6">Name:</h3>
              {!isEditing ? (
                <h3 className="color-highlight p-col-6">{state.user.name}</h3>
              ) : (
                <div className="p-fluid p-col-12">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    ref={register}
                    // autoComplete="off"
                    defaultValue={state.user.name}
                    className="p-inputtext p-component p-center"
                  />
                  <p className="text-error">{errors.name?.message}</p>
                </div>
              )}
            </div>
            <div className="p-grid p-nogutter p-justify-between">
              <h3 className="color-title p-col-6">Email:</h3>
              {!isEditing ? (
                <h3 className="color-highlight p-col-6">{state.user.email}</h3>
              ) : (
                <div className="p-fluid p-col-12">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={state.user.email}
                    className="p-inputtext p-component p-filled p-center"
                    ref={register({
                      required: "This field is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="p-card-footer">
                <Button
                  disabled={submitting}
                  type="submit"
                  label="Update Profile"
                  icon="pi pi-refresh"
                  className="p-button-raised"
                  onClick={handleUpdateProfileClick}
                />
              </div>
            )}
            {/* <div className="p-card-footer p-fluid">
              <Link to={"/profile/edit"}>
                <Button label="Edit" className="" icon="pi pi-pencil" />
              </Link>
            </div> */}
          </Card>
        </div>

        <div className="p-col-12 p-md-6">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">
                Password Info
              </div>
              <div className="p-card-subtitle">
                Manage your current password here.
              </div>
            </div>
            <br />

            <form onSubmit={handleSubmit(submitChangePassword)}>
              <div className="p-fluid">
                <input
                  type="password"
                  name="old_password"
                  ref={register}
                  autoComplete="off"
                  placeholder="Old Password"
                  className="p-inputtext p-component p-filled"
                />
                <p className="text-error">{errors.old_password?.message}</p>
              </div>
              <div className="p-fluid">
                <input
                  type="password"
                  name="new_password"
                  ref={register}
                  autoComplete="off"
                  placeholder="New Password"
                  className="p-inputtext p-component p-filled"
                />
                <p className="text-error">{errors.new_password?.message}</p>
              </div>
              <div className="p-fluid">
                <input
                  type="password"
                  name="confirm_password"
                  ref={register}
                  autoComplete="off"
                  placeholder="Confirm Password"
                  className="p-inputtext p-component p-filled"
                />
                <p className="text-error">{errors.confirm_password?.message}</p>
              </div>
              <div className="p-fluid">
                <Button
                  disabled={submitting}
                  type="submit"
                  label="Change Password"
                  icon="pi pi-key"
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

export default Profile;
