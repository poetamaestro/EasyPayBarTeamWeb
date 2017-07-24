import { Comentario } from './comentario';

export class Producto {
	key: string;
	comentario: Array<Comentario>;
	nombre: string;
	precio: number;
	veces: number;
	imagen: string;
	imagenURL: string;
	comentar: boolean;

	constructor() { }
}