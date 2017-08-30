const AssetsPlugin = require('assets-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    devtool: false,
    output: {
        filename: '[name].js'
    },
    plugins: [
        new AssetsPlugin({
            filename: 'live-search.json',
            path: 'manifest'
        })
    ]
}
