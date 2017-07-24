import { Component, OnInit, ViewChild } from '@angular/core';
import { Producto } from './../typeScript/producto';
import { ProductoService } from '../service/producto.service';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// tslint:disable-next-line:import-blacklist
import { Observable, Subject } from 'rxjs';
import * as firebase from 'firebase';

interface Image {
  path: string;
  filename: string;
  downloadURL?: string;
  $key?: string;
}

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css'],
  providers: [ProductoService]
})

export class ProductoComponent implements OnInit {

  // Variables de la interfaz
  @ViewChild('modalProductoVerDetalle')
  modalProductoVerDetalle: ModalComponent;

  @ViewChild('modalProductoEliminar')
  modalEliminar: ModalComponent;

  @ViewChild('modalProductoModificar')
  modalModificar: ModalComponent;

  @ViewChild('modalProductoCrear')
  modalCrear: ModalComponent;

  titulo = 'Productos';
  resultado = '';

  // Variables para manejar las imagenes
  file: File;

  // Variables para gestionar productos
  key;
  private idPro;
  private idCat;
  private sub: any;

  pista = '';
  producto: Producto = new Producto();
  productos: FirebaseListObservable<Producto[]>;
  datosCargados: boolean;

  // Variable para validar el tamaño de la imagen.
  private imagenValidada: boolean = true;

  constructor(private productoServicio: ProductoService, public af: AngularFire, private route: ActivatedRoute) {
    this.datosCargados = true;

    this.productos = this.productoServicio.getProductos(this.idPro, this.idCat);

    this.productos.subscribe(data => {
        this.datosCargados = false;
    });
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.idPro = params['id'];
      this.idCat = params['idC'];
    });
    this.getProductos();
  }

  getProductos(): void {
    this.productos = this.productoServicio.getProductos(this.idPro, this.idCat);
  }

  seleccionarImagen(event: EventTarget) {
    const eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    const target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    this.file = target.files[0];
    this.validarTamannoImagen(this.file);
  }

  validarTamannoImagen(dimesionImagen: File) {
    if (dimesionImagen != undefined) {
      // La imagen se transforma a KB.
      var imagenKB = dimesionImagen.size / 1024;

      // Tamaño de la imagen permitida por la aplicación en KB.
      var imagenPermitida = 150;

      if (imagenKB > imagenPermitida) {
        this.imagenValidada = false;
      } else {
        this.imagenValidada = true;
      }
    } else {
      this.imagenValidada = true;
    }
  }

  subirImagen(imageFile: File) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child('productos/' + imageFile.name);
    const uploadTask = imageRef.put(imageFile);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      function (snapshot) {
        // Para evaluar progreso
      }, function (error) {
        console.log('Uh-oh, an error occurred!');
      }, function () {
        console.log('Imagen subida con exito');
      });
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

  agregarProducto() {
    // Subir producto con imagen default
    if (this.file === undefined) {
      const imagenPath = 'productos/producto_default.jpg';
      const imagenURL = 'https://firebasestorage.googleapis.com/v0/b/easypaybar.appspot.com/o/' +
        'productos%2Fproducto_default.jpg?alt=media&token=07c0c51e-b277-4c0a-b739-ce79af920ee6';
      this.productoServicio.agregarProductoDefault(this.idPro, this.idCat, imagenPath, imagenURL, this.producto);
    } else {  // Subir producto con imagen seleccionada
      // Subir imagen
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child('productos/' + this.file.name);
      const pathRef = firebase.storage().ref('productos/' + this.file.name);
      const uploadTask = imageRef.put(this.file);

      uploadTask.then((snapshot) => {
        pathRef.getDownloadURL().then(url => this.productoServicio.agregarProducto(this.idPro, this.idCat, this.file, url, this.producto)
        );
      });
    }
  }

  actualizarProducto() {
    // Si la imagen no es la default se borra la imagen del producto
    if (this.producto.imagen !== 'productos/producto_default.jpg') {
      this.borrarImagen(this.producto.imagen);
    }

    // Actualizar producto con imagen default
    if (this.file === undefined) {
      const imagenPath = 'productos/producto_default.jpg';
      const imagenURL = 'https://firebasestorage.googleapis.com/v0/b/easypaybar.appspot.com/o/' +
        'productos%2Fproducto_default.jpg?alt=media&token=07c0c51e-b277-4c0a-b739-ce79af920ee6';
      this.productoServicio.actualizarProductoDefault(this.idPro, this.idCat, this.key, this.producto, imagenPath, imagenURL);
    } else {  // Subir producto con imagen seleccionada
      // Subir la nueva imagen
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child('productos/' + this.file.name);
      const pathRef = firebase.storage().ref('productos/' + this.file.name);
      const uploadTask = imageRef.put(this.file);

      uploadTask.then((snapshot) => {
        pathRef.getDownloadURL().then(url =>
          this.productoServicio.actualizarProducto(this.idPro, this.idCat, this.key, this.producto, this.file, url)
        );
      });
    }
  }

  eliminarProducto() {
    // Si la imagen no es la default se borra la imagen del producto
    if (this.producto.imagen !== 'productos/producto_default.jpg') {
      this.borrarImagen(this.producto.imagen);
    }
    // Eliminar producto
    this.productoServicio.eliminarProducto(this.idPro, this.idCat, this.key);
    this.producto = new Producto();
  }

  /* Modals */
  openModalProductoCrear() {
    this.modalCrear.open();
    this.producto = new Producto();
    this.producto.comentar = false;
  }

  openModalProductoEliminar(id, product: Producto) {
    this.key = id;
    this.producto.nombre = product.nombre;
    this.producto.precio = product.precio;
    this.producto.veces = product.veces;
    this.producto.imagen = product.imagen;
    this.modalEliminar.open();
  }

  openModalProductoEditar(id, product: Producto) {
    this.imagenValidada = true;
    this.key = id;
    this.producto.nombre = product.nombre;
    this.producto.precio = product.precio;
    this.producto.veces = product.veces;
    this.producto.imagen = product.imagen;
    this.producto.imagenURL = product.imagenURL;
    this.producto.comentar = product.comentar;
    this.modalModificar.open();
  }

  openModalProductoVerDetalle(id, product: Producto) {
    this.key = id;
    this.producto.nombre = product.nombre;
    this.producto.precio = product.precio;
    this.producto.veces = product.veces;
    this.producto.imagenURL = product.imagenURL;
    this.modalProductoVerDetalle.open();
  }
}
