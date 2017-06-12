import { Compra } from "./compra";
import { Recarga } from "./recarga";

export class Afiliado{
	key: string;
	codigoQR: string;
	compras: Array<Compra>;
	fechaAfiliacion: string;
	nombre: string;
	recargas: Array<Recarga>;
	saldo: number;
	uid: string;

	constructor() { }
}
