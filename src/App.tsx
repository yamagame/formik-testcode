import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { PostalCodeInput } from "./PostalCodeInput";

type FormProps = {
  name: string;
  star: number;
  fruit: string;
  postalCode: string;
};

const fruits = [{ name: "apple" }, { name: "pine" }, { name: "orange" }];

type SubmitState = {
  name: string;
  star: number;
  fruit: string;
  postalCode: string;
};

const initialValues = {
  name: "",
  star: 0,
  fruit: "",
  postalCode: "",
};

const submitInitialState: SubmitState = initialValues;

type SubmitAction = { type: "update"; payload: SubmitState };

function submitReducer(state: SubmitState, action: SubmitAction) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    default:
      throw new Error();
  }
}

type ForcusState = {
  name?: boolean;
  star?: boolean;
  fruit?: boolean;
  postalCode?: boolean;
};

type ForcusAction = { type: "set"; payload: ForcusState } | { type: "reset" };

const focusInitialState: ForcusState = {
  name: false,
  star: false,
  fruit: false,
  postalCode: false,
};

function forcusReducer(state: ForcusState, action: ForcusAction) {
  switch (action.type) {
    case "set":
      return { ...state, ...action.payload };
    case "reset":
      return { ...focusInitialState };
    default:
      throw new Error();
  }
}

const validationSchema = (forcusState: ForcusState) => {
  return yup.object().shape({
    name: yup.lazy((name) => {
      if (forcusState.name) {
        return yup
          .string()
          .matches(/^[a-zA-Z]*$/)
          .required();
      }
      return yup
        .string()
        .matches(/^[A-Z]*$/)
        .required();
    }),
    star: yup.number().required().positive().integer(),
    fruit: yup.string().required(),
    postalCode: yup
      .string()
      .matches(/^[0-9]{3}[0-9]{4}$/)
      .required(),
  });
};

function App() {
  const [state, dispatch] = React.useReducer(submitReducer, submitInitialState);
  const [forcusState, forcusDispatch] = React.useReducer(
    forcusReducer,
    focusInitialState
  );

  const formik = useFormik<FormProps>({
    initialValues: submitInitialState,
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema: validationSchema(forcusState),
    onSubmit: (values) => {
      dispatch({ type: "update", payload: values });
    },
  });

  return (
    <div style={{ margin: 30 }}>
      <div>Hello React</div>
      <form
        onSubmit={(e) => {
          forcusDispatch({ type: "reset" });
          formik.handleSubmit(e);
        }}
      >
        <div>
          <PostalCodeInput
            name="postalCode"
            value={formik.values.postalCode}
            onChange={(value: string) => {
              formik.setFieldValue("postalCode", value);
            }}
          />
          <span>{formik.touched.postalCode && formik.errors.postalCode}</span>
        </div>
        <div>
          <input
            type="text"
            placeholder="name"
            name="name"
            value={formik.values.name}
            onChange={(e) => {
              forcusDispatch({ type: "set", payload: { name: false } });
              formik.handleChange(e);
            }}
            onBlur={(e) => {
              forcusDispatch({ type: "set", payload: { name: false } });
              // formik.setFieldTouched("name", false);
              formik.setFieldValue("name", e.target.value.toUpperCase());
            }}
            onFocus={() => {
              // formik.setFieldTouched("name", false);
              forcusDispatch({ type: "set", payload: { name: true } });
            }}
          />
          <span>{formik.touched.name && formik.errors.name}</span>
        </div>
        <div>
          <input
            type="text"
            placeholder="star"
            value={formik.values.star}
            name="star"
            onChange={formik.handleChange}
          />
          <span>{formik.touched.star && formik.errors.star}</span>
        </div>
        <div>
          <select name="fruit" onChange={formik.handleChange}>
            <option value="" label="Select a Fruit" />
            {fruits.map((fruit) => (
              <option key={fruit.name} value={fruit.name}>
                {fruit.name}
              </option>
            ))}
          </select>
          <span>{formik.touched.fruit && formik.errors.fruit}</span>
        </div>
        <div>
          <input type="submit" value="submit" />
        </div>
      </form>
      <div style={{ marginTop: 30 }}>
        <div>
          <span>name: </span>
          <span>{state.name}</span>
        </div>
        <div>
          <span>star: </span>
          <span>{state.star}</span>
        </div>
        <div>
          <span>fruit: </span>
          <span>{state.fruit}</span>
        </div>
        <div>
          <span>postalCode: </span>
          <span>{state.postalCode}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
