import { DetalleCompra } from "./detalleCompra";

export class Compra {
	key: string;
	detalleCompra: Array<DetalleCompra>;
	fecha_Compra: string;
	total: number;
	
	constructor() { }
}