let RpiGpioServer = require('./index').RpiGpioServer
let MyApp = new RpiGpioServer(2000)
MyApp.Start()