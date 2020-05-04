let RpiGpioServer = require('./index').RpiGpioServer
let MyApp = new RpiGpioServer(3000)
MyApp.Start()