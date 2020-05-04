class RpiGpioServer {
    constructor(Port=3000){
        this._Port = Port

        // Variable Interne Express
        this._Express = require('express')()
        this._http = require('http').Server(this._Express)
    }
 
    /* Start de l'application */
    Start(){
        console.log("Application started")
        let me = this
        // utilistaion de body-parser
		var bodyParser = require("body-parser")
		this._Express.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
        this._Express.use(bodyParser.json({limit: '200mb'}))

        this._Express.get('/', function(req, res, next){
            //res.send(me.GetInitialHTML())
            res.sendFile(__dirname + '/api.html')
        })
        // Api
        this._Express.post('/api', function(req, res, next){
            switch (req.body.FctName) {
                case "setgpio":
                    me.SetGpio(req.body.FctData, res)
                    break
                default:
                    res.json({Error: true, ErrorMsg:"No API for FctName: " + req.body.FctName})
                    break
            }
        })
        // Creation de la route 404
        this._Express.use(function(req, res, next) {
            console.log('Mauvaise route: ' + req.originalUrl)
            res.status(404).send("Sorry, the route " + req.originalUrl +" doesn't exist");
        })
        // Gestion des erreur
        this._http.on('error', function(error){
            if (error.syscall !== 'listen') {
                throw error;
            }
            if (error.code == "EADDRINUSE"){
                console.error('Port is already in use')
                process.exit(1)
            }
        })
        // Lancer le serveur
		this._http.listen(this._Port, function(){
			console.log('listening on *:' + me._Port)
        })
    }

    /**
     * Actionne un GPIO
     * @param {object} Data Object contenant la commande a realiser
     * @param {res} res res
     */
    SetGpio(Data, res){
        try {
            let InputData = JSON.parse(Data)
            if(InputData.pin){
                if(InputData.value){
                    let PinNum = parseInt(InputData.pin)
                    let Value = parseInt(InputData.value)
                    const Gpio = require('onoff').Gpio
                    const Pin = new Gpio(PinNum, 'out')
                    Pin.writeSync(Value)
                    let reponse = "Pin number: " + PinNum + " value: " + Pin.readSync()

                    res.json({Error: false, ErrorMsg: "no error", Data: reponse})
                } else {
                    res.json({Error: true, ErrorMsg: 'Object "value" is missing in {"pin": number, "value": number}', Data: null})
                }
            } else {
                res.json({Error: true, ErrorMsg: 'Object "pin" is missing in {"pin": number, "value": number}', Data: null})
            }
        } catch(e) {
            res.json({Error: true, ErrorMsg: "JSON Parse error: " + e, Data: null})
        }
    }
 }
 module.exports.RpiGpioServer = RpiGpioServer