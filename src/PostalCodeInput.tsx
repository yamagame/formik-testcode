import React from "react";

const postalCodeString = (postalCode: string) => {
  if (postalCode.indexOf("-") === 3) return postalCode;
  const code = postalCode.replace("-", "");
  const f = code.substring(0, 3);
  const e = code.substring(3);
  if (e !== "") return `${f}-${e}`;
  return f;
};

const convertPostalCode = (
  postalCode: string,
  cursorPosition: number | null
) => {
  let delta = 0;
  const position = cursorPosition ? cursorPosition : -1;
  const newPostalCode = postalCodeString(postalCode);
  const idx1 = postalCode.indexOf("-");
  const idx2 = newPostalCode.indexOf("-");
  if (idx1 < 0 && idx2 >= 0 && idx2 <= position) {
    delta = 1;
  }
  return {
    value: newPostalCode,
    position: cursorPosition ? cursorPosition + delta : 0,
  };
};

type PostalCodeInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export function PostalCodeInput(props: PostalCodeInputProps) {
  const [cursor, setCursor] = React.useState(0);
  const { name, value, onChange } = props;
  return (
    <input
      ref={
        (input) => input && console.log(cursor)
        // input && (input.selectionStart = input.selectionEnd = cursor)
      }
      type="text"
      placeholder={name}
      name={name}
      value={postalCodeString(value)}
      maxLength={8}
      onChange={(e) => {
        const { value: postalCode, position: selectionStart } =
          convertPostalCode(e.target.value, e.target.selectionStart);
        console.log(selectionStart);
        setCursor(selectionStart);
        onChange(postalCode.replace("-", ""));
      }}
    />
  );
}
