

import { Action } from '@ngrx/store';
import { User } from '../model/user.model';
import { AuthActions, AuthActionTypes } from './auth.actions';


export interface AuthState {
  loggedIn: boolean,
  user: User
}

export const initialAuthState: AuthState = {
  loggedIn: false,
  user: undefined
};

export function authReducer(state = initialAuthState, action: AuthActions): AuthState {
  switch (action.type) {

    case AuthActionTypes.LoginAction: return {
      loggedIn: true,
      user: action.payload.user
    }

    // Returning an object that mutates the store initial state will be prevented by storeFreeze 
    // case AuthActionTypes.LogoutAction:
    //   state.loggedIn = false;
    //   state.user = undefined;
    //   return state;

    case AuthActionTypes.LogoutAction: return {
      loggedIn: false,
      user: undefined
    }

    default:
      return state;
  }
}