import React, { ReactNode } from "react";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";

type Props = {
  children: string;
};

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX();
const svg = new SVG();
const mathConverter = mathjax.document("", { InputJax: tex, OutputJax: svg });

export default function Latex({ children }: Props) {
  if ((children.match(/[$]/g) || []).length % 2 != 0) return children;
  const seperateLatex = children.split("$");
  let result = [];
  for (let i = 0; i < seperateLatex.length; i++) {
    if (i % 2 == 0) {
      result.push(seperateLatex[i]);
    } else {
      result.push(
        <span
          style={{ display: "inline-block", verticalAlign: "-5px" }}
          dangerouslySetInnerHTML={{
            __html: adaptor.outerHTML(
              mathConverter.convert(seperateLatex[i], { display: false })
            ),
          }}
        />
      );
    }
  }
  return <>{result}</>;
}
