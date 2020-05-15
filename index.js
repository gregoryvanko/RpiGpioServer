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
                case "getgpio":
                    me.ApiGetGpio(req.body.FctData, res)
                    break
                case "ping":
                    res.json({Error: false, ErrorMsg:"No error",Data: "pong"})
                    break
                case "setconfig":
                    me.ApiSetConfig(req.body.FctData, res)
                    break
                case "getconfig":
                    me.ApiGetConfig(res)
                    break
                case "getstatus":
                    me.ApiGetStatus(res)
                    break
                case "restart":
                    me.ApiRestart(res)
                    break
                default:
                    res.json({Error: true, ErrorMsg:"No API for FctName: " + req.body.FctName})
                    break
            }
        })
        // Config
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
                case "getworkerconfig":
                    me.ApiGetWorkerConfig(res)
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
                    this.GetWorkerConfig().then((reponseGetWorkerConfig)=>{
                        this._Config = reponseGetWorkerConfig
                        this._MyGPIO.SetConfig(this._Config)
                        console.log("Loged to the worker and config set")
                    },(erreur)=>{
                        console.log("Error on GetWorkerConfig: " + erreur)
                    })
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
                        ReponseSetGpio.ApiVersion = "1.0"
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
     * Statu un GPIO
     * @param {object} Data Object contenant la commande a realiser
     * @param {res} res res
     */
    ApiGetGpio(Data, res){
        try {
            let InputData = JSON.parse(Data)
            if(typeof InputData.name != "undefined"){
                this._MyGPIO.GetRelayStatus(InputData.name).then((reponse)=>{
                    let Reponse = new Object()
                    Reponse.ApiVersion = "1.0"
                    Reponse.Name = InputData.name
                    Reponse.value = reponse
                    res.json({Error: false, ErrorMsg: "no error", Data: Reponse})
                },(erreur)=>{
                    res.json({Error: true, ErrorMsg: "Error on GetGpio: " + erreur, Data: null})
                })
            } else {
                res.json({Error: true, ErrorMsg: 'Object "name" is missing in {"name": "string"}', Data: null})
            }
        } catch(e) {
            res.json({Error: true, ErrorMsg: "JSON Parse error: " + e + ' in {"name": "string"}', Data: null})
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
                    ReponseTestbutton.ApiVersion = "1.0"
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

    /** Bouton pressed */
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
     * Login sur le worker via API
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
                        ReponseLogin.ApiVersion = "1.0"
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

    /** Login sur le worker */
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
     * Ping du worker via Api
     * @param {res} res res
     */
    ApiPingWorker(res){
        this.PingWorker().then((reponse)=>{
            let ReponseTestbutton = new Object()
            ReponseTestbutton.ApiVersion = "1.0"
            ReponseTestbutton.info = reponse
            res.json({Error: false, ErrorMsg: "no error", Data: ReponseTestbutton})
        },(erreur)=>{
            res.json({Error: true, ErrorMsg: "Error on Ping Worker: " + erreur, Data: null})
        })
    }

    /** Ping du worker */
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

    /**
     * GetWorkerConfig via Api
     * @param {res} res res
     */
    ApiGetWorkerConfig(res){
        this.GetWorkerConfig().then((reponse)=>{
            this._Config = reponse
            this._MyGPIO.SetConfig(this._Config)
            let Reponse = new Object()
            Reponse.ApiVersion = "1.0"
            Reponse.WorkerConfig = reponse
            res.json({Error: false, ErrorMsg: "no error", Data: Reponse})
        },(erreur)=>{
            res.json({Error: true, ErrorMsg: "Error on GetWorkerConfig: " + erreur, Data: null})
        })
    }

    /**
     * Get Worker Config via Api
     * @param {res} res res
     */
    GetWorkerConfig(res){
        return new Promise((resolve, reject)=>{
            if (this._LoginToken != null){
                const axios = require('axios')
                axios.post(this._CoreX.WorkerAdress + this._CoreX.WorkerApi, {Token:this._LoginToken, FctName:"Worker", FctData:{Fct:"GetConfig"}}).then(res => {
                    if (res.data.Error){
                        reject(res.data.ErrorMsg)
                    } else {
                        resolve(res.data.Data)
                    }
                }).catch(error => {
                    reject(error)
                })
            } else {
                reject("Not logged into the Worker")
            }
        })
    }

    /**
     * Set config GPIO via API
     * @param {object} Data Object contenant la commande a realiser
     * @param {res} res res
     */
    ApiSetConfig(Data, res){
        try {
            let InputData = JSON.parse(Data)
            if(typeof InputData.config != "undefined"){
                if (Array.isArray(InputData.config)){
                    this._Config = InputData.config
                    this._MyGPIO.SetConfig(this._Config)

                    let ReponseSetConfig = new Object()
                    ReponseSetConfig.ApiVersion = "1.0"
                    ReponseSetConfig.Txt = "Config valided"
                    res.json({Error: false, ErrorMsg: "Error ApiSetConfig", Data: ReponseSetConfig})
                } else {
                    res.json({Error: true, ErrorMsg: "Config value is not a Array", Data: null})
                }
            } else {
                res.json({Error: true, ErrorMsg: 'Object "config" is missing in {"config": Array}', Data: null})
            }
        } catch(e) {
            res.json({Error: true, ErrorMsg: "JSON Parse error: " + e + ' in {"config": Array}', Data: null})
        }
    }

    /**
     * Get config GPIO via API
     * @param {res} res res
     */
    ApiGetConfig(res){
        let ReponseSetConfig = new Object()
        ReponseSetConfig.ApiVersion = "1.0"
        ReponseSetConfig.Config = this._MyGPIO.GetConfig()
        res.json({Error: false, ErrorMsg: "Error ApiSetConfig", Data: ReponseSetConfig})
    }

    /**
     * Get satu of RpiGpioServer
     * @param {res} res res
     */
    ApiGetStatus(res){
        let Reponse = new Object()
        Reponse.ApiVersion = "1.0"
        // Login statu
        if (this._LoginToken != null){Reponse.Login = true}
        else {Reponse.Login = false}
        // Config
        Reponse.Config = this._MyGPIO.GetConfig()
        // Ping Worker
        this.PingWorker().then((reponse)=>{
            Reponse.PingWorker = reponse
            res.json({Error: false, ErrorMsg: "Error ApiGetStatus", Data: Reponse})
        },(erreur)=>{
            Reponse.PingWorker = "Error on Ping Worker: " + erreur
            res.json({Error: false, ErrorMsg: "Error ApiGetStatus", Data: Reponse})
        })
    }

    /**
     * Restart RpiGpioServer
     * @param {res} res res
     */
    ApiRestart(res){
        let Reponse = new Object()
        Reponse.ApiVersion = "1.0"
        if(process.env.NODE_ENV != 'dev'){
            const exec = require('child_process').exec
            const cmd = 'reboot'
            exec(cmd, function (error, stdout, stderr) {
                if (error) {
                    res.json({Error: false, ErrorMsg: "Error lors du restart", Data: null})
                } else {
                    Reponse.Value = "Restart"
                    res.json({Error: false, ErrorMsg: "Error ApiRestart", Data: Reponse})
                }
            })
        } else {
            Reponse.Value = "Restart"
            res.json({Error: false, ErrorMsg: "Error ApiRestart", Data: Reponse})
        }
    }
 }
 module.exports.RpiGpioServer = RpiGpioServer