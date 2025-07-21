import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CourseCard from '../components/ui/CourseCard';
import { instructorAPI } from '../lib/api';

const InstructorPage: React.FC = () => {
  const router = useRouter();
  const { instructorId } = router.query;
  const [instructor, setInstructor] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (instructorId && typeof instructorId === 'string') {
      instructorAPI.getInstructor(instructorId)
        .then(data => {
          if (data) {
            setInstructor(data);
            fetch(`/api/instructors/${instructorId}/courses`)
              .then(res => res.ok ? res.json() : [])
              .then(coursesData => {
                setCourses(coursesData || []);
                setLoading(false);
              });
          } else {
            setInstructor({
              id: instructorId,
              name: 'Unknown Instructor',
              title: 'Unknown',
              image: '/placeholder-avatar.jpg',
              bio: 'This instructor profile does not exist or could not be found.',
              email: '',
              expertise: [],
              experience: 0,
              createdAt: new Date(),
            });
            setCourses([]);
            setLoading(false);
          }
        })
        .catch(() => {
          setInstructor({
            id: instructorId,
            name: 'Unknown Instructor',
            title: 'Unknown',
            image: '/placeholder-avatar.jpg',
            bio: 'This instructor profile does not exist or could not be found.',
            email: '',
            expertise: [],
            experience: 0,
            createdAt: new Date(),
          });
          setCourses([]);
          setLoading(false);
        });
    }
  }, [instructorId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-white text-3xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  if (!instructor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <img
              src={instructor.image}
              alt={instructor.name}
              className="w-40 h-40 rounded-full object-cover border-4 border-red-600 mb-4"
            />
            <h2 className="text-2xl font-bold mb-1">{instructor.name}</h2>
            <p className="text-red-500 text-lg mb-2">{instructor.title}</p>
            <div className="flex gap-4 mb-4">
              <span className="text-gray-300">{courses.length} Courses</span>
              <span className="text-gray-300">{instructor.experience} Years Exp.</span>
            </div>
            <p className="text-gray-400 text-center mb-4">{instructor.bio}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {instructor.expertise.map((tag: string, i: number) => (
                <span key={i} className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-xs">{tag}</span>
              ))}
            </div>
            {/* Social Links or Favorite Profiles */}
            <div className="flex gap-3 mt-2">
              {/* Example: */}
              {instructor.socialLinks?.linkedin && (
                <a href={instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-red-400">
                  <svg className="w-6 h-6" /* ...linkedin icon... */ />
                </a>
              )}
              {/* Add more icons as needed */}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Featured Courses */}
          <section className="mb-10">
            <h3 className="text-xl font-bold mb-4">Featured Courses</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {courses.filter((c: any) => c.featured).map((course: any) => (
                <div key={course.id} className="min-w-[220px]">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </section>

          {/* All Courses */}
          <section>
            <h3 className="text-xl font-bold mb-4">All Courses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default InstructorPage;