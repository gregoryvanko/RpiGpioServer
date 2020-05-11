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
Il est posible de tester les api via la page d'acceuil du serveur
### Definition des fonctions disponibles sur l'adresse **api**
1. Activer une valeur pour une des pin configurée dans l'object config
```
Action : setgpio
Data : {"name": string, "value": number}
```

2. Simuler l'appui sur un boutton confiuré dans l'object config
```
Action : testbutton
Data : {"name": string}
```

### Definition des fonctions disponibles à l'adresse **ping**
1. Recevoir la valeur "pong"
```
Action : null
Data : null
```