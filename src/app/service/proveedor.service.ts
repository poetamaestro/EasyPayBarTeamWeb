import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Proveedor } from './../typeScript/proveedor';
import { Categoria } from './../typeScript/categoria';
import { Afiliado } from './../typeScript/afiliado';
import * as firebase from 'firebase';

@Injectable()
export class ProveedorService {

  proveedores: FirebaseListObservable<Proveedor[]>;
  proveedor: Proveedor = new Proveedor();

  constructor(private db: AngularFireDatabase) {
    this.proveedores = db.list('/proveedor');
  }

  crear(nom: string, codQR: string, nombreBar: string, imagenFile: File, URL: string): void {
    firebase.database().ref('proveedor/' + codQR).set({
      bar: nombreBar,
      codigoQR: codQR,
      nombre: nom,
      imagen: 'proveedor/' + imagenFile.name,
      imagenURL: URL
    });
  }

  getProveedores(): FirebaseListObservable<Proveedor[]> {
    return this.db.list('/proveedor');
  }

  getById(ProveedorId: string): FirebaseListObservable<Proveedor[]> {
    return this.db.list('/proveedor', {
      query: {
        orderByChild: 'codigoQR',
        equalTo: ProveedorId
      }
    });
  }

  getAfiliadosById(ProveedorId: string): FirebaseListObservable<Afiliado[]>{
    return this.db.list('/proveedor/'+ProveedorId+'/afiliados',{
      query: {
        orderByChild: 'fechaAfiliacion'
      }
    });
  }

  agregar() {
    if (!this.proveedor.nombre) { }
    this.proveedores.push(this.proveedor);
  }

  remover(id: number) {
    this.db.object('/proveedor/' + id).remove();
  }
}
