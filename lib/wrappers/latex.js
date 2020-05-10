import { promises as fs } from "fs";
import { exec } from "child_process";
import { join } from "path";

const tpl = (preamble, code) => `
\\documentclass[dvisvgm]{article}
\\usepackage[active,tightpage]{preview}
${preamble.filter((v, i) => preamble.indexOf(v) === i).join("\n")}
\\begin{document}
${code.map((c) => "\\begin{preview}" + c + "\\end{preview}").join("\n")}
\\end{document}
`;

export default function ({ preamble, tmpdir }) {
  if (!Array.isArray(preamble)) {
    preamble = [preamble];
  }
  return (pr, code) => {
    pr = [...preamble, ...pr];
    const name = Date.now().toString(36);
    const path = join(tmpdir, name);
    const tex = tpl(pr, code);
    const cmd = `latex -interaction=nonstopmode -output-directory ${tmpdir} ${path}.tex`;
    return fs.writeFile(path + ".tex", tex).then(
      () =>
        new Promise((resolve, reject) =>
          exec(cmd, (err, stdout) => {
            if (err) {
              return reject(`${cmd}\n${stdout} `);
            }
            resolve(path);
          })
        )
    );
  };
}
