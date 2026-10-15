"use client";

import { IoPrintOutline } from "react-icons/io5";
import { ACTION_SOLID, ACTION_SOLID_FILL, ACTION_SOLID_ICON } from "./actions";

// The one interactive bit of the result, so the rest of it can stay on the
// server: the print dialog is also every browser's "save as PDF".
export default function PrintCertificateButton() {
  return (
    <button type="button" onClick={() => window.print()} className={ACTION_SOLID}>
      <span aria-hidden="true" className={ACTION_SOLID_FILL} />
      <span className="relative">Print or save as PDF</span>
      <span className={ACTION_SOLID_ICON}>
        <IoPrintOutline className="size-[18px]" />
      </span>
    </button>
  );
}
