import {
  ActionReducerMap,
  createFeatureSelector,
  MetaReducer,
  ActionReducer
} from "@ngrx/store";

import * as fromPage from "./page.reducer";
import * as fromAction from "../actions";
import * as fromComponent from "./component.reducer";

export interface CmsState {
  page: fromPage.PageState;
  component: fromComponent.ComponentState;
}

export const reducers: ActionReducerMap<CmsState> = {
  page: fromPage.reducer,
  component: fromComponent.reducer
};

export const getCmsState = createFeatureSelector<CmsState>("cms");

export function clearCmsState(reducer: ActionReducer<any>): ActionReducer<any> {
  return function(state, action) {
    if (action.type === fromAction.CLEAR_CMS_STATE) {
      state = undefined;
    }
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<any>[] = [clearCmsState];
