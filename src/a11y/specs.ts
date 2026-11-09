import type { SpecRef } from "../types/a11y";

const ACCNAME = "https://www.w3.org/TR/accname-1.2/";
const HTML_AAM = "https://www.w3.org/TR/html-aam-1.0/";

export const ACCNAME_STEPS: SpecRef = {
  label: "AccName 1.2, 4.3.2",
  url: `${ACCNAME}#computation-steps`,
};

export const ARIA_NAME_PROHIBITED: SpecRef = {
  label: "ARIA 1.2, 5.2.8.6",
  url: "https://www.w3.org/TR/wai-aria-1.2/#namefromprohibited",
};

export const HTML_AAM_DESCRIPTION: SpecRef = {
  label: "HTML-AAM 4.2",
  url: `${HTML_AAM}#accdesc-computation`,
};

export const htmlAam = (section: string, anchor: string): SpecRef => ({
  label: `HTML-AAM ${section}`,
  url: `${HTML_AAM}#${anchor}`,
});
