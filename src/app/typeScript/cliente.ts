export class Cliente {

	key: string;
	codigoQR: string;
	estado: boolean;
	fecha_Afiliacion: string;
	fecha_Nacimiento: Date;
	nombre: string;
	proveedor: boolean;
	admin: boolean;
	saldo: number;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
