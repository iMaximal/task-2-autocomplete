const merge = require('webpack-merge')
const webpack = require('webpack')

const DEBUG = process.env.NODE_ENV !== 'production'

const options = {
    output: {
        publicPath: '/javascripts/'
    },
    resolve: {},
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        cacheDirectory: true,
                        presets: ['es2015', 'stage-0'],
                        plugins: [
                            'transform-runtime',
                        ]
                    }
                }]
            }
        ]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
}
module.exports = DEBUG ?
    merge(options, require('./webpack.dev')) :
    merge(options, require('./webpack.dist'))
