module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel', '@babel/plugin-transform-export-namespace-from'],
  };
};