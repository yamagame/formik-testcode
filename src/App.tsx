import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { PostalCodeInput } from "./components/PostalCodeInput";
import { DigitInput } from "./components/DigitInput";
import {
  CreditCardInput,
  CreditCardDetector,
} from "./components/CreditCardInput";
import { DateInput } from "./components/DateInput";
import { TextField } from "./components/TextField";

type FormProps = {
  postalCode: string;
  date: string;
  creditcard: string;
  digit: string;
  text: string;
  name: string;
  fruit: string;
};

const fruits = [{ name: "apple" }, { name: "pine" }, { name: "orange" }];

type SubmitState = {
  postalCode: string;
  date: string;
  creditcard: string;
  digit: string;
  text: string;
  name: string;
  fruit: string;
};

const initialValues = {
  postalCode: "",
  date: "",
  creditcard: "",
  digit: "",
  text: "",
  name: "",
  fruit: "",
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
  postalCode?: boolean;
  date?: boolean;
  creditcard?: boolean;
  digit?: boolean;
  text?: boolean;
  name?: boolean;
  fruit?: boolean;
};

const validationSchema = (forcusState: ForcusState) => {
  console.log("validationSchema");
  return yup.object().shape({
    postalCode: yup
      .string()
      .matches(/^[0-9]{3}[0-9]{4}$/)
      .required(),
    date: yup
      .string()
      .matches(/^[0-9]{4}[0-9]{2}[0-9]{2}$/)
      .required(),
    creditcard: yup.lazy((creditcard) => {
      return yup
        .string()
        .matches(/^[0-9]+$/)
        .length(CreditCardDetector.getInfo(creditcard, false).length)
        .required();
    }),
    digit: yup
      .string()
      .matches(/^[0-9]{4}[0-9]{4}[0-9]{4}[0-9]{4}$/)
      .required(),
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
    fruit: yup.string().required(),
  });
};

function numberString(val: string) {
  const zenkaku = "０１２３４５６７８９".split("");
  const reg = new RegExp("(" + zenkaku.join("|") + ")", "g");
  const ret = val
    .replace(reg, (match) => String(zenkaku.indexOf(match)))
    .replace(/[^0-9]/g, "");
  return ret;
}

function App() {
  const [state, dispatch] = React.useReducer(submitReducer, submitInitialState);
  const [count1, setCount1] = React.useState(0);
  const [count2, setCount2] = React.useState(0);
  const focusStateRef = React.useRef<ForcusState>({});

  const formik = useFormik<FormProps>({
    initialValues: submitInitialState,
    validateOnBlur: true, // default is true
    validateOnChange: true, // default is true
    validationSchema: validationSchema(focusStateRef.current),
    onSubmit: (values) => {
      dispatch({ type: "update", payload: values });
    },
  });

  React.useEffect(() => {
    console.log(`count2: ${count2}`);
    setCount1(count2);
  }, [count2]);

  React.useEffect(() => {
    console.log(`count1: ${count1}`);
    setCount2(count1);
  }, [count1]);

  const countUp = () => {
    console.log("!");
    setCount1((count) => count + 1);
  };

  console.log("render");

  const cardbland = CreditCardDetector.getInfo(formik.values.creditcard).type;

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
            placeholder="postal-code"
            value={formik.values.postalCode}
            autoComplete="off"
            onChangeValue={(value: string) => {
              console.log("$");
              formik.setFieldValue("postalCode", value);
            }}
            onBlur={formik.handleBlur}
          />
          <span>{formik.touched.postalCode && formik.errors.postalCode}</span>
        </div>
        <div>
          <DateInput
            name="date"
            placeholder="date"
            value={formik.values.date}
            autoComplete="off"
            onChangeValue={(value: string) => {
              formik.setFieldValue("date", value);
            }}
            onBlur={formik.handleBlur}
          />
          <span>{formik.touched.date && formik.errors.date}</span>
        </div>
        <div>
          <CreditCardInput
            name="creditcard"
            placeholder="credit-card"
            value={formik.values.creditcard}
            autoComplete="off"
            onChangeValue={(value: string) => {
              formik.setFieldValue("creditcard", value);
            }}
            onFocus={() => {
              focusStateRef.current.creditcard = true;
            }}
            onBlur={(e) => {
              focusStateRef.current.name = false;
              formik.handleBlur(e);
              formik.setFieldValue("creditcard", formik.values.creditcard);
            }}
          />
          <span>{formik.touched.creditcard && formik.errors.creditcard}</span>
        </div>
        <div style={{ fontSize: 12, margin: 4 }}>Card Bland: {cardbland}</div>
        <div>
          <DigitInput
            name="digit"
            placeholder="digit"
            value={formik.values.digit}
            autoComplete="off"
            onChangeValue={(value: string) => {
              formik.setFieldValue("digit", value);
            }}
            onBlur={formik.handleBlur}
          />
          <span>{formik.touched.digit && formik.errors.digit}</span>
        </div>
        <div>
          <input
            type="text"
            placeholder="name"
            name="name"
            autoComplete="off"
            value={formik.values.name}
            onChange={(e) => {
              formik.handleChange(e);
            }}
            onFocus={() => {
              focusStateRef.current.name = true;
            }}
            onBlur={(e) => {
              focusStateRef.current.name = false;
              formik.handleBlur(e);
              formik.setFieldValue("name", e.target.value.toUpperCase());
            }}
          />
          <span>{formik.touched.name && formik.errors.name}</span>
        </div>
        <div>
          <TextField
            name="text"
            placeholder="text"
            value={formik.values.text}
            maxLength={16}
            autoComplete="off"
            onChange={(e) => {
              formik.handleChange(e);
            }}
            onBlur={(e) => {
              formik.handleBlur(e);
              formik.setFieldValue(
                e.target.name,
                numberString(e.target.value),
                true
              );
            }}
          />
          <span>{formik.touched.text && formik.errors.text}</span>
        </div>
        <div>
          <select
            name="fruit"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="" label="Select a favorite Fruit" />
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
              focusStateRef.current.creditcard = false;
            }}
          />
        </div>
      </form>
      <div style={{ marginTop: 30 }}>
        <div>
          <span>postal code: </span>
          <span>{state.postalCode}</span>
        </div>
        <div>
          <span>date: </span>
          <span>{state.date}</span>
        </div>
        <div>
          <span>credit card: </span>
          <span>{state.creditcard}</span>
        </div>
        <div>
          <span>digit: </span>
          <span>{state.digit}</span>
        </div>
        <div>
          <span>name: </span>
          <span>{state.name}</span>
        </div>
        <div>
          <span>text: </span>
          <span>{state.text}</span>
        </div>
        <div>
          <span>fruit: </span>
          <span>{state.fruit}</span>
        </div>
      </div>
      <div style={{ marginTop: 30 }}>
        <input type="button" value="count up" onClick={() => countUp()} />
        <span>
          {count1}:{count2}
        </span>
      </div>
    </div>
  );
}

export default App;
