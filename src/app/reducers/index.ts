import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';

export type AppState = {
}

export const reducers: ActionReducerMap<AppState> = {
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
