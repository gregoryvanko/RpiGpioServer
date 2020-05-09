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
    {"pin":2, "type": "Relais", "name": "Relais1", "statu": "high", "activeLow" : true, "TimeOut": 10},
    {"pin":3, "type": "Relais", "name": "Relais2", "statu": "high", "activeLow" : true, "TimeOut": 10},
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