import Bounded from "@/components/layout/bounded/Bounded";
import CourseCard, {
  type Course,
} from "@/components/shared/course-card/CourseCard";
import type { ApiBundleCourse } from "@/lib/courses/loaders";

function toCourse(item: ApiBundleCourse): Course {
  return {
    slug: item.slug,
    title: item.title,
    description: item.shortDescription,
    price: Number(item.price),
  };
}

export default function BundleCourses({
  courses,
}: {
  courses: ApiBundleCourse[];
}) {
  if (courses.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-primary-950 py-16 lg:py-[90px]">
      <Bounded className="flex flex-col items-start gap-8 lg:gap-[59px]">
        <h2 className="type-h2 font-title font-semibold text-on-dark">
          Courses in this Bundle
        </h2>

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={toCourse(course)} />
          ))}
        </div>
      </Bounded>
    </section>
  );
}
