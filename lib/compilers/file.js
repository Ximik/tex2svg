import { createHash } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import Tex2Svg from "./base.js";

export default class Tex2SvgFile extends Tex2Svg {
  options(opts) {
    opts = super.options({
      minifyids: true,
      prefixids: ({ name }) => name,
      ...opts,
    });
    opts = {
      outdir: opts.tmpdir,
      name: ({ code }) => createHash("md5").update(code).digest("hex"),
      ...opts,
    };
    this.filepath = (name) => join(opts.outdir, name + ".svg");
    this.name = opts.name;
    return opts;
  }

  async load(descs) {
    const files = await Promise.all(
      descs.map(async (desc) => {
        const name = this.name(desc);
        const svg = await fs
          .readFile(this.filepath(name), "utf8")
          .catch((err) => {
            if (err.code !== "ENOENT") {
              throw err;
            }
          });
        return { desc, name, svg, new: !svg };
      })
    );
    const newfiles = files.filter((file) => file.new);
    const pages = await this.pages(newfiles.map(({ desc }) => desc));
    pages.forEach((page, i) => (page.name = newfiles[i].name));
    const svgs = await this.svgs(pages);
    svgs.forEach((svg, i) => Object.assign(newfiles[i], pages[i], { svg }));
    return files;
  }

  write(files) {
    return Promise.all(
      files
        .filter((file) => file.new)
        .map(({ name, svg }) => fs.writeFile(this.filepath(name), svg))
    );
  }

  async compile(descs) {
    const files = await this.load(descs);
    await this.write(files);
    return files.map(({ svg }) => svg);
  }
}
