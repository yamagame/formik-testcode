import React, { InputHTMLAttributes } from "react";

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: "inline" }}>
      <input {...props} />
    </div>
  );
}
