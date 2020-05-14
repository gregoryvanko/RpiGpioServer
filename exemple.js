const Config = [
    {"pin":2, "type": "Relais", "name": "Relais1", "statu": "high", "activeLow" : true, "TimeOut": 10},
    {"pin":3, "type": "Relais", "name": "Relais2", "statu": "high", "activeLow" : true, "TimeOut": 1},
    {"pin":4, "type": "Relais", "name": "Relais3", "statu": "high", "activeLow" : true, "TimeOut": 1},
    {"pin":17, "type": "Relais", "name": "Relais4", "statu": "high", "activeLow" : true, "TimeOut": 1},
    {"pin":27, "type": "Relais", "name": "Relais5", "statu": "high", "activeLow" : true, "TimeOut": 1},
    {"pin":22, "type": "Relais", "name": "Relais6", "statu": "high", "activeLow" : true, "TimeOut": 1},
    {"pin":10, "type": "Relais", "name": "Relais7", "statu": "high", "activeLow" : true, "TimeOut": 1},
    {"pin":9, "type": "Relais", "name": "Relais8", "statu": "high", "activeLow" : true},
    {"pin":7, "type": "Button", "name": "Button1", "statu": "rising", "debounceTimeout" : 500}
]
const CoreX = {
     "WorkerAdress": "http://192.168.10.21:5000",
     "WorkerApi": "/api",
     "LoginApi": "/login",
     "Login": "Aquagreen",
     "Pass":"123"
}

let RpiGpioServer = require('./index').RpiGpioServer
const Port = 3000
let MyApp = new RpiGpioServer(Port, null, CoreX)
MyApp.Start()