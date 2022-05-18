import { FormatNumberInput, formatString } from "./FormatNumberInput";

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
      format={(value: string) => {
        return formatString(value, "**** **** **** ****");
      }}
      maxLength={19}
      onChange={(e) => {
        const { value } = e.target;
        props.onChange(value);
      }}
    />
  );
}
