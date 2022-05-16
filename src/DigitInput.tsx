import React from "react";

const digitString = (digit: string) => {
  const s = digit.replace(/ /g, "");
  let r = "";
  for (let i = 0; i < s.length; i += 4) {
    if (i > 0) r += " ";
    r += s.substring(i, i + 4);
  }
  return r;
};

type DigitInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

function countSep(val: string) {
  const t = val.match(/ /g);
  if (t === null) return 0;
  return t.length;
}

export function DigitInput(props: DigitInputProps) {
  const [focus, setFocus] = React.useState(false);
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { name, value, onChange } = props;
  React.useEffect(() => {
    if (inputRef && inputRef.current && focus) {
      inputRef.current.setSelectionRange(start, end);
    }
  });
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={name}
      name={name}
      value={digitString(value)}
      maxLength={16 + 3}
      onChange={(e) => {
        const digitValue = digitString(e.target.value);
        const delta = countSep(digitValue) - countSep(e.target.value);
        setStart((e.target.selectionStart || 0) + delta);
        setEnd((e.target.selectionEnd || 0) + delta);
        onChange(digitValue.replace("-", ""));
      }}
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
    />
  );
}
