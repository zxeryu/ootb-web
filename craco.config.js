require("ts-node").register({ compilerOptions: { module: "commonjs" } });
const config = require("./tool/craco-config").default;

module.exports = config;
