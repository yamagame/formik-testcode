import React from "react";

const postalCodeString = (postalCode: string) => {
  const s = postalCode.replace(/ /g, "");
  let r = "";
  for (let i = 0; i < s.length; i += 4) {
    if (i > 0) r += " ";
    r += s.substring(i, i + 4);
  }
  console.log(postalCode, r);
  return r;
};

const convertPostalCode = (
  postalCode: string,
  cursorPosition: number | null
) => {
  let delta = 0;
  const position = cursorPosition ? cursorPosition : -1;
  const newPostalCode = postalCodeString(postalCode);
  const idx1 = postalCode.split(" ").length;
  const idx2 = newPostalCode.split(" ").length;
  if (idx1 < idx2 && idx2 >= 0 && idx2 <= position) {
    delta = idx2 + 1;
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

export function DigitInput(props: PostalCodeInputProps) {
  const [focus, setFocus] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const { name, value, onChange } = props;
  return (
    <input
      ref={(input) =>
        input && focus && (input.selectionStart = input.selectionEnd = cursor)
      }
      type="text"
      placeholder={name}
      name={name}
      value={postalCodeString(value)}
      maxLength={16 + 3}
      onChange={(e) => {
        const { value: postalCode, position: selectionStart } =
          convertPostalCode(e.target.value, e.target.selectionStart);
        setCursor(selectionStart);
        onChange(postalCode.replace(/ /g, ""));
      }}
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
    />
  );
}
