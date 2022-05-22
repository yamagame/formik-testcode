# React 区切り文字対応数値入力コンポーネント

## 使い方

```jsx
<FormatNumberInput
  type="tel"
  value={props.value}
  placeholder="date"
  name="date"
  autoComplete="off"
  format="****/**/**"
  maxLength={10}
  length={8}
  onChangeValue={(e) => {
    const { value, name } = e;
    console.log(name, value);
  }}
/>
```

- format
  区切り文字の指定するフィールド。\*が数値でその他の文字が区切り文字となる

- length
  数値の桁数

- maxLength
  区切り文字を含めた最大文字数

- onChangeValue
  値の変更が通知される。

## Demo

[https://yamagame.github.io/formik-testcode](https://yamagame.github.io/formik-testcode)

## スライド

[React form formik hooks](https://docs.google.com/presentation/d/1_EE5mQwlUWwl0VcHD7152ZC5eyXLyDQw_4gJzSn-XiA/edit?usp=sharing)
