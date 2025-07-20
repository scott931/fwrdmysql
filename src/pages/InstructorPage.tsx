import React, { useEffect } from 'react';
import { useParams, useNavigate } from '../lib/router';
import { getAllCourses, getInstructorById, getCoursesByInstructor } from '../data/mockData';
import CourseCard from '../components/ui/CourseCard';
import Button from '../components/ui/Button';
import { Calendar, Award, Users, ExternalLink } from 'lucide-react';

const InstructorPage: React.FC = () => {
  const { instructorId } = useParams<{ instructorId: string }>();
  const navigate = useNavigate();

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const instructor = instructorId ? getInstructorById(instructorId) : null;
  const instructorCourses = instructorId ? getCoursesByInstructor(instructorId) : [];

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-white text-3xl font-bold mb-6">Instructor Not Found</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Instructor Hero */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black"></div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
              {/* Instructor Image */}
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-red-600">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Instructor Info */}
              <div className="text-center md:text-left max-w-2xl">
                <h1 className="text-white text-4xl md:text-5xl font-bold mb-2">{instructor.name}</h1>
                <p className="text-red-500 text-xl font-medium mb-6">{instructor.title}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-300">{instructorCourses.length} Classes</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-300">{instructor.experience} Years Experience</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-300">Expert Instructor</span>
                  </div>
                </div>

                <p className="text-gray-300 mb-8 leading-relaxed">{instructor.bio}</p>

                {/* Expertise Tags */}
                {instructor.expertise && instructor.expertise.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-white font-medium mb-3">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {instructor.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {instructor.socialLinks && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                    {instructor.socialLinks.linkedin && (
                      <a
                        href={instructor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-300 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    )}
                    {instructor.socialLinks.twitter && (
                      <a
                        href={instructor.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-300 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Twitter
                      </a>
                    )}
                    {instructor.socialLinks.website && (
                      <a
                        href={instructor.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-300 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <Button variant="primary" size="lg">Subscribe to All Classes</Button>
                  <Button variant="outline" size="lg">Contact Instructor</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Classes */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-white text-3xl font-bold mb-8">Classes by {instructor.name}</h2>

        {instructorCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {instructorCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="text-white text-2xl font-medium mb-4">No classes available yet</h3>
            <p className="text-gray-400 text-center max-w-md mb-8">
              We're working on bringing you amazing content from this instructor.
              Check back soon for new classes!
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="primary"
            >
              Explore Other Instructors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorPage;