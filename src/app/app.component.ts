import {Component, OnInit} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {Observable} from "rxjs";
import { Logout } from './auth/auth.actions';
import { AppState } from './reducers';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(private store: Store<AppState>) {

    }

    ngOnInit() {

      this.store
      .pipe(
        map(state => state.auth.loggedIn)
      )
      .subscribe(loggedIn => console.log("loggedIn", loggedIn))

    }

    logout() {

      this.store.dispatch(new Logout());
      
    }


}
