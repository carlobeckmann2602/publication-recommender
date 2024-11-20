import React from "react";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

type Props = {
  children: string;
};

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: AllPackages,
});
const svg = new SVG();
const mathConverter = mathjax.document("", { InputJax: tex, OutputJax: svg });

export default function Latex({ children }: Props) {
  // Regular expression to match LaTeX expressions enclosed in dollar signs
  const regex = /(\$[^$]*\$)/g;

  // Split the text into parts: plain text and LaTeX expressions
  const parts = children.split(regex);

  const result = parts.map((part, index) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      // LaTeX part, remove the dollar signs and convert
      const latex = part.slice(1, -1);
      const convertedLatex = mathConverter.convert(latex, { display: false });
      const html = adaptor.outerHTML(convertedLatex);
      return (
        <span
          key={index}
          style={{ display: "inline-block", verticalAlign: "-3px" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    // Plain text part
    return part;
  });

  return <>{result}</>;
}
