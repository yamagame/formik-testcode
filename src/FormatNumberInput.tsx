import React, { InputHTMLAttributes } from "react";

export const formatString = (value: string, format: string) => {
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

type FormatInputProps = {
  format: (value: string) => string;
} & InputHTMLAttributes<HTMLInputElement>;

function numberString(val: string) {
  return val.replace(/[^0-9]/g, "");
}

function countSep(val: string, start: number) {
  return (
    val.substring(0, start).length -
    numberString(val.substring(0, start)).length
  );
}

function calcCaretPosition(
  inputString: string,
  formatString: string,
  selectionStart: number | null
) {
  const start = selectionStart || 0;
  console.log(inputString, formatString, start);
  const calc = () => {
    const isDeleted =
      numberString(formatString).length - numberString(inputString).length < 0;
    if (
      !formatString.substring(start, start).match(/[0-9]/) &&
      inputString.substring(start, start).match(/[0-9]/)
    ) {
      return -1;
    }
    const delta =
      countSep(formatString, start) -
      countSep(inputString, start + (isDeleted ? 0 : -1));
    console.log(delta, "delta");
    if (formatString.length < inputString.length) {
      return delta;
    }
    return Math.max(0, delta);
  };
  const result = calc();
  console.log(result);
  return result;
}

export function FormatNumberInput(props: FormatInputProps) {
  const { format, name, value, onChange, ...rest } = props;
  const [prevValue, setPrevValue] = React.useState<string>(String(value || ""));
  const [focus, setFocus] = React.useState(false);
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef && inputRef.current && focus) {
      inputRef.current.setSelectionRange(start, end);
    }
  });
  return (
    <input
      {...rest}
      ref={inputRef}
      value={format(String(value || ""))}
      onChange={(e) => {
        const { selectionStart, selectionEnd, value } = e.target;
        const formatString = format(numberString(value));
        const delta = calcCaretPosition(
          prevValue,
          formatString,
          selectionStart
        );
        const start = Math.max(0, (selectionStart || 0) + delta);
        const end = Math.max(0, (selectionEnd || 0) + delta);
        setStart(start);
        setEnd(end);
        const omitSeparatorString = numberString(formatString);
        const newValueEvent = {
          ...e,
          target: { ...e.target, value: omitSeparatorString },
        };
        onChange && onChange(newValueEvent);
        setPrevValue(formatString);
      }}
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
    />
  );
}
