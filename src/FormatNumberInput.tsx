import React, { InputHTMLAttributes, RefObject } from "react";

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

function numberString(val: string) {
  const zenkaku = "０１２３４５６７８９".split("");
  const reg = new RegExp("(" + zenkaku.join("|") + ")", "g");
  const ret = val
    .replace(reg, (match) => String(zenkaku.indexOf(match)))
    .replace(/[^0-9]/g, "");
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

const isIME = (ref: RefObject<number>) => {
  return ref.current === 229 || ref.current === 0;
  // return ref.current;
};

export function FormatNumberInput(props: FormatInputProps) {
  const { format, name, value, onChange, length, ...rest } = props;
  const [internalValue, setInternalValue] = React.useState(value);
  const [focus, setFocus] = React.useState(false);
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  // const [compositing, setCopmositing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const keyDownRef = React.useRef<boolean>(false);
  const whichRef = React.useRef<number>(-1);
  React.useEffect(() => {
    if (inputRef && inputRef.current && focus && !isIME(whichRef)) {
      inputRef.current.setSelectionRange(start, end);
    }
  });
  const maxLength = length || 0;
  const valueString = String(value || "");
  console.log("valueString", valueString);
  return (
    <input
      {...rest}
      ref={inputRef}
      value={
        isIME(whichRef)
          ? internalValue
          : formatString(valueString, pattern(format, valueString))
      }
      onKeyDown={(e) => {
        console.log("onkey", e.key);
        console.log("isComposing", e.nativeEvent.isComposing);
        console.log("which", e.which);
        whichRef.current = e.which;
        // whichRef.current = e.nativeEvent.isComposing;
        // whichRef.current = e.which;
        // console.log(isIME(whichRef));
        keyDownRef.current = true;
      }}
      onKeyUp={(e) => {
        console.log("onup", e.key);
        keyDownRef.current = false;
      }}
      onChange={(e) => {
        if (isIME(whichRef)) {
          setInternalValue(e.target.value);
          // if (onChange) onChange(e);
          // return;
        }
        if (!keyDownRef.current) {
          if (inputRef.current) inputRef.current.setSelectionRange(start, end);
          return;
        }
        {
          keyDownRef.current = false;
          const { selectionStart, selectionEnd, value } = e.target;
          // e.nativeEvent.stopPropagation();
          // console.log("value", value);
          // const { inputValue, removedChar } = delZenkaku(value);
          const removedChar = 0;
          const inputValue = value;
          // console.log("change", value);
          // if (isIME(whichRef)) {
          //   if (onChange) onChange(e);
          //   return;
          // }
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
          const start = Math.max(
            0,
            (selectionStart || 0) + delta - removedChar
          );
          const end = Math.max(0, (selectionEnd || 0) + delta - removedChar);
          setStart(start);
          setEnd(end);
          const omitSeparatorString = numberString(formatValue);
          console.log("omitSeparatorString", omitSeparatorString);
          const newValueEvent = {
            ...e,
            target: {
              ...e.target,
              name: name || "",
              value: omitSeparatorString,
            },
          };
          if (onChange) onChange(newValueEvent);
        }
      }}
      onBlur={() => {
        setFocus(false);
      }}
      onFocus={() => setFocus(true)}
      onCompositionStart={() => {
        const s = formatString(valueString, pattern(format, valueString));
        console.log("start", s);
        // setCopmositing(true);
      }}
      onCompositionUpdate={() => {
        const s = formatString(valueString, pattern(format, valueString));
        // if (inputRef.current) inputRef.current.value = s;
        console.log("update", s);
      }}
      onCompositionEnd={() => {
        const value = numberString(valueString);
        const s = formatString(value, pattern(format, value));
        setInternalValue(s);
        // if (inputRef.current) inputRef.current.value = s;
        console.log("end", s);
        // setCopmositing(false);
      }}
    />
  );
}
