const purgeCache = () => {
  for (const path in require.cache) {
    if (path.endsWith(".js")) {
      // only clear *.js, not *.node
      delete require.cache[path];
    }
  }
};

module.exports = {
  purgeCache,
};
