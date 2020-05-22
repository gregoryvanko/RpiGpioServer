// const PinConfig = [
//     {"pin":2, "type": "Relais", "name": "Relais1", "status": "high", "activeLow" : true, "TimeOut": 10},
//     {"pin":3, "type": "Relais", "name": "Relais2", "status": "high", "activeLow" : true, "TimeOut": 1},
//     {"pin":4, "type": "Relais", "name": "Relais3", "status": "high", "activeLow" : true, "TimeOut": 1},
//     {"pin":17, "type": "Relais", "name": "Relais4", "status": "high", "activeLow" : true, "TimeOut": 1},
//     {"pin":27, "type": "Relais", "name": "Relais5", "status": "high", "activeLow" : true, "TimeOut": 1},
//     {"pin":22, "type": "Relais", "name": "Relais6", "status": "high", "activeLow" : true, "TimeOut": 1},
//     {"pin":10, "type": "Relais", "name": "Relais7", "status": "high", "activeLow" : true, "TimeOut": 1},
//     {"pin":9, "type": "Relais", "name": "Relais8", "status": "high", "activeLow" : true},
//     {"pin":7, "type": "Button", "name": "Button1", "status": "rising", "debounceTimeout" : 500}
// ]

const CoreXConfig = {
     "WorkerAdress": "http://192.168.10.21:5000",
     "WorkerApi": "/api",
     "LoginApi": "/login",
     "Login": "Aquagreen",
     "Pass":"123"
}

let RpiGpioServer = require('./index').RpiGpioServer
const Port = 3000
let MyApp = new RpiGpioServer(Port)
//MyApp.SetPinConfig(PinConfig)
MyApp.SetCoreXConfig(CoreXConfig)
MyApp.Start()