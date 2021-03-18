var path = require('path');
var WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = [{
    target: "web",
    watch: true,
    watchOptions: {
       poll: true,
      ignored: /node_modules/
    },
    devtool: 'inline-source-map',
    entry: {
        index: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'public/javascripts/'),
        filename: '[name].bundle.js'
    },
    plugins: [
    //    new WebpackShellPluginNext({
    //      onBuildStart:{scripts: ['echo "Webpack Start"']},
    //      onBuildEnd:{scripts: ["nodemon ./bin/www --ignore public/ --ignore src/"]}}),
    ],
    module: {
    rules: [
      {
        test: /\.css$/,
        //exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }
    ]
  }
    }
];