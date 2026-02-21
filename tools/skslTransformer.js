const fs = require("fs");

// В Expo треба брати саме цей upstream transformer:
const upstreamTransformer = require("@expo/metro-config/babel-transformer");

function isShaderFile(filename) {
  return (
    filename.endsWith(".sksl") ||
    filename.endsWith(".glsl") ||
    filename.endsWith(".frag")
  );
}

module.exports.transform = function ({ src, filename, options }) {
  if (isShaderFile(filename)) {
    const code = fs.readFileSync(filename, "utf8");
    const js = `export default ${JSON.stringify(code)};`;
    return upstreamTransformer.transform({ src: js, filename, options });
  }
  return upstreamTransformer.transform({ src, filename, options });
};
