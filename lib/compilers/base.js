import latex from "../wrappers/latex.js";
import dvisvgm from "../wrappers/dvisvgm.js";
import svgo from "../wrappers/svgo.js";

export default class Tex2Svg {
  constructor(opts = {}) {
    this.options(opts);
  }

  options(opts) {
    opts = {
      tmpdir: "/tmp",
      precision: 2,
      inline: true,
      minifyids: false,
      prefixids: false,
      preamble: [],
      dvisvgm: "dvisvgm",
      ...opts,
    };
    const mpower = Math.pow(10, opts.precision - 1);
    const dpower = mpower * 10;
    this.cssunit = (number) => Math.round(number * mpower) / dpower + "em";
    this.svgo = svgo(opts);
    this.latex = latex(opts);
    this.dvisvgm = dvisvgm(opts);
    return opts;
  }

  async pages(descs) {
    const pages = await this.latex(
      descs.flatMap((b) => b.preamble),
      descs.map((b) => b.code)
    ).then((path) => this.dvisvgm(path, descs.length));
    pages.forEach((page, i) => {
      page.desc = descs[i];
      page.style = this.style(page);
    });
    return pages;
  }

  svgs(pages) {
    return Promise.all(pages.map((page) => this.svgo(page)));
  }

  style(page) {
    const { desc, bbox } = page;
    let style = `width:${this.cssunit(bbox.width)};height:${this.cssunit(
      bbox.height
    )}`;
    if (desc.depth && bbox.depth) {
      style += `;vertical-align:-${this.cssunit(bbox.depth)}`;
    }
    return style;
  }

  compile(descs) {
    return this.pages(descs).then((pages) => this.svgs(pages));
  }
}
