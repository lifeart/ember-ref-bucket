'use strict';

module.exports = {
  name: require('./package').name,
  setupPreprocessorRegistry(type, registry) {
    const plugin = this._buildPlugin();

    plugin.parallelBabel = {
      requireFile: __filename,
      buildUsing: '_buildPlugin',
      params: {}
    };

    registry.add('htmlbars-ast-plugin', plugin);
  },

  _buildPlugin() {
    const RefTransform = new require('./lib/ref-transform');

    return {
      name: 'ref-transform',
      plugin: RefTransform,
      baseDir() {
        return __dirname;
      }
    };
  }
};
