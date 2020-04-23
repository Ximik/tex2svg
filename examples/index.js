import { promises as fs } from "fs";
import { join } from "path";
import { Tex2Svg, Tex2SvgImgTag, math, tikz } from "../lib/index.js";

const blocks = [
  {
    code: "\\LaTeX",
    depth: true, // the blocks with depth can be vertically aligned
  },
  math("\\zeta(s) = \\sum\\limits_{n=1}^\\infty 1 / n^s", true),
  math("\\zeta(s) = \\sum\\limits_{n=1}^\\infty 1 / n^s"),
  tikz(
    // From https://cremeronline.com/LaTeX/minimaltikz.pdf
    "\\draw [blue] (0,0) rectangle (1.5,1); \\draw [red, ultra thick] (3,0.5) circle [radius=0.5]; \\draw [gray] (6,0) arc [radius=1, start angle=45, end angle= 120];"
  ),
  tikz(
    "\\node (a) {A}; \\node (b) at (1,0) {B};\\draw [open triangle 45-triangle 45] (a) -- (b);",
    ["arrows"]
  ),
];
const tpl = (svgs) => `
<p>Lorem ipsum dolor sit ${svgs[0]} amet, consectetur adipiscing elit. Aenean tincidunt euismod finibus. Praesent nibh leo, placerat ${svgs[1]} ac lectus a, dictum interdum ipsum. Phasellus sagittis dolor enim, sit amet volutpat dui pharetra eget. Donec rutrum porttitor accumsan. Donec faucibus ipsum a egestas egestas. In quis viverra purus. In laoreet, metus sed blandit ultrices, enim ex mollis dolor, vel efficitur dui elit a ante. Praesent at pretium mauris. In eu maximus nisl. Fusce sagittis massa nisl, in pharetra ipsum lacinia id. Donec ${svgs[0]} luctus sodales urna, at iaculis arcu maximus at. Nulla pretium fringilla scelerisque. ${svgs[1]} Nullam quis lacinia justo.</p>
<h1>Lorem ipsum dolor sit amet ${svgs[0]} consectetur adipiscing ${svgs[1]}</h1>
<h2>Lorem ipsum dolor sit amet ${svgs[0]} consectetur adipiscing ${svgs[1]}</h2>
<h3>Lorem ipsum dolor sit amet ${svgs[0]} consectetur adipiscing ${svgs[1]}</h3>
<h4>Lorem ipsum dolor sit amet ${svgs[0]} consectetur adipiscing ${svgs[1]}</h4>
<div style="font-size:20px">${svgs[2]}</div>
<div style="font-size:40px">${svgs[2]}</div>
<div style="font-size:20px">${svgs[3]}</div>
<div style="font-size:40px">${svgs[3]}</div>
<div style="font-size:20px">${svgs[4]}</div>
<div style="font-size:40px">${svgs[4]}</div>
`;

const tmpdir = "/tmp/tex2svg";
const inlinedir = "inline";
const externaldir = "external";

const inlinecomp = new Tex2Svg({ tmpdir });
const externalcomp = new Tex2SvgImgTag({ tmpdir, outdir: externaldir });

Promise.all(
  [tmpdir, inlinedir, externaldir].map((dir) =>
    fs.mkdir(dir, { recursive: true })
  )
).then(
  Promise.all([
    inlinecomp
      .compile(blocks)
      .then((svgs) => fs.writeFile(join(inlinedir, "index.html"), tpl(svgs))),
    externalcomp
      .compile(blocks)
      .then((svgs) => fs.writeFile(join(externaldir, "index.html"), tpl(svgs))),
  ])
);
