import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Afiliado } from './../typeScript/afiliado';
import * as firebase from 'firebase';

@Injectable()
export class AfiliadoService {

afiliados: FirebaseListObservable<Afiliado[]>;
afiliado: Afiliado = new Afiliado();

  constructor(private db: AngularFireDatabase) {  }

  getAfiliados( id): FirebaseListObservable<Afiliado[]> {
    return this.db.list('/proveedor/' + id + '/afiliados');
  }
  ActualizarSaldo(id: number , saldo: string , idAfiliado: number) {
    const consultaAfiliadoId = this.db.object('/proveedor/' + id + '/afiliados/' + idAfiliado);
    consultaAfiliadoId.update({ saldo: saldo });
  }
  agregarAfiliado(nuevoAfiliado: Afiliado, id) {
    firebase.database().ref('/proveedor/' + id + '/afiliados/' + nuevoAfiliado.codigoQR).set({
      fechaAfiliacion: nuevoAfiliado.fechaAfiliacion,
      key: nuevoAfiliado.codigoQR,
      nombre: nuevoAfiliado.nombre,
      saldo: nuevoAfiliado.saldo,
    });
  }
}
