const config = [
    {"pin":2, "type": "Relais", "name": "Relais1", "statu": "high", "activeLow" : true},
    {"pin":3, "type": "Relais", "name": "Relais2", "statu": "high", "activeLow" : true},
    {"pin":4, "type": "Relais", "name": "Relais3", "statu": "high", "activeLow" : true},
    {"pin":17, "type": "Relais", "name": "Relais4", "statu": "high", "activeLow" : true},
    {"pin":27, "type": "Relais", "name": "Relais5", "statu": "high", "activeLow" : true},
    {"pin":22, "type": "Relais", "name": "Relais6", "statu": "high", "activeLow" : true},
    {"pin":10, "type": "Relais", "name": "Relais7", "statu": "high", "activeLow" : true},
    {"pin":9, "type": "Relais", "name": "Relais8", "statu": "high", "activeLow" : true},
 ]
let RpiGpioServer = require('./index').RpiGpioServer
let MyApp = new RpiGpioServer(3000, config)
MyApp.Start()