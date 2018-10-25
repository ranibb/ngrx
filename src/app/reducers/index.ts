import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../../environments/environment';
import { AuthState, authReducer } from '../auth/auth.reducer';
import { routerReducer } from '@ngrx/router-store';

export type AppState = {
  router: any
  auth: AuthState
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  router: routerReducer
};

/**
 * Enabling storeFreeze in metaReducers in the production mode. metaReducers are applied after 
 * all our application reducers have been executed. Enabling storeFreeze here will take the 
 * application state and recursively freezes all properties of each javascript object by making 
 * them read-only.
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze] : [];
