import Tex2SvgFile from "./file.js";

export default class Tex2SvgImgTag extends Tex2SvgFile {
  options(opts) {
    opts = super.options({
      inline: false,
      minifyids: true,
      prefixids: false,
      ...opts,
    });
    opts = {
      imgtag:
        opts.imgtag ||
        (({ name, style }) => `<img src="${name}.svg" style=${style}>`),
      ...opts,
    };
    this.imgtag = opts.imgtag;
    return opts;
  }

  async compile(descs) {
    const files = await this.load(descs);
    files.forEach((file) => {
      if (file.new) {
        file.svg = `<!--${file.style}-->${file.svg}`;
      } else {
        file.style = file.svg.match(/^<!--(.+?)-->/)[1];
      }
    });
    await this.write(files);
    return files.map((file) => this.imgtag(file));
  }
}
