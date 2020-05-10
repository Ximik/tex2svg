# tex2svg

tex2svg is a Node.JS library for compiling the (La)Tex code blocks to SVGs.

## Features

1. Generates truly responsive SVGs, which automatically scale and align respecting both the font size and the baseline.
2. Can generate both, inline SVGs and SVGs being loaded with `img` tag.
3. Supports `math` and `tikz` environments by default and is easily extendable.
4. Combines all the required blocks into one TeX file, therefore makes minimum `exec` calls.
5. Optimizes the resulting SVG with [SVGO](https://github.com/svg/svgo).

## Installation

```bash
npm i tex2svg
```

`latex` and `dvisvgm` executables should be available in the `PATH`. LaTeX `preview` package should be installed (in most cases, it's installed by default).

## Usage

The library provides three slightly different compilers one can choose from

```js
import { Tex2Svg, Tex2SvgFile, Tex2SvgImgTag } from "tex2svg";

// The basic compiler
const basicCompiler = new Tex2Svg({
  tmpdir: "/tmp", // the dir for temporary files
  precision: 2, // the integer from 1 to 6, defines the number of digits after the comma
  inline: true, // generate inline SVG code
  minifyids: false, // minify IDs, use carefully when having several inline SVGs on one page
  prefixids: false, // prefix function for IDs
  preamble: [], // additional preamble, e.g. "\usepackage{cmbright}"
  dvisvgm: "dvisvgm", // dvisvgm command, e.g. "dvisvgm --optimize=remove-clippath --exact-bbox"
});

// The compiler which writes the resulting SVG in files.
// Will read from file instead of recompiling if the file already exists.
// Therefore it's useful for incremental builds.
const fileCompiler = new Tex2SvgFile({
  outdir, // the dir for SVG files, tmpdir by default
  name, // function returning the target file name, md5sum of the code by default
});

// Same as previous one, but returns <img> tags instead of SVG code.
// Useful when inline SVG inside HTML is unwanted
const imgTagCompiler = new Tex2SvgImgTag({
  imgtag, // function returning the img tag, the minimal implementation by default
});
```

Each compiler has a `compile` method, which receives the array of `block`s.
One can easily create the `block` manually, but the library provides two useful helpers for that

```js
import { math, tikz } from "tex2svg";

// math for using as inline element
const inlineMath = math(
  "\\zeta(s) = \\sum\\limits_{n=1}^\\infty 1 / n^s",
  true
);
// math for using as block element
const displaystyleMath = math(
  "\\zeta(s) = \\sum\\limits_{n=1}^\\infty 1 / n^s"
);
// tikz with basic macros only
const basicTikz = tikz(
  "\\node (a) {A}; \\node (b) at (1,0) {B};\\draw [<->] (a) -- (b);"
);
// tikz with arrows library
const extraLibraryTikz = tikz(
  "\\node (a) {A}; \\node (b) at (1,0) {B};\\draw [open triangle 45-triangle 45] (a) -- (b);",
  ["arrows"]
);
// custom block
const simpleTextBlock = {
  code: "\\LaTeX",
  depth: true, // the block with depth can be vertically aligned
};

compiler.compile([
  inlineMath,
  displaystyleMath,
  basicTikz,
  extraLibraryTikz,
  simpleTextBlock,
]); // returns Promise with the array of strings
```

## Examples

Check generated example pages with [inline](https://github.com/Ximik/tex2svg/blob/master/examples/inline/index.html) and [external](https://github.com/Ximik/tex2svg/blob/master/examples/external/index.html) SVGs.
