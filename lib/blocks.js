export function math(code, inline = false) {
  return {
    code: inline ? "$" + code + "$" : "$\\displaystyle " + code + "$",
    preamble: "\\usepackage{amsmath}",
    depth: inline,
  };
}

export function tikz(code, libraries = []) {
  return {
    code: "\\begin{tikzpicture}" + code + "\\end{tikzpicture}",
    preamble: [
      "\\usepackage{tikz}",
      ...libraries.map((l) => "\\usetikzlibrary{" + l + "}"),
    ],
    depth: false,
  };
}
