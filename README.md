# RpiGpioServer
A Node.js application for controling GPIO of RaspberryPi.

## Function available:
* Relais
    * Set Relais to On/Off
    * Get Relais Statu
* Button
    * Send post data when a button is pressed

## Usage
Install the package using npm:
```bash
npm install @gregvanko/rpigpioserver --save
```

## Start app
Creat a file "App.js" with:
```js
let RpiGpioServer = require('@gregvanko/rpigpioserver').RpiGpioServer
const Port = 3000
let MyApp = new RpiGpioServer(Port)
MyApp.Start()
```
Options
```js
// GPIO config
const PinConfig = [
    {"pin":2, "type": "Relais", "name": "Relais1", "statu": "high", "activeLow" : true, "TimeOut": 10},
    {"pin":3, "type": "Relais", "name": "Relais2", "statu": "high", "activeLow" : true, "TimeOut": 10},
    {"pin":7, "type": "Button", "name": "Button1", "statu": "rising", "debounceTimeout" : 500}
 ]
 // CoreX Worker config
 const CoreXConfig = {
     "WorkerAdress": "http://192.168.10.21:5000",
     "WorkerApi": "/api",
     "LoginApi": "/login",
     "Login": "Aquagreen",
     "Pass":"123"
}
let RpiGpioServer = require('@gregvanko/rpigpioserver').RpiGpioServer
const Port = 3000
let MyApp = new RpiGpioServer(Port)
MyApp.SetPinConfig(PinConfig)
MyApp.SetCoreXConfig(CoreXConfig)
MyApp.Start()
```
## Definition des fonctions disponibles sur les différentes adresses
Il est posible de tester les api via la page d'acceuil du serveur
### Adresse : api
* Set de la valeur pour un des GPIO configurés dans l'object config
```
Adresse : api
Action : setgpio
Data : {"name": string, "value": number}
```

* Get de la valeur pour un des GPIO configurés dans l'object config
```
Adresse : api
Action : getgpio
Data : {"name": string}
```

* "Ping Pong" du serveur RpiGpioServer 
```
Adresse : api
Action : null
Data : null
```

* Set de la config des GPIO
```
Adresse : api
Action : setconfig
Data : {"config": Array}
```

* Get de la config des GPIO
```
Adresse : api
Action : getconfig
Data : null
```

* Get global statu du serveur RpiGpioServer 
```
Adresse : api
Action : getstatus
Data : null
```

* Restart du serveur RpiGpioServer 
```
Adresse : api
Action : restart
Data : null
```

### Adresse : config
* Login to worker CoreX
```
Adresse : congif
Action : login
Data : {"login": "string", "pass": "string"}
```

* "Ping Pong" du worker CoreX
```
Adresse : congif
Action : pingworker
Data : null
```

* test button
```
Adresse : congif
Action : testbutton
Data : {"name": "string"}
```

* Get de la config des GPIO definie dans le Worker CoreX
```
Adresse : congif
Action : getworkerconfig
Data : null
```