import { Compra } from './../typeScript/compra';
import { Afiliado } from './../typeScript/afiliado';
import { ProveedorService } from './../service/proveedor.service';
import { Proveedor } from './../typeScript/proveedor';
import { FirebaseListObservable } from 'angularfire2';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import 'rxjs/Rx';

@Component({
  selector: 'app-perfil-bar',
  templateUrl: './perfil-bar.component.html',
  styleUrls: ['./perfil-bar.component.css'],
  providers: [ProveedorService]
})

export class PerfilBarComponent implements OnInit, OnDestroy {
  // Variables de la interfaz
  titulo = 'Perfil del bar';
  private editandoBarNombre: boolean;
  private editandoBarImagen: boolean;

  // Variables para gestionar el perfil del bar
  private id;
  private sub: any;
  objectProveedor: FirebaseListObservable<Proveedor[]>;
  proveedor: Proveedor;
  objectAfiliados: FirebaseListObservable<Afiliado[]>;
  listAfiliados: Afiliado[];
  comprasRealizadas: any;

  // Variables para la imagen
  private file: File;

  constructor(private proveedorServicio: ProveedorService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.editandoBarNombre = false;
    this.editandoBarImagen = false;
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    this.getProveedor();
    this.getAfiliados();
    this.getCompras();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getProveedor() {
    this.objectProveedor = this.proveedorServicio.getById(this.id);
    this.objectProveedor.subscribe(item => {
      this.proveedor = item[0];
    });
  }

  getAfiliados() {
    this.objectAfiliados = this.proveedorServicio.getAfiliadosById(this.id);
    this.objectAfiliados.subscribe(item => {
      this.listAfiliados = item;
      console.log(this.listAfiliados);
      this.listAfiliados.forEach(afiliado => {
        if (afiliado.compras != undefined) {
          console.log(afiliado.compras);
        }
      });
    });
  }

  getCompras() {

  }

  seleccionarImagen(event: EventTarget) {
    const eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    const target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    this.file = target.files[0];
  }

  borrarImagen(imagenPath: string) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(imagenPath);

    imageRef.delete().then(function () {
      console.log('File deleted successfully');
    }).catch(function (error) {
      console.log('Uh-oh, an error occurred!');
    });
  }

  cambiarNombreBar() {
    this.proveedorServicio.cambiarBar(this.id, this.proveedor.bar);
    this.finalizarEditadoNombreBar();
  }

  cambiarImagenBar() {
    // Si la imagen no es la default se borra la imagen del proveedor
    if (this.proveedor.imagen !== 'productos/bar_logo_default.jpg') {
      this.borrarImagen(this.proveedor.imagen);
    }

    // Actualizar proveedor con imagen default
    if (this.file === undefined) {
      const imagenPath = 'productos/bar_logo_default.jpg';
      const imagenURL = 'https://firebasestorage.googleapis.com/v0/b/easypaybar.appspot.com/o'+
      '/proveedor%2Fbar_logo_default.jpg?alt=media&token=35c21f14-79bf-43e3-ae46-1b63912f006e';
      this.proveedorServicio.cambiarImagen(this.id, imagenPath, imagenURL);
    } else {  // Subir proveedor con imagen seleccionada
      // Subir la nueva imagen
      const imagenName = 'proveedor/' + this.file.name
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child('proveedor/' + this.file.name);
      const pathRef = firebase.storage().ref('proveedor/' + this.file.name);
      const uploadTask = imageRef.put(this.file);

      uploadTask.then((snapshot) => {
        pathRef.getDownloadURL().then(url =>
          this.proveedorServicio.cambiarImagen(this.id, imagenName, url)
        );
      });
    }
    this.finalizarEditadoImagenBar();
  }

  editarNombreBar() {
    this.editandoBarNombre = true;
  }

  editarImagenBar() {
    this.editandoBarImagen = true;
  }

  finalizarEditadoNombreBar() {
    this.editandoBarNombre = false;
  }

  finalizarEditadoImagenBar() {
    this.editandoBarImagen = false;
  }
}