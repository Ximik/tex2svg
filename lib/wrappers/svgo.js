import SVGO from "svgo";

export default function ({ inline, minifyids, prefixids }) {
  const plugins = [
    { removeViewBox: false },
    { removeDimensions: true },
    { cleanupNumericValues: false },
    { cleanupIDs: minifyids },
  ];
  if (inline) {
    plugins.push(
      {
        style: {
          type: "full",
          active: true,
          fn: (svg, _, { style }) => {
            const root = svg.content[0];
            root.addAttr({
              name: "style",
              local: "style",
              prefix: "",
            });
            root.attr("style").value = style;
            return svg;
          },
        },
      },
      { removeXMLNS: true }
    );
  }
  if (prefixids) {
    const prefix = (_, page) => prefixids(page);
    plugins.push({
      prefixIds: {
        delim: "",
        prefix,
      },
    });
  }
  const svgo = new SVGO({ plugins });
  return (page) => svgo.optimize(page.svg, page).then(({ data }) => data);
}
