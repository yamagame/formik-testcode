import { FormatNumberInput } from "./FormatNumberInput";

type PostalCodeInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export function PostalCodeInput(props: PostalCodeInputProps) {
  return (
    <FormatNumberInput
      type="tel"
      value={props.value}
      placeholder={props.name}
      name={props.name}
      format="***-****"
      maxLength={8}
      length={7}
      onChange={(e) => {
        const { value } = e.target;
        props.onChange(value);
      }}
    />
  );
}
