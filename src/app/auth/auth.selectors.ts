import { createSelector } from "@ngrx/store";

/* Define a simple selector function that takes as argument the 
complete state of the store and gets back the auth object. This 
is known as a feature selector because it's selecting one of the 
subtrees of State of the complete store application state.*/
export const selectAuthState = state => state.auth;

/**
 * Using a utility from ngrx (createSelector function) to create 
 * a Memoized function that remembers the calculations of loggedIn 
 * States.
 */
export const isLoggedIn = createSelector(

  // Pass in selector
  selectAuthState,

  // Call a projector function
  auth => auth.loggedIn
)

