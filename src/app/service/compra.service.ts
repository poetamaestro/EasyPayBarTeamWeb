import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Compra } from './../typeScript/compra';

@Injectable()
export class CompraService {
	
	compra: Compra = new Compra();
	compras: FirebaseListObservable<Compra[]>;

	constructor(private db: AngularFireDatabase) { }

  	getCompras(idProveedor, idAfiliado): FirebaseListObservable<Compra[]> {
  		return this.db.list('/proveedor/' + idProveedor + '/afiliados/' + idAfiliado);
  	}

  	agregar(idProveedor, idAfiliado, nuevaCompra: Compra) {
  		this.db.list('/proveedor/' + idProveedor + '/afiliados/' + idAfiliado).push(nuevaCompra);
  	}

}