import { Component, OnInit } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { AngularFire} from 'angularfire2';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.css']
})
export class MenuAdminComponent implements OnInit {

  administrador = false;
  proveedor = false;
  user: any;
  id: string;
  datosCargados: boolean;

  constructor(public af: AngularFire, private router: Router) {
    this.datosCargados = true;

    this.af.auth.subscribe(auth => {
      if (auth) {
        this.filtro(af, auth);
      }
    });
  }

  ngOnInit() {
  }

  iniciarMenus(proveedor: boolean, administrador: boolean) {
    this.datosCargados = false;
    if (proveedor && !administrador) {
      this.router.navigateByUrl('/menu-proveedor');
    }
  }

  filtro(af , auth) {
    const queryObservable = af.database.list('/cliente', {
      query: {
        orderByChild: 'codigoQR',
        equalTo: auth.uid
      }
    });

    // subscribe to changes
    queryObservable.subscribe(queriedItems => {
      this.administrador =  queriedItems[0].admin;
      this.proveedor = queriedItems[0].proveedor;
      this.iniciarMenus(queriedItems[0].proveedor, queriedItems[0].admin);
    });

    const queryObservableProveedor = af.database.list('/proveedor', {
      query: {
        orderByChild: 'codigoQR',
        equalTo: auth.uid
      }
    });

    queryObservableProveedor.subscribe(queriedItems => {
      if (queriedItems.length > 0) {
        this.id = queriedItems[0].$key;
      }
    });

  }


}
