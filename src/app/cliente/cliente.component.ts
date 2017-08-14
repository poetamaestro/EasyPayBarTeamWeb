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

        const imagenPath = 'productos/producto_default.jpg';
        const imagenURL = 'https://firebasestorage.googleapis.com/v0/b/easypaybar.appspot.com/o/' +
        'productos%2Fproducto_default.jpg?alt=media&token=07c0c51e-b277-4c0a-b739-ce79af920ee6';
        this.proveedorServicio.crear(this.cliente.nombre, 
          this.cliente.codigoQR, this.proveedor.bar, imagenPath, imagenURL);

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
        if (queriedItems[0].imagen != "productos/producto_default.jpg") {
          this.borrarImagen(queriedItems[0].imagen);
        }
        
        // Borrar proveedor
        this.proveedorServicio.remover(queriedItems[0].$key);
      }
    });
  }

  modalProveedor(id: string, cli: Cliente) {
    this.proveedor.bar = "";
    this.cliente.key = id;
    this.cliente.nombre = cli.nombre;
    this.cliente.codigoQR = cli.codigoQR;
    this.modalToProveedor.open();
  }

  modalCliente(id: string, cli: Cliente) {
    this.cliente.key = id;
    this.cliente.nombre = cli.nombre;
    this.cliente.codigoQR = cli.codigoQR;
    this.modalToCliente.open();
  }

}
