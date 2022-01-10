const path = require('path');

module.exports = {
  entry: [
    './src/handlers/vanity-phone-number-converter.ts',
    './src/handlers/get-ddb.ts'
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        include: [path.resolve(__dirname, 'src')],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node',
  mode: 'production',
  output: {
    libraryTarget: 'commonjs',
    filename: 'webpack-bundle.js',
    path: path.resolve(__dirname, 'build')
  }
};
