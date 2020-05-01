# RpiGpioServer
A Node.js application for controling GPIO of RaspberryPi

## Usage
First, install the package using npm:
```bash
npm install @gregvanko/rpigpioserver --save
```

## Start app
Creat a file "App.js" with:
```js
let RpiGpioServer = require('@gregvanko/rpigpioserver').RpiGpioServer
let MyApp = new RpiGpioServer(3000)
MyApp.Start()
```
