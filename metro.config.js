const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve(
    path.join(__dirname, "tools/skslTransformer.js"),
  ),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(
    (ext) => !["sksl", "glsl", "frag"].includes(ext),
  ),
  sourceExts: [...resolver.sourceExts, "sksl", "glsl", "frag"],
};

module.exports = config;
