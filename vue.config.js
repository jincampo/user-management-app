const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: '/',
  outputDir: 'dist',
  devServer: {
    hot: true,
    liveReload: true,
    host: 'localhost',
    port: 8080,
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
        poll: 1000 // Check for changes every second
      }
    }
  }
}) 