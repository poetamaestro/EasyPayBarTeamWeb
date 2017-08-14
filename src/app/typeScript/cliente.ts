export class Cliente {

	admin: boolean;
	codigoQR: string;
	estado: boolean;
	fecha_Afiliacion: string;
	nombre: string;
	proveedor: boolean;
	ping: string;
	pingTemporal: string;


	key: string;
	fecha_Nacimiento: Date;
	saldo: number;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
