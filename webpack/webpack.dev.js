const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const webpack = require('webpack')

const DEBUG = process.env.NODE_ENV !== 'production'
const WATCH = process.env.NODE_WATCH === 'true'

/** Enable webpack errors trace stack */
process.traceDeprecation = DEBUG

module.exports = {
    watch: WATCH,
    devtool: 'eval-source-map',
    output: {
        filename: '[name].js',
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
    },
    plugins: [
        new FriendlyErrorsPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ]
}
