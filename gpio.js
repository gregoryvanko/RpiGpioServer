var EventEmitter = require('events').EventEmitter;

class GPIO extends EventEmitter{
	constructor(Config= []){
		super()
		this._Config = Config

		this._Const_RelayStatus_On = 1
		this._Const_RelayStatus_Off = 0
		this._EmitOn_Button_Rising = "Button_Rising"
		
		this._ListOfRelais = []
		this._ListOfButtons = []
		
		this._Config.forEach(element => {
			let MyObject = new Object()
			MyObject.Name = element.name
			if(element.type == "Relais"){
				if(process.env.NODE_ENV === 'dev') {
					MyObject.Relais = "GPIO Object Relais"
				} else {
					var Gpio = require('onoff').Gpio
					MyObject.Relais = new Gpio(element.pin, element.statu, 'none', {activeLow: element.activeLow})
				}
				this._ListOfRelais.push(MyObject)
			} else if (element.type == "Button"){
				if(process.env.NODE_ENV === 'dev') {
					MyObject.Button = "GPIO Object Button"
				} else {
					var Gpio = require('onoff').Gpio
					MyObject.Button = new Gpio(element.pin, 'in' , element.statu, {debounceTimeout: element.debounceTimeout})
					var me = this
					MyObject.Button.watch(function (err, value){
						if (err) {console.error('There was an error on GPIO: ', err)}
						else {me.emit(me._EmitOn_Button_Rising, element.name)}
					})
				}
				this._ListOfButtons.push(MyObject)
			}
		})
	}

	get Const_RelayStatus_On(){return this._Const_RelayStatus_On;}
	get Const_RelayStatus_Off(){return this._Const_RelayStatus_Off;}
	get EmitOn_Button_Rising(){return this._EmitOn_Button_Rising;}

	UnexportOnClose(){
		if(process.env.NODE_ENV != 'dev') {
			this._ListOfButtons.forEach(element => {
				element.Button.unexport(0)
			})
			this._ListOfRelais.forEach(element => {
				element.Relais.writeSync(0)
				element.Relais.unexport(0)
			})
		}
		process.exit()
	}

	SetRelayStatus(Name, Status){
		return new Promise((resolve, reject)=>{
			let Relais = null
			// On cherche le relais dans la liste des relais
			this._ListOfRelais.forEach(element => {
				if(element.Name == Name){
					Relais = element.Relais
				}
			})
			// Si le relais est trouvé
			if (Relais != null){
				if ((Status == this._Const_RelayStatus_On) || (Status == this._Const_RelayStatus_Off)){
					if(process.env.NODE_ENV != 'dev'){
						Relais.writeSync(Status)
					}
					resolve()
				} else {
					reject('SetRelayStatus error: Le Status "'+ Status +'" est inconnu');
				}
			} else {
				reject('SetRelayStatus error: Relais "'+ Name + '" not found')
			}
		})
	}
}


module.exports.GPIO = GPIO;