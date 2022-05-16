import React from "react";

const postalCodeString = (postalCode: string) => {
  if (postalCode.indexOf("-") === 3) return postalCode;
  const code = postalCode.replace("-", "");
  const f = code.substring(0, 3);
  const e = code.substring(3);
  if (e !== "") return `${f}-${e}`;
  return f;
};

type PostalCodeInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

function countSep(val: string) {
  const t = val.match(/-/g);
  if (t === null) return 0;
  return t.length;
}

export function PostalCodeInput(props: PostalCodeInputProps) {
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { name, value, onChange } = props;
  React.useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.setSelectionRange(start, end);
    }
  });
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={name}
      name={name}
      value={postalCodeString(value)}
      maxLength={8}
      onChange={(e) => {
        const postalCode = postalCodeString(e.target.value);
        const delta = countSep(postalCode) - countSep(e.target.value);
        setStart((e.target.selectionStart || 0) + delta);
        setEnd((e.target.selectionEnd || 0) + delta);
        onChange(postalCode.replace("-", ""));
      }}
    />
  );
}
