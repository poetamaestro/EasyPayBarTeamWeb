import { Producto } from './producto';

export class Categoria {
	key: string;
    descripcion: string;
    nombre: string;
    producto: Array<Producto>;

    constructor() { }
}