import { Course } from './model/course';

export interface CourseState {

  coursesEntities: {[key: number]: Course};
  coursesOrder: number[];

}

export interface LessonsState {

  lessonsEntities : {[key:number]: Course};
  lessonsOrder: number[];
  
}