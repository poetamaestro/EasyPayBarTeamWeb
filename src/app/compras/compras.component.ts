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

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css'],
  providers: [ProductoService, CategoriaService, CompraService, AfiliadoService]
})
export class ComprasComponent implements OnInit {

  @ViewChild('modalAgregarProducto')
  modalAgregarProducto: ModalComponent;

  producto: Producto = new Producto();
  productos: FirebaseListObservable<Producto[]>;
  categorias: FirebaseListObservable<Categoria[]>;
  compra: Compra = new Compra();
  afiliados: FirebaseListObservable<Afiliado[]>;
  afiliado: Afiliado = new Afiliado();
  detalleCompra: DetalleCompra = new DetalleCompra();
  private precioTotal: number;
  private idPro;
  private idCat: string;
  private sub: any;
  private cantidad: number;
  private listaProductosDetalle = [];

  constructor(private productoServicio: ProductoService, private route: ActivatedRoute,
    private categoriaServicio: CategoriaService, private afiliadoService: AfiliadoService,
    private compraServicio: CompraService, private db: AngularFireDatabase) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.idPro = params['id'];
    });
    this.getCategorias();
    this.getAfiliados();
    this.afiliado.saldo = 0;
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

  obtenerIdCliente(codQR: string) {
    if (codQR == '') {
      this.afiliado.saldo = 0;
    } else {
      this.obtenerSaldoAfiliado(codQR);
    }    
  }

  obtenerSaldoAfiliado(codQR) {
    const queryObservable = this.db.list('/proveedor/' + this.idPro + '/afiliados', {
      query: {
        orderByChild: 'codigoQR',
        equalTo: codQR
      }
    });

    queryObservable.subscribe(queriedItems => {
      if (queriedItems.length > 0) {
        this.afiliado.saldo = queriedItems[0].saldo;
      }
    });
  }

  calcularTotal() {
    var total = 0;
    for (var i = 0; i < this.listaProductosDetalle.length; i++) {
        if (this.listaProductosDetalle[i].precio) {
            total += (parseFloat(this.listaProductosDetalle[i].precio) * 
              this.listaProductosDetalle[i].cantidad);
            this.precioTotal = total;
        }
    }
    return this.precioTotal;
  }

  openModalAgregarProducto(key: string, nombre: string, precio: number) {
    this.producto.key = key;
    this.producto.nombre = nombre;
    this.producto.precio = precio;
    this.modalAgregarProducto.open();
  }

  agregarProductoDetalle() {
    var producto = { key: this.producto.key, nombre: this.producto.nombre, 
      precio: this.producto.precio, cantidad: this.detalleCompra.cantidad };
    this.listaProductosDetalle.push(producto);
    this.calcularTotal();
  }

}
