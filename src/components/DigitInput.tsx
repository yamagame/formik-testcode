import { FormatNumberInput } from "../FormatNumberInput";

type DigitInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export function DigitInput(props: DigitInputProps) {
  return (
    <FormatNumberInput
      type="tel"
      value={props.value}
      placeholder={props.name}
      name={props.name}
      autoComplete="off"
      format="**** **** **** ****"
      maxLength={19}
      length={16}
      onChangeValue={(e) => {
        const { value } = e;
        props.onChange(value);
      }}
    />
  );
}
