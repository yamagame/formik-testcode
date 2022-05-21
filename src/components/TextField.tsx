import React, { InputHTMLAttributes } from "react";

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <input {...props} />
    </div>
  );
}
