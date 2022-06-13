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
      if (pos === value.length) {
        if (i + 1 < format.length) {
          const ch = format[i + 1];
          if (ch !== "*") {
            result.push(ch);
          }
        }
      }
    } else {
      result.push(ch);
    }
  }
  return result.join("");
};

export type FormatProc = (value: string) => string;
export type FormatChangeProp = { name: string; value: string };

type FormatInputProps = {
  format: string | FormatProc;
  length?: number;
  onChangeValue?: (props: FormatChangeProp) => void;
} & InputHTMLAttributes<HTMLInputElement>;

const zenkaku = "０１２３４５６７８９".split("");
const reg = new RegExp("(" + zenkaku.join("|") + ")", "g");

function numberString(val: string, length = 0) {
  const ret = val.replace(reg, (match) => String(zenkaku.indexOf(match))).replace(/[^0-9]/g, "");
  if (length > 0) return ret.substring(0, length);
  return ret;
}

function countSep(val: string, start?: number) {
  if (start) {
    return val.substring(0, start).length - numberString(val.substring(0, start)).length;
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
  const formatStr = formatString(numberString(inputString).substring(0, start), formatPattern);
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

  const stateValue = formatedValue(String(value));

  const [internalValue, setInternalValue] = React.useState(stateValue);
  const changeRef = React.useRef(false);
  const focusRef = React.useRef(false);
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const compositingRef = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const keyCodeRef = React.useRef("");
  React.useEffect(() => {
    if (
      inputRef &&
      inputRef.current &&
      focusRef.current &&
      !compositingRef.current &&
      changeRef.current
    ) {
      findInput(inputRef.current)?.setSelectionRange(start, end);
    }
  });

  // 値が変化したら再設定
  React.useEffect(() => {
    if (!focusRef.current && !compositingRef.current) {
      setInternalValue(stateValue);
    }
  }, [stateValue]);

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
    end: number | null,
    offset = 0
  ) => {
    const { numberValue, formatPattern } = updateInternalValue(inputValue);
    const delta = calcCaretPosition(inputValue, start, formatPattern) + offset;
    const nextStart = Math.max(0, (start || 0) + delta);
    const nextEnd = Math.max(0, (end || 0) + delta);
    setStart(nextStart);
    setEnd(nextEnd);
    return numberValue;
  };

  // 値を返す
  const changeValue = (numberValue: string) => {
    const newValueEvent: FormatChangeProp = {
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
        onKeyDown={(e) => {
          keyCodeRef.current = e.key;
        }}
        onChange={(e) => {
          changeRef.current = true;
          const { selectionStart, selectionEnd, value } = e.target;
          let startPos = selectionStart || 0;
          let endPos = selectionEnd || 0;
          if (!inputRef.current) return;
          if (compositingRef.current) {
            // 日本語入力時は値を整形せず保持
            setInternalValue(e.target.value);
            const nextStart = Math.max(0, startPos || 0);
            const nextEnd = Math.max(0, endPos || 0);
            setStart(nextStart);
            setEnd(nextEnd);
            if (onChangeValue)
              onChangeValue({
                name: name || "",
                value: e.target.value,
              });
            return;
          }
          let inputValue = value;
          let caretOffset = 0;
          if (internalValue.length - value.length === 1) {
            //　1文字削除された
            const t = startPos < value.length ? numberString(value[startPos]) : "";
            const v = numberString(internalValue[startPos]);
            if (v === "") {
              // 削除した文字が数字以外
              if (t === "") {
                inputValue = value.substring(0, startPos - 1) + value.substring(startPos);
                startPos = startPos - 1;
                endPos = startPos;
              } else {
                if (keyCodeRef.current === "Backspace") {
                  // Backspaceの場合
                  inputValue = value.substring(0, startPos - 1) + value.substring(startPos);
                  startPos = startPos - 1;
                  endPos = startPos;
                } else {
                  // Deleteの場合
                  inputValue = value.substring(0, startPos) + value.substring(startPos + 1);
                  caretOffset = -1;
                }
              }
            }
          }
          // 入力した値から表示する値に整形
          const numberValue = updateValue(inputValue, startPos, endPos, caretOffset);
          changeValue(numberValue);
        }}
        onBlur={(e) => {
          focusRef.current = false;
          const { numberValue } = updateInternalValue(internalValue);
          changeValue(numberValue);
          if (props.onBlur) props.onBlur(e);
        }}
        onFocus={(e) => {
          focusRef.current = true;
          changeRef.current = false;
          if (props.onFocus) props.onFocus(e);
        }}
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
