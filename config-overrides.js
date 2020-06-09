const { override, addBabelPreset } = require("customize-cra");

module.exports = override(
  // add emotion preset
  addBabelPreset("@emotion/babel-preset-css-prop"),
);

//todo:://add config to HtmlWebpackPlugin
