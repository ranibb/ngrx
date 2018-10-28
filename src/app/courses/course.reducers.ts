import { Course } from './model/course';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity'

export interface CoursesState extends EntityState<Course>{

}

export const adaptor: EntityAdapter<Course> = createEntityAdapter<Course>();