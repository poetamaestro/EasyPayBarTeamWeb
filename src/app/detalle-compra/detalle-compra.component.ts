import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2';
import { Afiliado } from '../typeScript/afiliado';
import { Compra } from './../typeScript/compra';
import { DetalleCompra } from './../typeScript/detalleCompra';

@Component({
  selector: 'app-detalle-compra',
  templateUrl: './detalle-compra.component.html'
})
export class DetalleCompraComponent implements OnInit {
  
  private idProveedor;
  private idAfiliado;
  private idCompra;
  private sub: any;
  afiliado: Afiliado = new Afiliado();
  compra: Compra = new Compra();
  private listaDetalleCompra = [];

  constructor(private route: ActivatedRoute, private db: AngularFireDatabase) { 
  	this.sub = this.route.params.subscribe(params => {
       this.idProveedor = params['id'];
       this.idAfiliado = params['idAfiliado'];
       this.idCompra = params['idCompra'];
    });
  }

  ngOnInit() {
    this.obtenerListadoDetalleCompra();
  	this.obtenerDatosAfiliado(this.idAfiliado);
  	this.obtenerDatosCompra();
  }

  obtenerDatosAfiliado(key: string) {
    const queryObservable = this.db.list('/proveedor/' + this.idProveedor + '/afiliados', {
      query: {
        orderByChild: 'key',
        equalTo: key
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if (queriedItems.length > 0) {
        this.afiliado.saldo = queriedItems[0].saldo;
        this.afiliado.nombre = queriedItems[0].nombre;
      }
    });
  }

  obtenerDatosCompra() {
  	const queryObservable = this.db.list('/proveedor/' + this.idProveedor + '/afiliados/' 
  		+ this.idAfiliado + '/compras', {
      query: {
        orderByChild: 'total'
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if (queriedItems.length > 0) {
      	for (var i = 0; i < queriedItems.length; i++) {
      		if (queriedItems[i].$key == this.idCompra) {
      			this.compra.fecha_Compra = queriedItems[i].fecha_Compra;
        		this.compra.total = queriedItems[i].total;
      		}
      	}
      }
    });
  }

  obtenerListadoDetalleCompra() {
    const compraObservable = this.db.list('/proveedor/' + this.idProveedor + '/afiliados/' + 
      this.idAfiliado + '/compras/' + this.idCompra + '/detalleCompra', {
      query: {
        orderByChild: 'total'
      }
    }).first();

    compraObservable.subscribe(compraItems => {
      if(compraItems.length > 0) {
        for (var i = 0; i < compraItems.length; i++) {
          this.listaDetalleCompra.push({ keyCat: compraItems[i].keyCat, categoria: compraItems[i].categoria, 
            keyPro: compraItems[i].keyPro, producto: compraItems[i].producto, precio: compraItems[i].precio,
            cantidad: compraItems[i].cantidad });
        }
      } 
    }); 
  } 

}
