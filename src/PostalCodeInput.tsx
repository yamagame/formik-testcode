import { FormatNumberInput, formatString } from "./FormatNumberInput";

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
      format={(value: string) => {
        return formatString(value, "***-****");
      }}
      maxLength={8}
      onChange={(e) => {
        const { value } = e.target;
        props.onChange(value);
      }}
    />
  );
}
