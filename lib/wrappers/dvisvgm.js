import { exec } from "child_process";

const re = /depth=([0-9\-e\.]+)pt[^]+?(<svg.+width='([0-9\.]+)pt'\s+height='([0-9\.]+)pt'[^]+?<\/svg>)/;

export default function ({ tmpdir, precision }) {
  const cmdp = `dvisvgm --tmpdir=${tmpdir} -d${precision} --no-fonts --optimize=remove-clippath --bbox=preview --exact --page=1- --stdout `;
  return (path) =>
    new Promise((resolve, reject) => {
      const cmd = cmdp + path + " 2>&1";
      exec(cmd, (err, stdout) => {
        if (err) {
          return reject(`${cmd}\n${stdout}`);
        }
        const pages = [];
        let m;
        while ((m = stdout.match(re)) !== null) {
          pages.push({
            svg: m[2],
            bbox: {
              depth: parseFloat(m[1]),
              width: parseFloat(m[3]),
              height: parseFloat(m[4]),
            },
          });
          stdout = stdout.substr(m.index + m[0].length);
        }
        resolve(pages);
      });
    });
}
