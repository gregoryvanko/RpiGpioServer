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
const config = [
    {"pin":2, "type": "Relais", "name": "Relais1", "statu": "high", "activeLow" : true},
    {"pin":3, "type": "Relais", "name": "Relais2", "statu": "high", "activeLow" : true},
    {"pin":4, "type": "Relais", "name": "Relais3", "statu": "high", "activeLow" : true},
    {"pin":17, "type": "Relais", "name": "Relais4", "statu": "high", "activeLow" : true},
    {"pin":27, "type": "Relais", "name": "Relais5", "statu": "high", "activeLow" : true},
    {"pin":22, "type": "Relais", "name": "Relais6", "statu": "high", "activeLow" : true},
    {"pin":10, "type": "Relais", "name": "Relais7", "statu": "high", "activeLow" : true},
    {"pin":9, "type": "Relais", "name": "Relais8", "statu": "high", "activeLow" : true},
    {"pin":7, "type": "Button", "name": "Button1", "statu": "rising", "debounceTimeout" : 500}
 ]
let RpiGpioServer = require('@gregvanko/rpigpioserver').RpiGpioServer
let MyApp = new RpiGpioServer(3000, config)
MyApp.Start()
```
## Api
Voici la definition des fonctions disponibles à l'adresse /api:

```
Activer une valeur pour une des pin configurée dans l'object config

Action : setgpio
Data : {"name": string, "value": number}
```

```
Simuler l'appui sur un boutton confiuré dans l'object config

Action : testbutton
Data : {"name": string}
```