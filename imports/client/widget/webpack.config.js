var webpack = require('webpack'),
    path = require('path');

module.exports = {
    entry: "./agentcar.js",
    output: {
        filename: "../../../public/agentcar.js",
        publicPath: "http://debian359.tk/"
        // publicPath: "http://localhost:3000/"
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
            },
            { test: /\.(png|jpg)$/, loader: "file-loader?name=[path][name].[ext]" },
            { test: /\.css$/, loader: "style-loader!css-loader" }
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
            _: 'lodash',
            Q: 'q'
        }),
        new webpack.optimize.UglifyJsPlugin({ minimize: true, compress: { warnings: false } })
    ]

}
