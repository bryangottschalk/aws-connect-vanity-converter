const path = require('path');

module.exports = {
  entry: {
    PUTLambda: './src/handlers/vanity-phone-number-converter.ts',
    GETLambda: './src/handlers/get-ddb.ts'
  },
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
    libraryTarget: 'commonjs2',
    filename: '[name].js', // The [name] is taken from entry properties, so if we have PUTLambda and GETLambda as properties, we got 2 output files - PUTLambda.js and GETLambda.js
    path: path.resolve(__dirname, 'build')
  }
};
