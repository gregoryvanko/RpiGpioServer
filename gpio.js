var EventEmitter = require('events').EventEmitter;

class GPIO extends EventEmitter{
	constructor({DebugGPIO = false} = {}){
		super()
		this._Debug = DebugGPIO

		this._Const_RelayStatus_On = 1
		this._Const_RelayStatus_Off = 0

		this._EmitOn_Button_Rising = "Button_Rising"

        this._PinRelay1 = 2
        
        //this._PinButton = 17
        
        this._Relay1 =""
        
        //this._Button=""
        
        var Gpio = require('onoff').Gpio
        this._Relay1 = new Gpio(this._PinRelay1, 'high', 'none', {activeLow: true})
        
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
		this.Log("unexport on close")
		this._Relay1.writeSync(0)
		this._Relay1.unexport()
		//this._Button.unexport()
		process.exit()
	}

	GetRelayStatus(){
		return this._Relay1.readSync()
	}

	SetRelayStatus(status, Callback = ""){
		this.Log("SetRelayStatus: " + status)
		if ((status == this._Const_RelayStatus_On) || (status == this._Const_RelayStatus_Off)){
			this._Relay1.writeSync(status);
			Callback();
		} else {
			this.Log("Le Status est inconnu: " + status);
		}
	}
}


module.exports.GPIO = GPIO;