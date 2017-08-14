import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFire, FirebaseListObservable, AngularFireDatabase } from 'angularfire2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ProveedorPreferenciasService } from '../service/preferencias.service';
import { Preferencias } from './../typeScript/preferencias';
import { PaginationConfig } from 'ng2-bootstrap';
import * as firebase from 'firebase';

interface Column {
  titulo: string,
  nombre: string,
  sort?: 'desc' | 'asc' | ''
}

@Component({
  selector: 'app-proveedor-preferencias',
  templateUrl: './proveedor-preferencias.component.html',
  styleUrls: ['./proveedor-preferencias.component.css'],
  providers: [ProveedorPreferenciasService,
  {provide: PaginationConfig, useValue: { boundaryLinks: true,  firstText: 'First', 
  previousText: '&lsaquo;', nextText: '&rsaquo;', lastText: 'Last', maxSize: 1 }}]
})
export class ProveedorPreferenciasComponent implements OnInit {
  
  // Ventanas modales
  @ViewChild('modalAgregarProductosFavoritos')
  modalAgregarProductosFavoritos: ModalComponent;

  @ViewChild('modalProductoFavoritoVerDetalle')
  modalProductoFavoritoVerDetalle: ModalComponent;

  @ViewChild('modalProductoFavoritoEliminar')
  modalProductoFavoritoEliminar: ModalComponent;

  @ViewChild('modalProductoFavoritoExistente')
  modalProductoFavoritoExistente: ModalComponent;

  @ViewChild('modalProductoFavoritoMaximo')
  modalProductoFavoritoMaximo: ModalComponent;

  // Variables para gestionar productos favoritos del proveedor.
  private idProveedor;
  private sub: any;
  preferencias: FirebaseListObservable<Preferencias[]>;
  preferencia: Preferencias = new Preferencias();
  private datosCargados: boolean;
  private datosProductos: string;
  private numeroDeProductosFavoritos: number;

  // atributos de la tabla
  public rows: Array<any> = [];
  public columns: Array<any> = [
    {titulo: 'Categoría', nombre: 'categoria'},
    {titulo: 'Producto', nombre: 'producto'},
    {titulo: 'Precio', nombre: 'precio'}
  ];
  private data: Array<any> = [];

  // atributos de la paginacion
  public page: number = 1;
  public itemsPerPage: number = 10;
  public maxSize: number = 5;
  public numPages: number = 1;
  public length: number = 0;

  public config: any = {
    paging: true,
    sorting: {columns: this.columns},
    filtering: {filterString: ''},
    className: ['table table-hovered']
  };

  constructor(private route: ActivatedRoute, private preferenciasServicio: ProveedorPreferenciasService,
  	private db: AngularFireDatabase) { 
  	this.datosCargados = true;

    this.preferencias = this.preferenciasServicio.getPreferencias(this.idProveedor);

    this.preferencias.subscribe(data => {
        this.datosCargados = false;
    });
  }

  ngOnInit() {
  	this.sub = this.route.params.subscribe(params => {
      this.idProveedor = params['id'];
    });
    this.getPreferencias();
    this.obtenerListaCategoriaProducto();
  }

  getPreferencias(): void {
    this.preferencias = this.preferenciasServicio.getPreferencias(this.idProveedor);
  }

  obtenerListaCategoriaProducto() {
    const categoriaObservable = this.db.list('/proveedor/' + this.idProveedor + '/categoria', {
      query: {
        orderByChild: 'nombre'
      }
    }).first();

    categoriaObservable.subscribe(categoriaItems => {
      if(categoriaItems.length > 0) {
        for (var i = 0; i < categoriaItems.length; i++) {
          var keyProductos: Array<any> = categoriaItems[i].producto;
          for (var keyPro in keyProductos) {
            this.data.push({ categoriaId: categoriaItems[i].$key, categoria: categoriaItems[i].nombre,
             productoId: keyPro, producto: keyProductos[keyPro].nombre, precio: keyProductos[keyPro].precio,
             imagenURL: keyProductos[keyPro].imagenURL });
            this.onChangeTable(this.config);
          }
        }
      } 
    }); 
  }

  agregarProductoFavorito(preferencia: Preferencias) {
  	this.preferencia.categoriaId = preferencia.categoriaId;
  	this.preferencia.productoId = preferencia.productoId;
  	this.preferencia.categoria = preferencia.categoria;
  	this.preferencia.producto = preferencia.producto;
  	this.preferencia.imagenURL = preferencia.imagenURL;
  	this.preferencia.precio = preferencia.precio;
  	this.verificarNumeroMaximoProductosFavoritos(this.preferencia);
  }

  verificarNumeroMaximoProductosFavoritos(preferencia: Preferencias) {
  	const queryObservable = this.db.list('/proveedor/' + this.idProveedor + '/favoritos', {
      query: {
        orderByChild: 'categoriaId'
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if(queriedItems.length > 0) {
      	var numeroMaximoPermitido = 8;
        if (queriedItems.length < numeroMaximoPermitido) {
        	this.verificarProductoFavoritoExistente(preferencia);
        } else {
        	this.modalProductoFavoritoMaximo.open();
        }
      }
    });
  }

  verificarProductoFavoritoExistente(preferencia: Preferencias) {
  	const queryObservable = this.db.list('/proveedor/' + this.idProveedor + '/favoritos', {
      query: {
        orderByChild: 'productoId',
        equalTo: preferencia.productoId
      }
    }).first();

    queryObservable.subscribe(queriedItems => {
      if(queriedItems.length > 0) {
      	this.modalProductoFavoritoExistente.open();
      } else {
      	this.preferenciasServicio.agregarPreferencias(this.idProveedor, preferencia);
      }
    });
  }

  eliminarProductoFavorito() {
  	this.preferenciasServicio.eliminarPreferencias(this.idProveedor, this.preferencia.key);
  	this.preferencia = new Preferencias();
  }

  abrirProductosFavoritos() {
  	this.modalAgregarProductosFavoritos.open();
  }

  abrirModalProductoFavoritoVerDetalle(preferencia: Preferencias) {
  	this.preferencia.imagenURL = preferencia.imagenURL;
  	this.preferencia.precio = preferencia.precio;
  	this.preferencia.categoria = preferencia.categoria;
  	this.preferencia.producto = preferencia.producto;
  	this.modalProductoFavoritoVerDetalle.open();
  }

  abrirModalProductoFavoritoEliminar(id: string, preferencia: Preferencias) {
  	this.preferencia.key = id;
  	this.preferencia.precio = preferencia.precio;
  	this.preferencia.categoria = preferencia.categoria;
  	this.preferencia.producto = preferencia.producto;
  	this.modalProductoFavoritoEliminar.open();
  }

  public changePage(page: any, data: Array<any> = this.data): Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1
      ? (start + page.itemsPerPage)
      : data.length;
    return data.slice(start, end);
  }

  public changeSort(data: any, config: any): any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName: string = void 0;
    let sort: string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].nombre;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return data;
    }

    // simple sorting
    return data.sort((previous: any, current: any) => {
      if (previous[columnName].toLowerCase() > current[columnName].toLowerCase()) {
        return sort === 'desc'
          ? -1
          : 1;
      } else if (previous[columnName].toLowerCase() < current[columnName].toLowerCase()) {
        return sort === 'asc'
          ? -1
          : 1;
      }
      return 0;
    });
  }

  public changeFilter(data: any, config: any): any {
    let filteredData: Array<any> = data;
    this.columns.forEach((column: any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item: any) => {
          return item[column.nombre].match(column.filtering.filterString);
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item: any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString));
    }

    let tempArray: Array<any> = [];
    filteredData.forEach((item: any) => {
      let flag = false;
      this.columns.forEach((column: any) => {
        if (item[column.nombre].toString()
                             .match(this.config.filtering.filterString) || 

                             item[column.nombre].toString().toLowerCase()
                             .match(this.config.filtering.filterString) ||

                             item[column.nombre].toString().toUpperCase()
                             .match(this.config.filtering.filterString)) {
          flag = true;
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }

  public onChangeTable(config: any, pageNumber?: number): any {
    const page : {itemsPerPage: number, page: number} = {
      itemsPerPage: this.itemsPerPage,
      page: pageNumber ? pageNumber : 1
    };
    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering);
    }

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }

    let filteredData = this.changeFilter(this.data, this.config);
    let sortedData = this.changeSort(filteredData, this.config);
    this.rows = page && config.paging
      ? this.changePage(page, sortedData)
      : sortedData;
    this.length = sortedData.length;
  }

  public getData(row: any, column: Column): string {
    if (!row) {
      return ''
    }
    if (column.nombre == 'precio') {
      return '$' + row[column.nombre];
    } else {
      return row[column.nombre];
    } 
  }

  public sortByColumn(columnToSort: Column) {
    const sorting: Array<Column> = Object.assign({}, this.config.sorting).columns;

    const sorted = sorting.map((column: Column) => {
      if (columnToSort.nombre === column.nombre) {
        const newSort = column.sort === 'asc'
          ? 'desc'
          : 'asc';
        return Object.assign(column, {sort: newSort});
      } else {
        return Object.assign(column, {sort: ''});
      }
    });

    const config = Object.assign({}, this.config, {
      sorting: {columns: sorted}
    });
    this.onChangeTable(config);
  }

}
