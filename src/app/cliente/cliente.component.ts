import { Component, OnInit, ViewChild } from '@angular/core';
import { ClienteService } from '../service/cliente.service';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2';
import { Cliente } from './../typeScript/cliente';
import { Proveedor } from './../typeScript/proveedor';
import { ProveedorService } from '../service/proveedor.service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import 'rxjs/Rx';
import * as firebase from 'firebase';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css'],
  providers: [ClienteService, ProveedorService]
})
export class ClienteComponent implements OnInit {

  //  Variables de la interfaz
  titulo = 'Registro de Clientes';
  mensajeError: string;

  @ViewChild('modalToProveedor')
  modalToProveedor: ModalComponent;

  @ViewChild('modalToCliente')
  modalToCliente: ModalComponent;

  @ViewChild('modalMensaje')
  modalMensaje: ModalComponent;

  // Variables para la imagen
  file: File;

  // Variables para gestionar clientes
  clientes: FirebaseListObservable<Cliente[]>;
  cliente: Cliente = new Cliente();

  // Variable para gestionar proveedor
  proveedor: Proveedor = new Proveedor();

  datosCargados: boolean;

  constructor(private clienteServicio: ClienteService, private proveedorServicio: ProveedorService, 
    private db: AngularFireDatabase) {
    this.datosCargados = true;

    this.clientes = this.clienteServicio.getClientes();

    this.clientes.subscribe(data => {
        this.datosCargados = false;
    });
  }

  getClientes(): void {
    this.clientes = this.clienteServicio.getClientes();
  }

  ngOnInit() {
    this.getClientes();
  }

  seleccionarImagen(event: EventTarget) {
    const eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    const target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    this.file = target.files[0];
  }

  borrarImagen(imagenPath: string) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(imagenPath);

    imageRef.delete().then(function() {
      console.log('File deleted successfully');
    }).catch(function(error) {
      console.log('Uh-oh, an error occurred!');
    });
  }

  promoverProveedor(): void {
    const queryObservable = this.db.list('/proveedor', {
      query: {
        orderByChild: 'codigoQR',
        equalTo: this.cliente.codigoQR
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if (queriedItems.length === 0) {
        this.clienteServicio.promoverProveedor(this.cliente.key);

        // Subir imagen
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child('proveedor/' + this.file.name);
        const pathRef = firebase.storage().ref('proveedor/' + this.file.name);
        const uploadTask = imageRef.put(this.file);

        uploadTask.then((snapshot) => {
          pathRef.getDownloadURL().then(url =>
            // Crear proveedor
            this.proveedorServicio.crear(this.cliente.nombre, this.cliente.codigoQR, this.proveedor.bar, this.file, url)
          );
        });

      } else {
        this.mensajeError = 'Este usuario ya esta promovido como Proveedor.';
        this.modalMensaje.open();
      }
    });
  }

  promoverCliente() {
    const queryObservable = this.db.list('/proveedor', {
      query: {
        orderByChild: 'codigoQR',
        equalTo: this.cliente.codigoQR
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if (queriedItems.length > 0) {
        this.clienteServicio.promoverCliente(this.cliente.key);

        // Borrar imagen
        this.borrarImagen(queriedItems[0].imagen);
        // Borrar proveedor
        this.proveedorServicio.remover(queriedItems[0].$key);
      }
    });
  }

  modalProveedor(id: number, nom: string, codQR: string) {
    this.cliente.key = id;
    this.cliente.nombre = nom;
    this.cliente.codigoQR = codQR;
    this.modalToProveedor.open();
  }

  modalCliente(id: number, nom: string, codQR: string) {
    this.cliente.key = id;
    this.cliente.nombre = nom;
    this.cliente.codigoQR = codQR;
    this.modalToCliente.open();
  }

}
