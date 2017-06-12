import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Producto } from './../typeScript/producto';

@Injectable()
export class ProductoService {

  constructor(private db: AngularFireDatabase) { }

  getProductos(idPro: string, idCat: string): FirebaseListObservable<Producto[]> {
    return this.db.list('/proveedor/' + idPro + '/categoria/' + idCat + '/producto');
  }

  agregarProducto(idPro: string, idCat: string, imagenFile: File, URL: string, nuevoProducto: Producto) {
    nuevoProducto.imagen = 'productos/' + imagenFile.name;
    nuevoProducto.imagenURL = URL;
    nuevoProducto.veces = 0;
    this.db.list('/proveedor/' + idPro + '/categoria/' + idCat + '/producto').push(nuevoProducto);
  }

  agregarProductoDefault(idPro: string, idCat: string, imagenPath: string, URL: string, nuevoProducto: Producto) {
    nuevoProducto.imagen = imagenPath;
    nuevoProducto.imagenURL = URL;
    nuevoProducto.veces = 0;
    this.db.list('/proveedor/' + idPro + '/categoria/' + idCat + '/producto').push(nuevoProducto);
  }

  eliminarProducto(idPro: string, idCat: string, idProd) {
    this.db.object('/proveedor/' + idPro + '/categoria/' + idCat + '/producto/' + idProd).remove();
  }

  actualizarProducto(idPro: string, idCat: string, idProd: string, producto: Producto, imagenFile: File, URL: string) {
    producto.imagen = 'productos/' + imagenFile.name;
    producto.imagenURL = URL;
    this.db.object('/proveedor/' + idPro + '/categoria/' + idCat + '/producto/' + idProd).update(producto);
  }

  actualizarProductoDefault(idPro: string, idCat: string, idProd: string, producto: Producto, imagenPath: string, URL: string) {
    producto.imagen = imagenPath;
    producto.imagenURL = URL;
    this.db.object('/proveedor/' + idPro + '/categoria/' + idCat + '/producto/' + idProd).update(producto);
  }

  actualizarVecesCompradas(idPro: string, idCat: string, idProd: string, veces: number) {
    this.db.object('/proveedor/' + idPro + '/categoria/' + idCat + '/producto/' + idProd).update({ veces: veces });
  }
}
