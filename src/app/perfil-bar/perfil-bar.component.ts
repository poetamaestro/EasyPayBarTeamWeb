import { Compra } from './../typeScript/compra';
import { Afiliado } from './../typeScript/afiliado';
import { ProveedorService } from './../service/proveedor.service';
import { Proveedor } from './../typeScript/proveedor';
import { FirebaseListObservable } from 'angularfire2';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
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

  @ViewChild('modalBarEditar')
  modalEditar: ModalComponent;

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

  actualizarBar(){

  }

  openModalBarEditar() {
    this.modalEditar.open();
  }
}