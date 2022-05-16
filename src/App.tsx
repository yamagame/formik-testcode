import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { PostalCodeInput } from "./PostalCodeInput";
import { DigitInput } from "./DigitInput";

type FormProps = {
  name: string;
  star: number;
  fruit: string;
  postalCode: string;
  number: string;
};

const fruits = [{ name: "apple" }, { name: "pine" }, { name: "orange" }];

type SubmitState = {
  name: string;
  star: number;
  fruit: string;
  postalCode: string;
  number: string;
};

const initialValues = {
  name: "",
  star: 0,
  fruit: "",
  postalCode: "",
  number: "",
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
  number?: boolean;
};

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
    number: yup
      .string()
      .matches(/^[0-9]{4}[0-9]{4}[0-9]{4}[0-9]{4}$/)
      .required(),
  });
};

function App() {
  const [state, dispatch] = React.useReducer(submitReducer, submitInitialState);
  const focusStateRef = React.useRef<ForcusState>({});

  const formik = useFormik<FormProps>({
    initialValues: submitInitialState,
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema: validationSchema(focusStateRef.current),
    onSubmit: (values) => {
      dispatch({ type: "update", payload: values });
    },
  });

  return (
    <div style={{ margin: 30 }}>
      <div>Hello React</div>
      <form
        onSubmit={(e) => {
          formik.handleSubmit(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            focusStateRef.current.name = false;
            formik.handleSubmit();
          }
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
          <DigitInput
            name="number"
            value={formik.values.number}
            onChange={(value: string) => {
              formik.setFieldValue("number", value);
            }}
          />
          <span>{formik.touched.number && formik.errors.number}</span>
        </div>
        <div>
          <input
            type="text"
            placeholder="name"
            name="name"
            value={formik.values.name}
            onChange={(e) => {
              formik.handleChange(e);
            }}
            onFocus={() => {
              focusStateRef.current.name = true;
            }}
            onBlur={(e) => {
              focusStateRef.current.name = false;
              formik.setFieldValue("name", e.target.value.toUpperCase());
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
          <input
            type="submit"
            value="submit"
            onClick={() => {
              focusStateRef.current.name = false;
            }}
          />
        </div>
      </form>
      <div style={{ marginTop: 30 }}>
        <div>
          <span>postalCode: </span>
          <span>{state.postalCode}</span>
        </div>
        <div>
          <span>number: </span>
          <span>{state.number}</span>
        </div>
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
      </div>
    </div>
  );
}

export default App;
