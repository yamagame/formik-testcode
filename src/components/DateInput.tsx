import { InputHTMLAttributes } from "react";
import { FormatNumberInput } from "../FormatNumberInput";

type DateInputProps = {
  onChangeValue: (value: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

export function DateInput(props: DateInputProps) {
  const { onChangeValue, ...rest } = props;
  return (
    <FormatNumberInput
      type="tel"
      format="****/**/**"
      maxLength={10}
      length={8}
      {...rest}
      onChangeValue={(e) => {
        onChangeValue(e.value);
      }}
    />
  );
}
