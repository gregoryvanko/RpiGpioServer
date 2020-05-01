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
            res.send(me.GetInitialHTML())
        })
        // Api
        this._Express.post('/api', function(req, res, next){
            switch (req.body.FctName) {
                case "SetGpio":
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
    /* Generation du fichier HTML de base */
	GetInitialHTML(){
        let fs = require('fs')
        let os = require('os')

        let HTMLStart =`
<!doctype html>
<html>
    <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="RpiGpioServer">
        <link rel="apple-touch-icon" href="apple-icon.png">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>RpiGpioServer</title>
        <style>
            :root {
                --CoreX-color: rgb(20, 163, 255);
                --CoreX-font-size : 1.5vw;
                --CoreX-Iphone-font-size : 3vw;
                --CoreX-Max-font-size : 18px;
                --CoreX-Titrefont-size : 4vw;
                --CoreX-TitreIphone-font-size : 7vw;
                --CoreX-TitreMax-font-size : 50px;
            }
            body{
                margin: 0;
                padding: 0;
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none; 
                -webkit-user-select: none;   
                -khtml-user-select: none;    
                -moz-user-select: none;      
                -ms-user-select: none;      
                user-select: none;  
                cursor: default;
                font-family: 'Myriad Set Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-synthesis: none;
                letter-spacing: normal;
                text-rendering: optimizelegibility;
                width: 100%;
                height: 100%;
            }
        </style>` 
        
        let HTML1 = `<script>`
        let GlobalCallApiPromise = `
            function GlobalCallApiPromise(FctName, FctData, UploadProgress, DownloadProgress){
                return new Promise((resolve, reject)=>{
                    var xhttp = new XMLHttpRequest()
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            let reponse = JSON.parse(this.responseText)
                            if (reponse.Error) {
                                console.log('GlobalCallApiPromise Error : ' + reponse.ErrorMsg)
                                reject(reponse.ErrorMsg)
                            } else {
                                resolve(reponse.Data) 
                            }
                        } else if (this.readyState == 4 && this.status != 200){
                            reject(this.response)
                        }
                    }
                    xhttp.onprogress = function (event) {
                        if(DownloadProgress){DownloadProgress(event)}
                        //console.log("Download => Loaded: " + event.loaded + " Total: " +event.total)
                    }
                    xhttp.upload.onprogress= function (event){
                        if(UploadProgress){UploadProgress(event)}
                        //console.log("Upload => Loaded: " + event.loaded + " Total: " + event.total)
                    }
                    xhttp.open("POST", "api" , true)
                    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
                    xhttp.send(JSON.stringify({FctName:FctName, FctData:FctData}))
                })
            }`
            
        let HTML2 = `</script>`
        let HTMLEnd = ` 
    </head>
    <body>
    coucou
    </body>
</html>`
        return HTMLStart + HTML1 + os.EOL + GlobalCallApiPromise + os.EOL + HTML2 + HTMLEnd
    }

    /**
     * Actionne un GPIO
     * @param {object} Data Object contenant la commande a realiser
     * @param {res} res res
     */
    SetGpio(Data, res){
        res.json({Error: false, ErrorMsg: "No error", Data: Data})
    }
 }
 module.exports.RpiGpioServer = RpiGpioServer