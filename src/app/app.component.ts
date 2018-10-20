import {Component, OnInit} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {Observable} from "rxjs";
import { Logout } from './auth/auth.actions';
import { AppState } from './reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {



    constructor(private store: Store<AppState>) {

    }

    ngOnInit() {


    }

    logout() {

      this.store.dispatch(new Logout());
      
    }


}
