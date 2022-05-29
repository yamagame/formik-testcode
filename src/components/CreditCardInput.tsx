import { InputHTMLAttributes } from "react";
import { FormatNumberInput } from "../FormatNumberInput";

type Block = number[];

/*
 * クレジットカード判定処理は cleave.js より流用
 * https://github.com/nosir/cleave.js/blob/master/src/shortcuts/CreditCardDetector.js
 */

const blocks = {
  uatp: [4, 5, 6],
  amex: [4, 6, 5],
  diners: [4, 6, 4],
  discover: [4, 4, 4, 4],
  mastercard: [4, 4, 4, 4],
  dankort: [4, 4, 4, 4],
  instapayment: [4, 4, 4, 4],
  jcb15: [4, 6, 5],
  jcb: [4, 4, 4, 4],
  maestro: [4, 4, 4, 4],
  visa: [4, 4, 4, 4],
  mir: [4, 4, 4, 4],
  unionPay: [4, 4, 4, 4],
  general: [4, 4, 4, 4],
};

const re = {
  // starts with 1; 15 digits, not starts with 1800 (jcb card)
  uatp: /^(?!1800)1\d{0,14}/,

  // starts with 34/37; 15 digits
  amex: /^3[47]\d{0,13}/,

  // starts with 6011/65/644-649; 16 digits
  discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,

  // starts with 300-305/309 or 36/38/39; 14 digits
  diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,

  // starts with 51-55/2221–2720; 16 digits
  mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,

  // starts with 5019/4175/4571; 16 digits
  dankort: /^(5019|4175|4571)\d{0,12}/,

  // starts with 637-639; 16 digits
  instapayment: /^63[7-9]\d{0,13}/,

  // starts with 2131/1800; 15 digits
  jcb15: /^(?:2131|1800)\d{0,11}/,

  // starts with 2131/1800/35; 16 digits
  jcb: /^(?:35\d{0,2})\d{0,12}/,

  // starts with 50/56-58/6304/67; 16 digits
  maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,

  // starts with 22; 16 digits
  mir: /^220[0-4]\d{0,12}/,

  // starts with 4; 16 digits
  visa: /^4\d{0,15}/,

  // starts with 62/81; 16 digits
  unionPay: /^(62|81)\d{0,14}/,
};

function formatString(blocks: number[]) {
  let ret = "";
  blocks.forEach((num, idx) => {
    if (idx > 0) ret += " ";
    ret += new Array(num).fill("*").join("");
  });
  return ret;
}

export const CreditCardDetector = {
  getStrictBlocks: function (block: Block) {
    var total = block.reduce(function (prev, current) {
      return prev + current;
    }, 0);

    return block.concat(19 - total);
  },

  getInfo: function (value: string, strictMode?: boolean) {
    // Some credit card can have up to 19 digits number.
    // Set strictMode to true will remove the 16 max-length restrain,
    // however, I never found any website validate card number like
    // this, hence probably you don't want to enable this option.
    strictMode = !!strictMode;

    const keys = Object.keys(re);
    const foundKey = keys.findIndex((key) =>
      re[key as keyof typeof re].test(value)
    );

    if (foundKey >= 0) {
      const matchedBlocks = blocks[keys[foundKey] as keyof typeof blocks];
      const block = strictMode
        ? this.getStrictBlocks(matchedBlocks)
        : matchedBlocks;
      return {
        type: foundKey,
        format: formatString(block),
        length: block.reduce((s, v) => s + v, 0),
      };
    }

    const block = strictMode
      ? this.getStrictBlocks(blocks.general)
      : blocks.general;
    return {
      type: "unknown",
      format: formatString(block),
      length: block.reduce((s, v) => s + v, 0),
    };
  },
};

type DigitInputProps = {
  onChangeValue: (value: string) => void;
  strictMode?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export function CreditCardInput(props: DigitInputProps) {
  const { onChangeValue, strictMode, ...rest } = props;
  const cardInfo = CreditCardDetector.getInfo(
    String(props.value || ""),
    strictMode
  );
  return (
    <FormatNumberInput
      type="tel"
      format={(value) => {
        return CreditCardDetector.getInfo(value, strictMode).format;
      }}
      maxLength={cardInfo.format.length}
      length={cardInfo.length}
      {...rest}
      onChangeValue={(e) => {
        onChangeValue(e.value);
      }}
    />
  );
}
