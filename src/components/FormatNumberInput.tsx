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
  onChangeValue?: (props: { name: string; value: string }) => void;
} & InputHTMLAttributes<HTMLInputElement>;

const zenkaku = "０１２３４５６７８９".split("");
const reg = new RegExp("(" + zenkaku.join("|") + ")", "g");

function numberString(val: string, length = 0) {
  const ret = val
    .replace(reg, (match) => String(zenkaku.indexOf(match)))
    .replace(/[^0-9]/g, "");
  if (length > 0) return ret.substring(0, length);
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

export function FormatNumberInput(props: FormatInputProps) {
  const { format, name, value, onChangeValue, length, ...rest } = props;
  const [internalValue, setInternalValue] = React.useState(String(value));
  const [focus, setFocus] = React.useState(false);
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const compositingRef = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef && inputRef.current && focus && !compositingRef.current) {
      inputRef.current.setSelectionRange(start, end);
    }
  });
  const maxLength = length || 0;
  return (
    <input
      {...rest}
      ref={inputRef}
      value={internalValue}
      onChange={(e) => {
        const { selectionStart, selectionEnd, value } = e.target;
        if (!inputRef.current) return;
        if (compositingRef.current) {
          setInternalValue(e.target.value);
          const start = Math.max(0, selectionStart || 0);
          const end = Math.max(0, selectionEnd || 0);
          setStart(start);
          setEnd(end);
          if (onChangeValue)
            onChangeValue({
              name: name || "",
              value: e.target.value,
            });
          return;
        }
        const inputValue = value;
        let numStr = numberString(inputValue);
        if (props.maxLength && numStr.length > maxLength && maxLength > 0)
          numStr = numStr.substring(0, maxLength);
        const formatPattern = pattern(format, inputValue);
        const formatedValue = formatString(numStr, formatPattern);
        const delta = calcCaretPosition(
          inputValue,
          selectionStart,
          formatPattern
        );
        const numberedValue = numberString(formatedValue, props.length);
        const nextStart = Math.max(0, (selectionStart || 0) + delta);
        const nextEnd = Math.max(0, (selectionEnd || 0) + delta);
        setStart(nextStart);
        setEnd(nextEnd);
        setInternalValue(formatedValue);
        const newValueEvent = {
          name: name || "",
          value: numberedValue,
        };
        inputRef.current.setSelectionRange(start, end);
        if (onChangeValue) onChangeValue(newValueEvent);
      }}
      onBlur={() => {
        setFocus(false);
        const value = numberString(internalValue, props.length);
        const formatedValue = formatString(value, pattern(format, value));
        setInternalValue(formatedValue);
        const newValueEvent = {
          name: name || "",
          value,
        };
        if (onChangeValue) onChangeValue(newValueEvent);
      }}
      onFocus={() => setFocus(true)}
      onCompositionStart={() => {
        compositingRef.current = true;
      }}
      onCompositionEnd={() => {
        compositingRef.current = false;
        const value = numberString(internalValue, props.length);
        const formatedValue = formatString(value, pattern(format, value));
        setInternalValue(formatedValue);
        const formatPattern = pattern(format, internalValue);
        const delta = calcCaretPosition(internalValue, start, formatPattern);
        const nextStart = Math.max(0, (start || 0) + delta);
        const nextEnd = Math.max(0, (end || 0) + delta);
        setStart(nextStart);
        setEnd(nextEnd);
        const newValueEvent = {
          name: name || "",
          value,
        };
        if (onChangeValue) onChangeValue(newValueEvent);
      }}
    />
  );
}
