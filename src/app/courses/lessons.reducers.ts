import { EntityState, createEntityAdapter, EntityAdapter } from "@ngrx/entity";
import { Lesson } from "./model/lesson";
import { CourseActions, CourseActionTypes } from "./course.actions";

export interface LessonsState extends EntityState<Lesson> {

}

export const adapter: EntityAdapter<Lesson> = createEntityAdapter<Lesson>();

export const initialLessonsState: LessonsState = adapter.getInitialState()


export function lessonsReducer(state = initialLessonsState, action: CourseActions): LessonsState {

  switch(action.type) {

    default: return state;

  }
  
}

export const { 
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = adapter.getSelectors()