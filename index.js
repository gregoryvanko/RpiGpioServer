class RpiGpioServer {
    constructor(Port=3000, Config = [], CoreX = null){
        this._Port = Port
        this._Config = Config
        this._CoreX = CoreX

        // Variable Interne Express
        this._Express = require('express')()
        this._http = require('http').Server(this._Express)

        // Class GPIO
        var GPIO = require('./gpio')
        this._MyGPIO = new GPIO.GPIO(this._Config)

        this._LoginToken = null
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
                    me.ApiSetGpio(req.body.FctData, res)
                    break
                case "ping":
                    res.json({Error: false, ErrorMsg:"No error",Data: "pong"})
                    break
                default:
                    res.json({Error: true, ErrorMsg:"No API for FctName: " + req.body.FctName})
                    break
            }
        })
        // Ping
        this._Express.post('/config', function(req, res, next){
            switch (req.body.FctName) {
                case "testbutton":
                    me.ApiTestbutton(req.body.FctData, res)
                    break
                case "login":
                    me.ApiLogin(req.body.FctData, res)
                    break
                case "pingworker":
                    me.ApiPingWorker(res)
                    break
                default:
                    res.json({Error: true, ErrorMsg:"FctName not find: " + req.body.FctName})
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

        // Evenement GPIO: le boutton est pressé
		this._MyGPIO.on(this._MyGPIO.EmitOn_Button_Rising, (data) => {
            this.ButtonPressed(data).then((reponse)=>{
                console.log(reponse)
            },(erreur)=>{
                console.log("Error on sending pressed button: " + erreur)
            })
        })

        // Lorsque l'on ferme l'application, il faut libérer les GPIO
        process.on('SIGINT', this._MyGPIO.Close.bind(this._MyGPIO))
        
        // if Worker CoreX existe, alors login to worker
        if (this._CoreX != null){
            this.Login({"login": this._CoreX.Login, "pass": this._CoreX.Pass}).then((reponse)=>{
                this.PingWorker().then((reponse)=>{
                    console.log("Loged to the worker")
                },(erreur)=>{
                    console.log("Error on Ping to worker: " + erreur)
                })
            },(erreur)=>{
                console.log("Error on logoin to worker: " + erreur)
            })
        }
    }

    /**
     * Actionne un GPIO
     * @param {object} Data Object contenant la commande a realiser
     * @param {res} res res
     */
    ApiSetGpio(Data, res){
        try {
            let InputData = JSON.parse(Data)
            if(typeof InputData.name != "undefined"){
                if(typeof InputData.value != "undefined"){
                    let Value = parseInt(InputData.value)

                    let relaisStatus =""
                    if (Value == 0){relaisStatus = this._MyGPIO.Const_RelayStatus_Off} 
                    else {relaisStatus = this._MyGPIO.Const_RelayStatus_On}

                    this._MyGPIO.SetRelayStatus(InputData.name, relaisStatus).then((reponse)=>{
                        let ReponseSetGpio = new Object()
                        ReponseSetGpio. ApiVersion = "1.0"
                        ReponseSetGpio.Name = InputData.name
                        ReponseSetGpio.value = Value
                        res.json({Error: false, ErrorMsg: "no error", Data: ReponseSetGpio})
                    },(erreur)=>{
                        res.json({Error: true, ErrorMsg: "Error on SetGpio: " + erreur, Data: null})
                    })
                } else {
                    res.json({Error: true, ErrorMsg: 'Object "value" is missing in {"name": "string", "value": number}', Data: null})
                }
            } else {
                res.json({Error: true, ErrorMsg: 'Object "name" is missing in {"name": "string", "value": number}', Data: null})
            }
        } catch(e) {
            res.json({Error: true, ErrorMsg: "JSON Parse error: " + e + ' in {"name": "string", "value": number}', Data: null})
        }
    }

    /**
     * Simule l'appui sur un bouton via l'API
     * @param {object} Data Obeject contenant la commande a realiser
     * @param {res} res res
     */
    ApiTestbutton(Data, res){
        try {
            let InputData = JSON.parse(Data)
            if(typeof InputData.name != "undefined"){
                this.ButtonPressed(InputData.name).then((reponse)=>{
                    let ReponseTestbutton = new Object()
                    ReponseTestbutton. ApiVersion = "1.0"
                    ReponseTestbutton.info = reponse
                    res.json({Error: false, ErrorMsg: "no error", Data: ReponseTestbutton})
                },(erreur)=>{
                    res.json({Error: true, ErrorMsg: "Error on sending pressed button: " + erreur, Data: null})
                })
            } else {
                res.json({Error: true, ErrorMsg: 'Object "name" is missing in {"name": "string"}', Data: null})
            }
        } catch(e) {
            res.json({Error: true, ErrorMsg: "JSON Parse error: " + e + ' in {"name": "string"}', Data: null})
        }
    }

    ButtonPressed(ButtonName){
        return new Promise((resolve, reject)=>{
            console.log("Boutton pressed: " + ButtonName)
            if (this._CoreX != null){
                const axios = require('axios')
                axios.post(this._CoreX.WorkerAdress + this._CoreX.WorkerApi, {Token:this._LoginToken, FctName:"Worker", FctData:{Fct:"ButtonPressed", Name:ButtonName}}).then(res => {
                    if (res.data.Error){
                        reject(res.data.ErrorMsg)
                    } else {
                        resolve(res.data.Data)
                    }
                }).catch(error => {
                    reject(error)
                })
            } else {
                reject("No CoreX Worker defined")
            }
        })
    }

    /**
     * Actionne un GPIO
     * @param {object} Data Object contenant la commande a realiser
     * @param {res} res res
     */
    ApiLogin(Data,res){
        try {
            let InputData = JSON.parse(Data)
            if(typeof InputData.login != "undefined"){
                if(typeof InputData.pass != "undefined"){
                    this.Login(InputData).then((reponse)=>{
                        let ReponseLogin = new Object()
                        ReponseLogin. ApiVersion = "1.0"
                        ReponseLogin.info = reponse
                        res.json({Error: false, ErrorMsg: "no error", Data: ReponseLogin})
                    },(erreur)=>{
                        res.json({Error: true, ErrorMsg: "Error on logoin to worker: " + erreur, Data: null})
                    })
                } else {
                    res.json({Error: true, ErrorMsg: 'Object "pass" is missing in {"login": "string", "pass": "string"}', Data: null})
                }
            } else {
                res.json({Error: true, ErrorMsg: 'Object "login" is missing in {"login": "string", "pass": "string"}', Data: null})
            }
        } catch(e) {
            res.json({Error: true, ErrorMsg: "JSON Parse error: " + e + ' in {"login": "string", "pass": "string"}', Data: null})
        }
    }

    Login(Data){
        return new Promise((resolve, reject)=>{
            if (this._CoreX != null){
                const axios = require('axios')
                axios.post(this._CoreX.WorkerAdress + this._CoreX.LoginApi, {Site:"App", Login:Data.login, Pass:Data.pass}).then(res => {
                    if (res.data.Error){
                        reject(res.data.ErrorMsg)
                    } else {
                        this._LoginToken = res.data.Token
                        resolve("Login Done")
                    }
                }).catch(error => {
                    reject(error)
                })
            } else {
                reject("No CoreX Worker defined")
            }
        })
    }

    /**
     * Ping du workerr
     * @param {res} res res
     */
    ApiPingWorker(res){
        this.PingWorker().then((reponse)=>{
            let ReponseTestbutton = new Object()
            ReponseTestbutton. ApiVersion = "1.0"
            ReponseTestbutton.info = reponse
            res.json({Error: false, ErrorMsg: "no error", Data: ReponseTestbutton})
        },(erreur)=>{
            res.json({Error: true, ErrorMsg: "Error on Ping Worker: " + erreur, Data: null})
        })
    }

    PingWorker(){
        return new Promise((resolve, reject)=>{
            if (this._CoreX != null){
                const axios = require('axios')
                axios.post(this._CoreX.WorkerAdress + this._CoreX.WorkerApi, {Token:this._LoginToken, FctName:"Worker", FctData:{Fct:"Ping"}}).then(res => {
                    if (res.data.Error){
                        reject(res.data.ErrorMsg)
                    } else {
                        resolve(res.data.Data)
                    }
                }).catch(error => {
                    reject(error)
                })
            } else {
                reject("No CoreX Worker defined")
            }
        })
    }


 }
 module.exports.RpiGpioServer = RpiGpioServer