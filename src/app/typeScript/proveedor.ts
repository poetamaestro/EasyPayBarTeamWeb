import { Afiliado } from './afiliado';
import { Categoria } from './categoria';

export class Proveedor {
	afiliados: Array<Afiliado>;
	bar: string;
	categoria: Array<Categoria>;
	codigoQR: string;
	imagen: string;
	imagenURL: string;
	nombre: string;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}