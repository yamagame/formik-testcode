import { FormatNumberInput } from "./FormatNumberInput";

type PostalCodeInputProps = {
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function PostalCodeInput(props: PostalCodeInputProps) {
  return (
    <FormatNumberInput
      type="tel"
      value={props.value}
      placeholder={props.placeholder}
      name={props.name}
      format="***-****"
      maxLength={8}
      length={7}
      onChangeValue={(e) => {
        const { value } = e;
        props.onChange(value);
      }}
    />
  );
}
