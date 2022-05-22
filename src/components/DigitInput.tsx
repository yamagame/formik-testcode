import { InputHTMLAttributes } from "react";
import { FormatNumberInput } from "../FormatNumberInput";

type DigitInputProps = {
  onChangeValue: (value: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

export function DigitInput(props: DigitInputProps) {
  const { onChangeValue, ...rest } = props;
  return (
    <FormatNumberInput
      type="tel"
      format="**** **** **** ****"
      maxLength={19}
      length={16}
      {...rest}
      onChangeValue={(e) => {
        onChangeValue(e.value);
      }}
    />
  );
}
