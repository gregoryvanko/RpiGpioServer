var EventEmitter = require('events').EventEmitter;

class GPIO extends EventEmitter{
	constructor(DebugGPIO = false, Config= []){
		super()
		this._Debug = DebugGPIO
		this._Config = Config

		this._Const_RelayStatus_On = 1
		this._Const_RelayStatus_Off = 0
		this._EmitOn_Button_Rising = "Button_Rising"

        //this._PinRelay1 = 2
        //this._PinButton = 14
        //this._Relay1 =""
		//this._Button=""
		
		this._ListOfRelais = []
        
        var Gpio = require('onoff').Gpio
		//this._Relay1 = new Gpio(this._PinRelay1, 'high', 'none', {activeLow: true})
		this._Config.forEach(element => {
			if(element.type == "Relais"){
				let ObjectRelais = new Object()
				ObjectRelais.Name = element.name
				ObjectRelais.Relais = new Gpio(element.pin, element.statu, 'none', {activeLow: element.activeLow})
				this._ListOfRelais.push(ObjectRelais)
			}
		})
        
		// this._Button = new Gpio(this._PinButton, 'in', 'rising')
		// var me = this
		// this._Button.watch(function (err, value){
		// 	me.Log("Button is rising")
		// 	if (err) {
		// 		console.error('There was an error on GPIO: ', err)
		// 	} else {
		// 		me.emit(me._EmitOn_Button_Rising, "Rising")
		// 	}
		// })
	}

	get Const_RelayStatus_On(){return this._Const_RelayStatus_On;}
	get Const_RelayStatus_Off(){return this._Const_RelayStatus_Off;}
	get EmitOn_Button_Rising(){return this._EmitOn_Button_Rising;}

	Log(data) {
		if (this._Debug) {
			console.log(data);
		}
	}

	UnexportOnClose(){
		//this._Relay1.writeSync(0)
		//this._Relay1.unexport()
		//this._Button.unexport()
		this._ListOfRelais.forEach(element => {
			element.Relais.writeSync(0)
			element.Relais.unexport(0)
		})
		process.exit()
	}

	GetRelayStatus(Name){
		//return this._Relay1.readSync()
	}

	SetRelayStatus(Name, Status, Callback = ""){
		this.Log("SetRelayStatus " + Name + " " + Status)
		let Relais = null
		this._ListOfRelais.forEach(element => {
			if(element.Name == Name){
				Relais = element.Relais
			}
		})
		if (Relais != null){
			if ((Status == this._Const_RelayStatus_On) || (Status == this._Const_RelayStatus_Off)){
				Relais.writeSync(Status)
				Callback()
			} else {
				this.Log("Le Status est inconnu: " + Status);
			}
		}
	}
}


module.exports.GPIO = GPIO;