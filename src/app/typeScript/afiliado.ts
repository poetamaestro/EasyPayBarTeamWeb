import { Compra } from "./compra";
import { Recarga } from "./recarga";

export class Afiliado{
	fechaAfiliacion: string;
	key: string;
	codigoQR: string;
	nombre: string;
	compras: Array<Compra>;
	recarga: Array<Recarga>;
	saldo: number;
	uid: string;
	constructor() { }
}
