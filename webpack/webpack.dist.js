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
            path: 'manifest',
            processOutput(assets) {
                for (const key in assets) {
                    assets[`${key}.js`] = assets[key].js.slice('/javascripts/'.length)
                    delete assets[key]
                }

                return JSON.stringify(assets)
            }
        })
    ]
}
