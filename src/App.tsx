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

type State = { name: string; star: number; fruit: string; postalCode: string };

const initialState: State = { name: "", star: 0, fruit: "", postalCode: "" };

type Action = { type: "update"; payload: State };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const formik = useFormik<FormProps>({
    initialValues: {
      name: "",
      star: 0,
      fruit: "",
      postalCode: "",
    },
    validationSchema: yup.object().shape({
      name: yup.string().required(),
      star: yup.number().required().positive().integer(),
      fruit: yup.string().required(),
      postalCode: yup
        .string()
        .matches(/^[0-9]{3}[0-9]{4}$/)
        .required(),
    }),
    onSubmit: (values) => {
      dispatch({ type: "update", payload: values });
    },
  });

  return (
    <div style={{ margin: 30 }}>
      <div>Hello React</div>
      <form
        onSubmit={formik.handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
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
          <input
            type="text"
            placeholder="name"
            name="name"
            onChange={formik.handleChange}
          />
          <span>{formik.touched.name && formik.errors.name}</span>
        </div>
        <div>
          <input
            type="text"
            placeholder="star"
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
          <input type="button" value="submit" onClick={formik.submitForm} />
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
