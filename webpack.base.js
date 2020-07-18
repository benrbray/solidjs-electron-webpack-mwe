// adapted from the Notable source
// (https://github.com/notable/notable/blob/54646c1fb64fbcf3cc0857a2791cfb6a6ae48313/webpack.base.js)

const TSConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");

////////////////////////////////////////////////////////////

// (7/16/20) webpack+babel https://stackoverflow.com/a/52323181/1444650
// (7/16/20) babel-preset-solid https://github.com/ryansolid/solid
// (7/16/20) solidjs+ts advice:  https://gitter.im/solidjs-community/community?at=5d92f910d97d8e3549e2b7ef
////////////////////////////////////////////////////////////

function replacer(key,value) {
    if (value instanceof RegExp) {
        return value.toString();
    }

    return value;
}

function base(options){
	return (config) => {
		let result = merge(config, {
			resolve: { extensions: [ '.tsx', '.ts', '.js', '.jsx' ] },
			target: options.target,
			devtool: "source-map",
			optimization: {
				minimize: false
			},
		});

		result.module.rules.push({
			test: /\.jsx$/,
			"loader": "babel-loader",
			"options": {
				"babelrc": false,
				"presets": [ "solid" ],
			}
		});


		// print the actual webpack rules that are being used
		console.log("\n\n\n");
		console.log(JSON.stringify(result.module.rules, replacer, 2));
		console.log("\n\n\n");
		return result;
	}
}

module.exports = base;