import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CourseCard from '../components/ui/CourseCard';
import { getCoursesByCategory, getAllCategories } from '../data/mockData';
import { Course, Category } from '../types';

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { categoryId } = router.query;
  const [courses, setCourses] = useState<Course[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId && typeof categoryId === 'string') {
      const allCategories = getAllCategories();
      const foundCategory = allCategories.find(cat => cat.id === categoryId);
      if (foundCategory) {
        setCategory(foundCategory);
        const categoryCourses = getCoursesByCategory(categoryId);
        setCourses(categoryCourses);
      } else {
        // Try to find by name if not found by ID
        const foundByName = allCategories.find(cat => cat.name.toLowerCase() === categoryId.toLowerCase());
        if (foundByName) {
          setCategory(foundByName);
          const categoryCourses = getCoursesByCategory(foundByName.id);
          setCourses(categoryCourses);
        } else {
          // Redirect to courses page if category not found
          router.push('/courses');
        }
      }
      setLoading(false);
    }
  }, [categoryId, router]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-white text-3xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-white text-3xl font-bold mb-6">Category Not Found</h1>
        <button
          onClick={() => router.push('/')}
          className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-white text-4xl font-bold mb-4">{category.name}</h1>
        <p className="text-gray-300 max-w-3xl">
          Explore our collection of {category.name.toLowerCase()} classes taught by world-renowned experts.
          Master new skills and unlock your potential with in-depth lessons and hands-on projects.
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-white text-2xl font-medium mb-4">No courses available in this category yet</h2>
          <p className="text-gray-400 text-center max-w-md mb-8">
            We're working on bringing you amazing content in this category.
            Check back soon for new classes!
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
          >
            Explore Other Categories
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;