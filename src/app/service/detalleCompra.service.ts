import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { DetalleCompra } from './../typeScript/detalleCompra';

@Injectable()
export class DetalleCompraService {

  detalleCompra : FirebaseListObservable<DetalleCompra[]>;

  constructor(private db: AngularFireDatabase) { }

  getDetalleCompras(idProveedor, idAfiliado, idCompra, idDetalle): FirebaseListObservable<DetalleCompra[]> {
  	return this.db.list('/proveedor/' + idProveedor + '/afiliados/' + idAfiliado + '/compras/'
  		+ idCompra + '/detalleCompra/' + idDetalle);
  }

  agregarDetalleCompra(nuevoDetalleCompra: DetalleCompra){
  	this.detalleCompra.push(nuevoDetalleCompra);
  }

}