/// <reference types="@solidjs/start/env" />
import "solid-js";
import type { Component, JSXElement } from "solid-js";
import type { CalendarDateProps, CalendarMonth } from "cally";
import type { JSX } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-date": any;
      "calendar-month": any;
    }
  }
}
