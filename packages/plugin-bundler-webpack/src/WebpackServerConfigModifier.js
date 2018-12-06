import webpack from "webpack";

import getWebpackConfig from "./WebpackGetConfig.js";

const requireSourceMapSupport = `require('${require
  .resolve("source-map-support/register")
  // windows support
  .replace(/\\/g, "/")}');`;

const defaultExternals = [
  // we could consider node_modules as externals deps
  // and so use something like
  // /^[A-Za-z0-9-_]/
  // to not bundle all deps in the static build (for perf)
  // the problem is that if people rely on node_modules for stuff
  // like css, this breaks their build.
  //
  // @todo find a better way than a whitelist

  /^apollo(\/.*)?/,
  /^aphrodite(\/.*)?/,
  /^emotion(\/.*)?/,
  /^glamor(\/.*)?/,
  /^react-native-web(\/.*)?/,
  /^react-helmet(\/.*)?/,
];

export default (config, cacheDir) => {
  const webpackConfig = getWebpackConfig(config);
  return {
    ...webpackConfig,
    // only keep the entry we are going to use
    entry: {
      [config.bundleName]: webpackConfig.entry[config.bundleName],
    },
    // adjust some config details to be node focused
    target: "node",
    // externals for package/relative name
    externals: [...(webpackConfig.externals || defaultExternals)],
    output: {
      publicPath: config.baseUrl.pathname,
      path: cacheDir,
      filename: "[name].js",
      library: "app",
      libraryTarget: "commonjs2",
      devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    },
    plugins: [
      ...webpackConfig.plugins,
      // sourcemaps
      new webpack.BannerPlugin({
        banner: requireSourceMapSupport,
        raw: true,
        entryOnly: false,
      }),
    ],
    // sourcemaps
    devtool: "#source-map",
  };
};
