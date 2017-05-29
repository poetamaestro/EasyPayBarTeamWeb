import { DetalleCompra } from "./detalleCompra";

export class Compra {
	
	key: number;
	detalleCompra: Array<DetalleCompra>;
	fecha_Compra: Date;
	total: number;
	
	constructor(){
		this.key = 0;
	}
}