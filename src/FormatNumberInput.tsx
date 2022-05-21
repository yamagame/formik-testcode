import React, { InputHTMLAttributes } from "react";
// import { TextField } from "./TextField";

const formatString = (value: string, format: string) => {
  const result: string[] = [];
  let pos = 0;
  for (let i = 0; i < format.length && pos < value.length; i++) {
    const ch = format[i];
    if (ch === "*") {
      result.push(value[pos]);
      pos++;
    } else {
      result.push(ch);
    }
  }
  return result.join("");
};

type FormatProc = (value: string) => string;

type FormatInputProps = {
  format: string | FormatProc;
  length?: number;
} & InputHTMLAttributes<HTMLInputElement>;

const zenkaku = "０１２３４５６７８９".split("");
const reg = new RegExp("(" + zenkaku.join("|") + ")", "g");

function numberString(val: string) {
  const ret = val
    .replace(reg, (match) => String(zenkaku.indexOf(match)))
    .replace(/[^0-9]/g, "");
  return ret;
}

function isZenkakuString(val: string) {
  const ret = reg.test(val);
  console.log(`isZenkakuString ${val}`, ret);
  return ret;
}

function countSep(val: string, start?: number) {
  if (start) {
    return (
      val.substring(0, start).length -
      numberString(val.substring(0, start)).length
    );
  }
  return val.length - numberString(val).length;
}

function calcCaretPosition(
  inputString: string,
  selectionStart: number | null,
  formatPattern: string
) {
  const numSep = countSep(inputString, selectionStart || 0);
  const start = (selectionStart || 0) - numSep;
  const formatStr = formatString(
    numberString(inputString).substring(0, start),
    formatPattern
  );
  return formatStr.length - (selectionStart || 0);
}

const pattern = (format: string | FormatProc, value: string) =>
  typeof format === "string" ? format : format(numberString(value));

const delZenkaku = (str: string) => {
  let r = "";
  let count = 0;
  let found = false;
  for (let i = str.length - 1; i >= 0; i--) {
    const isZenkaku = "０１２３４５６７８９".indexOf(str[i]) >= 0;
    if (found === true && isZenkaku) {
      count++;
      continue;
    }
    if (isZenkaku) found = true;
    r = str[i] + r;
  }
  return { inputValue: r, removedChar: count };
};

// const isIME = (ref: RefObject<number>) => {
//   const check = () => {
//     if (navigator.userAgent.indexOf("Safari") >= 0) return false;
//     return ref.current === 229 || ref.current === 0;
//   };
//   const ret = check();
//   console.log(ret);
//   return ret;
//   // return ref.current;
// };

// type InputProps = JSX.IntrinsicElements["input"];
// const FancyTextField = React.forwardRef<HTMLInputElement, inputProps>(
//   (props, ref) => {
//     return <TextField {...{ ...props, ref }} />;
//   }
// );
// const FancyTextField = React.forwardRef<HTMLInputElement, inputProps>(
//   (props, ref) => (
//     <div>
//       <input {...{ ...props, ref: ref }} />
//     </div>
//   )
// );
// interface Handles {
//   customFunction: () => void;
// }
// interface Props {
//   props1: string;
//   ref: RefObject<HTMLInputElement>;
// }

// const component: React.ForwardRefRenderFunction<
//   HTMLInputElement,
//   InputProps
// > = (props, ref) => {
//   // React.useImperativeHandle(ref, () => ({
//   //   customFunction: () => {
//   //     console.log("Custom");
//   //   },
//   // }));
//   return <TextField {...{ ...props, ref }} />;
// };

// const FancyTextField = React.forwardRef(component);

export function FormatNumberInput(props: FormatInputProps) {
  const { format, name, value, onChange, length, ...rest } = props;
  const [internalValue, setInternalValue] = React.useState(String(value));
  const keyCode = React.useRef("");
  const [focus, setFocus] = React.useState(false);
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const compositingRef = React.useRef(false);
  // const [compositing, setCopmositing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef && inputRef.current && focus) {
      inputRef.current.setSelectionRange(start, end);
    }
  });
  const maxLength = length || 0;
  const valueString = String(value);
  // console.log(` externalValue ${valueString}`);
  // console.log(`internalValue ${internalValue}`);
  return (
    <input
      {...rest}
      ref={inputRef}
      value={internalValue}
      onKeyDown={(e) => {
        keyCode.current = e.key;
        console.log(e.key);
      }}
      onChange={(e) => {
        console.log(`compositingRef.current  ${compositingRef.current}`, 0);
        if (!inputRef.current) return;
        const { selectionStart, selectionEnd, value } = e.target;
        console.log(`>>>>>>> onChange ${value}`);
        // if (keyCode.current === "Enter" || keyCode.current === "Backspace")
        //   return;
        const { inputValue } = delZenkaku(value);
        // const inputValue = value;
        let numStr = numberString(inputValue);
        if (props.maxLength && numStr.length > maxLength && maxLength > 0)
          numStr = numStr.substring(0, maxLength);
        const formatPattern = pattern(format, inputValue);
        const formatValue = formatString(numStr, formatPattern);
        const delta = calcCaretPosition(
          inputValue,
          selectionStart,
          formatPattern
        );
        const omitSeparatorString = numberString(formatValue);
        // if (isZenkakuString(valueString)) {
        //   const end = Math.max(0, (selectionEnd || 0) + delta);
        //   setStart(end);
        //   setEnd(end);
        //   setInternalValue(valueString);
        // } else {
        const start = Math.max(0, (selectionStart || 0) + delta);
        const end = Math.max(0, (selectionEnd || 0) + delta);
        setStart(start);
        setEnd(end);
        // if (isZenkakuString(value)) {
        // }
        // if (isZenkakuString(value)) {
        //   setInternalValue(value);
        // } else {
        setInternalValue(formatValue);
        //         }
        // }
        console.log("omitSeparatorString", omitSeparatorString);
        const newValueEvent = {
          ...e,
          target: {
            ...e.target,
            name: name || "",
            value: omitSeparatorString,
          },
        };
        inputRef.current.setSelectionRange(start, end);
        // if (isZenkakuString(value)) {
        // if (onChange) onChange(newValueEvent);
        // } else {
        if (onChange) onChange(newValueEvent);
        // }
        console.log(`compositingRef.current  ${compositingRef.current}`, 1);
      }}
      onBlur={() => {
        setFocus(false);
        const value = numberString(internalValue);
        const s = formatString(value, pattern(format, value));
        setInternalValue(s);
        console.log("## blur");
      }}
      onFocus={() => setFocus(true)}
      onCompositionStart={() => {
        // const s = formatString(valueString, pattern(format, valueString));
        // console.log("start", s);
        // setCopmositing(true);
        compositingRef.current = true;
      }}
      onCompositionUpdate={() => {
        //   const s = formatString(valueString, pattern(format, valueString));
        //   // if (inputRef.current) inputRef.current.value = s;
        //   console.log("update", s);
        compositingRef.current = false;
      }}
      onCompositionEnd={(e) => {
        // const value = numberString(valueString);
        // const s = formatString(value, pattern(format, value));
        // setInternalValue(s);
        //   // if (inputRef.current) inputRef.current.value = s;
        //   console.log("end", s, e.data);
        // setStart(end);
        // setEnd(end);
        //   setCopmositing(false);
        compositingRef.current = false;
      }}
    />
  );
}
