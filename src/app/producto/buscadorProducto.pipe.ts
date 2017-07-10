import { Pipe, PipeTransform } from '@angular/core';
import { Producto } from './../typeScript/producto';
import { FirebaseListObservable } from 'angularfire2';

@Pipe({
  name: 'buscarPor'
})
export class FilterPipe implements PipeTransform {
  transform(productos: FirebaseListObservable<Producto[]>, filtro: any): any {
        if (!productos || !filtro) {
            return productos;
        }
        // filter items array, items which match and return true will be kept, false will be filtered out
        return productos.map(productosItems => {
            return productosItems.filter(producto => JSON.stringify(producto).
              toLowerCase().indexOf(filtro.toLowerCase()) !== -1); 
		    });
    }
}