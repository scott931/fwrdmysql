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

  const featuredCourses = courses.filter((course: any) => course.featured);
  const allCourses = courses;

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
            {/* Social Links */}
            <div className="flex gap-3 mt-2">
              {instructor.socialLinks?.linkedin && (
                <a href={instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-red-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z"/></svg>
                </a>
              )}
              {instructor.socialLinks?.twitter && (
                <a href={instructor.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-red-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482c-4.086-.205-7.713-2.164-10.141-5.144a4.822 4.822 0 0 0-.666 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636a9.936 9.936 0 0 0 2.457-2.548z"/></svg>
                </a>
              )}
              {instructor.socialLinks?.website && (
                <a href={instructor.socialLinks.website} target="_blank" rel="noopener noreferrer" className="hover:text-red-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm0-18c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z"/></svg>
                </a>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Featured Courses */}
          <section className="mb-10">
            <h3 className="text-xl font-bold mb-4">Featured Courses</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {featuredCourses.length > 0 ? featuredCourses.map((course: any) => (
                <div key={course.id} className="min-w-[220px]">
                  <CourseCard course={course} />
                </div>
              )) : (
                <div className="text-gray-400">No featured courses.</div>
              )}
            </div>
          </section>

          {/* All Courses */}
          <section>
            <h3 className="text-xl font-bold mb-4">All Courses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allCourses.length > 0 ? allCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              )) : (
                <div className="text-gray-400">No courses available yet.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default InstructorPage;