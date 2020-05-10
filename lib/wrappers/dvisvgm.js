import { exec } from "child_process";

const re = /depth=([0-9\-e\.]+)pt[^]+?(<svg.+(width|height)=["']([0-9\.]+)pt["'].*(width|height)=["']([0-9\.]+)pt["'][^]+?<\/svg>)/;

export default function ({ tmpdir, precision, dvisvgm }) {
  const cmdp = `${dvisvgm} --tmpdir=${tmpdir} -d${precision} --no-fonts --bbox=preview --page=1- --stdout `;
  return (path, n) =>
    new Promise((resolve, reject) => {
      const cmd = cmdp + path + " 2>&1";
      exec(cmd, (err, stdout) => {
        if (err) {
          return reject(`${cmd}\n${stdout}`);
        }
        const pages = [];
        let m,
          s = stdout;
        while ((m = s.match(re)) !== null) {
          if (m[3] === m[5]) {
            return reject(`RegExp failed\n${s}`);
          }
          const bbox = {
            depth: parseFloat(m[1]),
          };
          if (m[3] === "width") {
            bbox.width = parseFloat(m[4]);
            bbox.height = parseFloat(m[6]);
          } else {
            bbox.width = parseFloat(m[6]);
            bbox.height = parseFloat(m[4]);
          }
          pages.push({
            svg: m[2],
            bbox,
          });
          s = s.substr(m.index + m[0].length);
        }
        if (pages.length !== n) {
          return reject(
            `${cmd}\n${stdout}\ngot ${pages.length} pages, expected ${n}`
          );
        }
        resolve(pages);
      });
    });
}
