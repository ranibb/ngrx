import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { AuthState, authReducer } from '../auth/auth.reducer';

export type AppState = {
  auth: AuthState
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
