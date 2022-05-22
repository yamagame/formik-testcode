import { InputHTMLAttributes } from "react";
import { FormatNumberInput } from "../FormatNumberInput";

type PostalCodeInputProps = {
  onChangeValue: (value: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

export function PostalCodeInput(props: PostalCodeInputProps) {
  const { onChangeValue, ...rest } = props;
  return (
    <FormatNumberInput
      type="tel"
      format="***-****"
      maxLength={8}
      length={7}
      {...rest}
      onChangeValue={(e) => {
        onChangeValue(e.value);
      }}
    />
  );
}
