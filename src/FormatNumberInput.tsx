import React, { InputHTMLAttributes } from "react";

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
  return val
    .replace(reg, (match) => String(zenkaku.indexOf(match)))
    .replace(/[^0-9]/g, "");
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
  const { format, name, value, onChange, length, ...rest } = props;
  const [focus, setFocus] = React.useState(false);
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef && inputRef.current && focus) {
      inputRef.current.setSelectionRange(start, end);
    }
  });
  const maxLength = length || 0;
  const valueString = String(value || "");
  return (
    <input
      {...rest}
      ref={inputRef}
      value={formatString(valueString, pattern(format, valueString))}
      onChange={(e) => {
        const { selectionStart, selectionEnd, value } = e.target;
        let numStr = numberString(value);
        if (props.maxLength && numStr.length > maxLength && maxLength > 0)
          numStr = numStr.substring(0, maxLength);
        const formatPattern = pattern(format, value);
        const formatValue = formatString(numStr, formatPattern);
        const delta = calcCaretPosition(value, selectionStart, formatPattern);
        const start = Math.max(0, (selectionStart || 0) + delta);
        const end = Math.max(0, (selectionEnd || 0) + delta);
        setStart(start);
        setEnd(end);
        const omitSeparatorString = numberString(formatValue);
        const newValueEvent = {
          ...e,
          target: { ...e.target, value: omitSeparatorString },
        };
        onChange && onChange(newValueEvent);
      }}
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
    />
  );
}
