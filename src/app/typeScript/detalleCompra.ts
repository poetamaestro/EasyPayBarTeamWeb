import { Producto } from './producto';

export class DetalleCompra {
	key: number;
	cantidad: number;
	precio: number;
	productos: Array<Producto>;

	constructor() { }
}