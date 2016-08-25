var webpack = require('webpack'),
    path = require('path');

module.exports = {
    entry: "./agentcar.js",
    output: {
        filename: "../../../public/agentcar.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|libs)/,
                loader: "babel",
		        query: {
			        presets: ['es2015', 'stage-2']
		        }
            }
        ]
    },
    resolve: {
        extensions: ["", ".js", ".es6"]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            DDP: path.resolve(__dirname, './lib/ddp'),
            Q: 'q'
        }),
        new webpack.optimize.UglifyJsPlugin({ minimize: true, compress: { warnings: false } })
    ]

}
