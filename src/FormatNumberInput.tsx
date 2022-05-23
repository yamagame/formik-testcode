import React, { InputHTMLAttributes } from "react";

function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: "inline" }}>
      <input {...props} />
    </div>
  );
}

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

const findInput = (inputRef: HTMLInputElement) => {
  return inputRef.querySelector("input");
};

export function FormatNumberInput(props: FormatInputProps) {
  const { format, value, length, onChangeValue, ...rest } = props;
  const { name } = props;

  // 値を整形
  const formatedValue = (inputValue: string) => {
    const numberValue = numberString(inputValue, props.length);
    const formatPattern = pattern(format, inputValue);
    const formatedValue = formatString(numberValue, formatPattern);
    return formatedValue;
  };

  const [internalValue, setInternalValue] = React.useState(
    formatedValue(String(value))
  );
  const [focus, setFocus] = React.useState(false);
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const compositingRef = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef && inputRef.current && focus && !compositingRef.current) {
      findInput(inputRef.current)?.setSelectionRange(start, end);
    }
  });

  // 値を整形し保持
  const updateInternalValue = (inputValue: string) => {
    const numberValue = numberString(inputValue, props.length);
    const formatPattern = pattern(format, inputValue);
    const formatedValue = formatString(numberValue, formatPattern);
    setInternalValue(formatedValue);
    return { numberValue, formatPattern };
  };

  // 値を整形しキャレット位置を計算
  const updateValue = (
    inputValue: string,
    start: number | null,
    end: number | null
  ) => {
    const { numberValue, formatPattern } = updateInternalValue(inputValue);
    const delta = calcCaretPosition(inputValue, start, formatPattern);
    const nextStart = Math.max(0, (start || 0) + delta);
    const nextEnd = Math.max(0, (end || 0) + delta);
    setStart(nextStart);
    setEnd(nextEnd);
    return numberValue;
  };

  // 値を返す
  const changeValue = (numberValue: string) => {
    const newValueEvent = {
      name: name || "",
      value: numberValue,
    };
    if (onChangeValue) onChangeValue(newValueEvent);
  };

  return (
    <div ref={inputRef} style={{ display: "inline" }}>
      <TextField
        {...rest}
        value={internalValue}
        onChange={(e) => {
          const { selectionStart: start, selectionEnd: end, value } = e.target;
          if (!inputRef.current) return;
          if (compositingRef.current) {
            // 日本語入力時は値を整形せず保持
            setInternalValue(e.target.value);
            const nextStart = Math.max(0, start || 0);
            const nextEnd = Math.max(0, end || 0);
            setStart(nextStart);
            setEnd(nextEnd);
            if (onChangeValue)
              onChangeValue({
                name: name || "",
                value: e.target.value,
              });
            return;
          }
          // 入力した値から表示する値に整形
          const inputValue = value;
          const numberValue = updateValue(inputValue, start, end);
          findInput(inputRef.current)?.setSelectionRange(start, end);
          changeValue(numberValue);
        }}
        onBlur={(e) => {
          setFocus(false);
          const { numberValue } = updateInternalValue(internalValue);
          changeValue(numberValue);
          if (props.onBlur) props.onBlur(e);
        }}
        onFocus={() => setFocus(true)}
        onCompositionStart={() => {
          // 日本語入力開始
          compositingRef.current = true;
        }}
        onCompositionEnd={() => {
          // 日本語入力終了
          compositingRef.current = false;
          const numberValue = updateValue(internalValue, start, end);
          changeValue(numberValue);
        }}
      />
    </div>
  );
}
