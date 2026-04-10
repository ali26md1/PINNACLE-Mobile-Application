const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// PINNACLE Windows Optimization: Reduce workers to prevent file-system bottlenecks
// and improve stability on Windows development environments.
config.maxWorkers = 2;

module.exports = config;
