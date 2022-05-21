import { FormatNumberInput } from "./FormatNumberInput";

type DateInputProps = {
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateInput(props: DateInputProps) {
  return (
    <FormatNumberInput
      type="tel"
      value={props.value}
      placeholder={props.placeholder}
      name={props.name}
      autoComplete="off"
      format="****/**/**"
      maxLength={10}
      length={8}
      onChangeValue={(e) => {
        const { value } = e;
        props.onChange(value);
      }}
    />
  );
}
