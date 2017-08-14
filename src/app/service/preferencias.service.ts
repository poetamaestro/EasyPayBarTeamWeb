import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Preferencias } from './../typeScript/preferencias';
import { Producto } from './../typeScript/producto';

@Injectable()
export class ProveedorPreferenciasService {

  producto: Producto = new Producto();
  preferencia: Preferencias = new Preferencias();

  constructor(private db: AngularFireDatabase) { }

  getPreferencias(idProveedor: string): FirebaseListObservable<Preferencias[]> {
  	return this.db.list('/proveedor/' + idProveedor + '/favoritos');
  }

  agregarPreferencias(idProveedor: string, nuevaPreferencias: Preferencias) {
  	this.db.list('/proveedor/' + idProveedor + '/favoritos').push(nuevaPreferencias);
  }

  eliminarPreferencias(idProveedor: string, idPreferencia: string) {
  	this.db.object('/proveedor/' + idProveedor + '/favoritos/' + idPreferencia).remove();
  }

  actualizarPreferencias(idProveedor: string, idPreferencia: string, preferencia: Preferencias) {
  	this.db.object('/proveedor/' + idProveedor + '/favoritos/' + idPreferencia).update(preferencia);
  }

  actualizarProductosFavoritos(idProveedor: string, idCategoria: string, productoId: string, 
    producto: Producto, imagenURL: string) {
    const queryObservable = this.db.list('/proveedor/' + idProveedor + '/favoritos', {
      query: {
        orderByChild: 'categoriaId'
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if(queriedItems.length > 0) {
        for (var i = 0; i < queriedItems.length; ++i) {
          if (idCategoria == queriedItems[i].categoriaId && productoId == queriedItems[i].productoId) {
            this.preferencia.precio = producto.precio;
            this.preferencia.imagenURL = imagenURL;
            this.preferencia.producto = producto.nombre; 
            this.actualizarPreferencias(idProveedor, queriedItems[i].$key, this.preferencia);
          }
        } 
      }
    }); 
  }

}