import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductoService } from '../service/producto.service';
import { Producto } from './../typeScript/producto';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2';
import { ActivatedRoute } from '@angular/router';
import { CategoriaService } from '../service/categoria.service';
import { CompraService } from '../service/compra.service';
import { Compra } from './../typeScript/compra';
import { DetalleCompra } from './../typeScript/detalleCompra';
import { AfiliadoService } from '../service/afiliado.service';
import { Categoria } from './../typeScript/categoria';
import { Afiliado } from '../typeScript/afiliado';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { DatePipe } from "@angular/common";
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css'],
  providers: [ProductoService, CategoriaService, CompraService, AfiliadoService]
})
export class ComprasComponent implements OnInit {

  @ViewChild('modalAgregarProducto')
  modalAgregarProducto: ModalComponent;

  @ViewChild('modalEliminarProducto')
  modalEliminarProducto: ModalComponent;

  @ViewChild('modalEditarProducto')
  modalEditarProducto: ModalComponent;

  @ViewChild('modalProductoExistente')
  modalProductoExistente: ModalComponent;

  @ViewChild('modalSaldoInsuficiente')
  modalSaldoInsuficiente: ModalComponent;

  @ViewChild('modalCompraExitosa')
  modalCompraExitosa: ModalComponent;

  @ViewChild('modalVerificarCompra')
  modalVerificarCompra: ModalComponent;

  @ViewChild('modalClienteQR')
  modalClienteQR: ModalComponent;

  producto: Producto = new Producto();
  productos: FirebaseListObservable<Producto[]>;
  categorias: FirebaseListObservable<Categoria[]>;
  categoria: Categoria = new Categoria();
  compra: Compra = new Compra();
  afiliados: FirebaseListObservable<Afiliado[]>;
  afiliado: Afiliado = new Afiliado();
  detalleCompra: DetalleCompra = new DetalleCompra();
  date: DatePipe = new DatePipe("en-US");
  categoriaCtrl: FormControl;
  categoriasFiltradas: any;
  private listaCategorias = [];
  private idPro;
  private idCat: string;
  private sub: any;
  private listaProductosDetalle = [];

  constructor(private productoServicio: ProductoService, private route: ActivatedRoute,
    private categoriaServicio: CategoriaService, private afiliadoService: AfiliadoService,
    private compraServicio: CompraService, private db: AngularFireDatabase) { 
    this.obtenerCategoriasFiltradas();
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.idPro = params['id'];
    });
    this.getCategorias();
    this.getAfiliados();
    this.obtenerListaCategorias();
    this.afiliado.saldo = 0;
    this.categoria.nombre = "";
    this.afiliado.nombre = "";
  }

  obtenerCategoriasFiltradas() {
    this.categoriaCtrl = new FormControl();
    this.categoriasFiltradas = this.categoriaCtrl.valueChanges
        .startWith(null)
        .map(nombre => this.filtrarCategorias(nombre));
  }

  filtrarCategorias(nombre: string) {
    return nombre ? this.listaCategorias.filter(opcion => new RegExp(`^${nombre}`, 'gi').test(opcion.nombre))
               : this.listaCategorias;
  }

  buscarCategoria() {
    const queryObservable = this.db.list('/proveedor/' + this.idPro + '/categoria', {
      query: {
        orderByChild: 'nombre',
        equalTo: this.categoria.nombre
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if(queriedItems.length > 0) {
        this.obtenerIdCategoria(queriedItems[0].$key);
      }
    }); 
  }

  buscarAfiliado() {
    const queryObservable = this.db.list('/proveedor/' + this.idPro + '/afiliados', {
      query: {
        orderByChild: 'key',
        equalTo: this.afiliado.key
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if(queriedItems.length > 0) {
        this.afiliado.nombre = queriedItems[0].nombre;
      }
    }); 
  }

  obtenerListaCategorias() {
    const queryObservable = this.db.list('/proveedor/' + this.idPro + '/categoria', {
      query: {
        orderByChild: 'nombre'
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if(queriedItems.length > 0) {
        for (var i = 0; i < queriedItems.length; i++) {
          var categoria = { key: queriedItems[i].$key, nombre: queriedItems[i].nombre };
          this.listaCategorias.push(categoria);
        }
      } 
    }); 
  }

  getProductos(): void {
    this.productos = this.productoServicio.getProductos(this.idPro, this.idCat);
  }

  getCategorias(): void {
    this.categorias = this.categoriaServicio.getCategorias(this.idPro);
  }

  getAfiliados(): void {
    this.afiliados = this.afiliadoService.getAfiliados(this.idPro);
  }

  obtenerIdCategoria(key: string) {
    this.idCat = key;
    this.getProductos();
  }

  obtenerIdCliente(key: string) {
    this.afiliado.key = key;
    if (key == '') {
      this.afiliado.saldo = 0;
    } else {
      this.obtenerSaldoAfiliado(this.afiliado.key);
    }    
  }

  obtenerSaldoAfiliado(key) {
    const queryObservable = this.db.list('/proveedor/' + this.idPro + '/afiliados', {
      query: {
        orderByChild: 'key',
        equalTo: key
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if (queriedItems.length > 0) {
        this.afiliado.saldo = queriedItems[0].saldo;
      }
    });
  }

  calcularTotal() {
    var total = 0;
    for (var i = 0; i < this.listaProductosDetalle.length; i++) {
      total += (parseFloat(this.listaProductosDetalle[i].precio) * this.listaProductosDetalle[i].cantidad);
      this.compra.total = total;
    }
    return this.compra.total;
  }

  actualizarVecesCompradas(cantidad, idProd, idCat) {
    const queryObservable = this.db.list('/proveedor/' + this.idPro + '/categoria/' + idCat + '/producto', {
      query: {
        orderByChild: 'nombre'
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if (queriedItems.length > 0) {
        for (var i = 0; i < queriedItems.length; i++) {
          if (queriedItems[i].$key == idProd) {
            var veces = queriedItems[i].veces + cantidad;
            this.productoServicio.actualizarVecesCompradas(this.idPro, idCat, idProd, veces);
          }
        }        
      }
    });
  }

  realizarCompra() {
    if (this.categoria.nombre == "" || this.listaProductosDetalle.length == 0 || this.afiliado.nombre == ""
      || this.afiliado.saldo == 0) {
      this.modalVerificarCompra.open();
    } else {
      const queryObservable = this.db.list('/proveedor/' + this.idPro + '/afiliados', {
        query: {
          orderByChild: 'key',
          equalTo: this.afiliado.key
        }
      }).first();

      queryObservable.subscribe(queriedItems => {
        if (queriedItems.length > 0) {
          if (this.compra.total > queriedItems[0].saldo) {
            this.modalSaldoInsuficiente.open();
          } else {
            this.guardarCompra();
            var saldoTotal = queriedItems[0].saldo - this.compra.total;
            this.afiliadoService.actualizarSaldo(this.idPro, saldoTotal, this.afiliado.key);
            for (var i = 0; i < this.listaProductosDetalle.length; i++) {
              this.actualizarVecesCompradas(this.listaProductosDetalle[i].cantidad, 
                this.listaProductosDetalle[i].keyPro, this.listaProductosDetalle[i].keyCat);
            }
          }  
        }
      });
    } 
  }

  abrirModalAgregarProducto(key: string, nombre: string, precio: number) {
    this.producto.key = key;
    this.producto.nombre = nombre;
    this.producto.precio = precio;
    this.modalAgregarProducto.open();
  }

  guardarCompra() {
    this.compra.fecha_Compra =  this.date.transform(new Date(), 'dd/MM/yyyy');
    this.compraServicio.agregar(this.idPro, this.afiliado.key, this.listaProductosDetalle, this.compra);
    this.modalCompraExitosa.open();
  }

  agregarProductoDetalle() {
    var indice = this.listaProductosDetalle.map(lista => lista.key).indexOf(this.producto.key);
    if (indice >= 0) {
      this.modalProductoExistente.open();
    } else {
      var producto = { keyPro: this.producto.key, keyCat: this.idCat, producto: this.producto.nombre, 
        precio: this.producto.precio, cantidad: this.detalleCompra.cantidad };
      this.listaProductosDetalle.push(producto);
      this.calcularTotal();
    }
  }

  abrirModalEliminarDetalle(key: string, nombre: string, precio: number, cantidad: number) {
    this.producto.key = key;
    this.producto.nombre = nombre;
    this.producto.precio = precio;
    this.detalleCompra.cantidad = cantidad;
    this.modalEliminarProducto.open();
  }

  abrirModalEditarDetalle(key: string, nombre: string, precio: number, cantidad: number) {
    this.producto.key = key;
    this.producto.nombre = nombre;
    this.producto.precio = precio;
    this.detalleCompra.cantidad = cantidad;
    this.modalEditarProducto.open();
  }

  eliminarProductoDetalle() {
    var indice = this.listaProductosDetalle.map(lista => lista.key).indexOf(this.producto.key);
    if (indice > -1) {
      this.listaProductosDetalle.splice(indice, 1);
    }
    this.calcularTotal();
    if (this.listaProductosDetalle.length == 0) {
      this.compra.total = 0;
    }
  }

  actualizarProductoDetalle() {
    var indice = this.listaProductosDetalle.map(lista => lista.key).indexOf(this.producto.key);
    if (indice > -1) {
      this.listaProductosDetalle.splice(indice, 1, { keyPro: this.producto.key, keyCat: this.idCat, 
        producto: this.producto.nombre, precio: this.producto.precio, cantidad: this.detalleCompra.cantidad });
    }
    this.calcularTotal();
  }

  leerCodigoQRCliente(codigoQR: string) {
    this.obtenerIdCliente(codigoQR);
    this.buscarAfiliado();
    if (codigoQR !== "") {
      this.modalClienteQR.close();
    }
  }

}
