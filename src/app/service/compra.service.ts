import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Compra } from './../typeScript/compra';
import { DetalleCompra } from "./../typeScript/detalleCompra";

@Injectable()
export class CompraService {
  
  compra: Compra = new Compra();
  compras: FirebaseListObservable<Compra[]>;

  constructor(private db: AngularFireDatabase) { }

    getCompras(idProveedor, idAfiliado): FirebaseListObservable<Compra[]> {
      return this.db.list('/proveedor/' + idProveedor + '/afiliados/' + idAfiliado + '/compras');
    }

    agregar(idProveedor, idAfiliado, detalle: Array<DetalleCompra>, nuevaCompra: Compra) {
      nuevaCompra.detalleCompra = detalle;
      this.db.list('/proveedor/' + idProveedor + '/afiliados/' + idAfiliado + '/compras').push(nuevaCompra);
    }

}