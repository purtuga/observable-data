const path              = require('path');
const webpack           = require('webpack');
const UglifyJSPlugin    = require('uglifyjs-webpack-plugin');
const isProduction      = process.env.NODE_ENV === "production";

console.log(`MODE: ${ isProduction ? "PRODUCTION" : "DEVELOPMENT" }`);

let config = module.exports = {
    entry: './src/index.js',
    output: {
        library: "ObservableData",
        libraryTarget: "umd",
        filename: 'ObservableData.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: "source-map",
    module: {
        rules: []
    },
    plugins: []
};

//---------------------------------------
//    PRODUCTION
//---------------------------------------
if (isProduction) {
    config.module.rules.push(
        {
            test: /\.js$/,
            loader: "babel-loader"
        }
    );

    config.plugins.push(
        new UglifyJSPlugin({
            sourceMap: true,
            output: {
                comments: false
            }
        }),

        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    )
}
