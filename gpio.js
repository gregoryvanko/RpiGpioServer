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
	}

	get Const_RelayStatus_On(){return this._Const_RelayStatus_On;}
	get Const_RelayStatus_Off(){return this._Const_RelayStatus_Off;}
	get EmitOn_Button_Rising(){return this._EmitOn_Button_Rising;}

	SetConfig(Config){
		this._Config = Config
		this.UnexportGpio()
		this._ListOfRelais = []
		this._ListOfButtons = []
		Config.forEach(element => {
			let MyObject = new Object()
			if(typeof element.name != "undefined"){
				MyObject.Name = element.name
				if(element.type == "Relais"){
					if(typeof element.timeout != "undefined"){
						MyObject.TimeOutValue = parseInt(element.timeout)
					} else {
						MyObject.TimeOutValue = null
					}
					MyObject.TimeOut = null
					if(process.env.NODE_ENV != 'dev') {
						var Gpio = require('onoff').Gpio
						let Myactivelow = null
						if (element.activelow == "true"){Myactivelow = true} 
                    	else {Myactivelow = false}
						//MyObject.Relais = new Gpio(element.pin, element.status, 'none', {activeLow: element.activelow})
						MyObject.Relais = new Gpio(element.pin, element.status, 'none', {activeLow: Myactivelow})
					} else {
						MyObject.Relais = "GPIO Object Relais"
					}
					this._ListOfRelais.push(MyObject)
				} else if (element.type == "Button"){
					if(process.env.NODE_ENV === 'dev') {
						MyObject.Button = "GPIO Object Button"
					} else {
						var Gpio = require('onoff').Gpio
						MyObject.Button = new Gpio(element.pin, 'in' , element.status, {debounceTimeout: element.debouncetimeout})
						var me = this
						MyObject.Button.watch(function (err, value){
							if (err) {console.error('There was an error on GPIO: ', err)}
							else {me.emit(me._EmitOn_Button_Rising, element.name)}
						})
					}
					this._ListOfButtons.push(MyObject)
				}
			} else {
				console.log("Error : name not found in Config")
			}
		})
	}

	GetConfig(){
		return this._Config
	}

	UnexportGpio(){
		if(process.env.NODE_ENV != 'dev') {
			this._ListOfButtons.forEach(element => {
				element.Button.unexport(0)
			})
			this._ListOfRelais.forEach(element => {
				element.Relais.writeSync(0)
				element.Relais.unexport(0)
			})
		}
	}

	Close(){
		this.UnexportGpio()
		process.exit()
	}

	SetRelayStatus(Name, Status){
		return new Promise((resolve, reject)=>{
			let ObjectRelais = null
			// On cherche le relais dans la liste des relais
			this._ListOfRelais.forEach(element => {
				if(element.Name == Name){
					ObjectRelais = element
				}
			})
			// Si le relais est trouvé
			if (ObjectRelais != null){
				if ((Status == this._Const_RelayStatus_On) || (Status == this._Const_RelayStatus_Off)){
					if(process.env.NODE_ENV != 'dev'){
						ObjectRelais.Relais.writeSync(Status)
					}
					if (Status == this._Const_RelayStatus_On){
						ObjectRelais.TimeOut = setTimeout(()=>{ this.SetRelayStatus(Name, this._Const_RelayStatus_Off)}, (ObjectRelais.TimeOutValue * 1000 * 60))
					} else {
						if (ObjectRelais.TimeOut != null){
							clearTimeout(ObjectRelais.TimeOut)
							ObjectRelais.TimeOut = null
						}
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

	GetRelayStatus(Name){
		return new Promise((resolve, reject)=>{
			let ObjectRelais = null
			// On cherche le relais dans la liste des relais
			this._ListOfRelais.forEach(element => {
				if(element.Name == Name){
					ObjectRelais = element
				}
			})
			// Si le relais est trouvé
			if (ObjectRelais != null){
				if(process.env.NODE_ENV != 'dev'){
					resolve(ObjectRelais.Relais.readSync())
				} else {
					resolve("DevVal=1")
				}
			} else {
				reject('GetRelayStatus error: Relais "'+ Name + '" not found')
			}
		})
	}
}


module.exports.GPIO = GPIO;