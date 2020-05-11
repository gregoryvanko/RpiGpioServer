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
## Definition des fonctions disponibles sur les différentes adresses
Il est posible de tester les api via la page d'acceuil du serveur
### Adresse : api
* Activer une valeur pour un des GPIO configurés dans l'object config
```
Adresse : api
Action : setgpio
Data : {"name": string, "value": number}
```

* Simuler l'appui sur un boutton confiuré dans l'object config
```
Adresse : api
Action : testbutton
Data : {"name": string}
```

### Adresse : ping
* Recevoir la valeur "pong"
```
Adresse : ping
Action : null
Data : null
```