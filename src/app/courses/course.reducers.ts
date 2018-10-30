import { Course } from './model/course';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity'
import { CourseActions, CourseActionTypes } from './course.actions';

export interface CoursesState extends EntityState<Course>{

}

export const adaptor: EntityAdapter<Course> = createEntityAdapter<Course>();

export const initialCoursesState: CoursesState = adaptor.getInitialState()

export function coursesReducer(state = initialCoursesState, action: CourseActions): CoursesState {

  switch(action.type) {

    case CourseActionTypes.CourseLoaded: return adaptor.addOne(action.payload.course, state);

    default: return state;

  }

}