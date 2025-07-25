import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeft, Plus, X, Star, User, Info } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate, useSearchParams } from '../lib/router';
import { courses as mockCourses, categories } from '../data/mockData';
import { Instructor } from '../types';
import ImageUpload from '../components/ui/ImageUpload';

interface LessonForm {
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
}

const UploadCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCourseId = searchParams.get('edit');
  const isEditing = !!editCourseId;

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [isComingSoon, setIsComingSoon] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [useInstructor, setUseInstructor] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [banner, setBanner] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [lessons, setLessons] = useState<LessonForm[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Load instructors from backend
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/instructors');
        if (response.ok) {
          const data = await response.json();
          setInstructors(data);
        } else {
          console.error('Failed to load instructors');
        }
      } catch (error) {
        console.error('Error loading instructors:', error);
      }
    };
    loadInstructors();
  }, []);

  // Load existing course data if editing
  useEffect(() => {
    if (isEditing && editCourseId) {
      const loadCourse = async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/courses/${editCourseId}`);
          if (response.ok) {
            const existingCourse = await response.json();
            console.log('Loading existing course for editing:', existingCourse);

            setTitle(existingCourse.title);
            setDescription(existingCourse.description);
            setCategory(existingCourse.category_id);
            setThumbnail(existingCourse.thumbnail);
            setBanner(existingCourse.banner);
            setIsComingSoon(existingCourse.coming_soon || false);
            setIsFeatured(existingCourse.featured || false);
            setReleaseDate(existingCourse.release_date || '');

            // Check if course has an instructor
            if (existingCourse.instructor_id) {
              setUseInstructor(true);
              setSelectedInstructorId(existingCourse.instructor_id);
            }

            // Load lessons for this course
            const lessonsResponse = await fetch(`http://localhost:3002/api/lessons/${editCourseId}`);
            if (lessonsResponse.ok) {
              const lessonsData = await lessonsResponse.json();
              const lessonForms: LessonForm[] = lessonsData.map((lesson: any) => ({
                title: lesson.title,
                description: lesson.description,
                thumbnail: lesson.thumbnail,
                videoUrl: lesson.video_url
              }));
              setLessons(lessonForms);
            }
          } else {
            console.error('Failed to load course for editing');
          }
        } catch (error) {
          console.error('Error loading course for editing:', error);
        }
      };
      loadCourse();
    }
  }, [isEditing, editCourseId]);

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/categories');
        if (response.ok) {
          const data = await response.json();
          setAvailableCategories(data);
        } else {
          console.error('Failed to load categories');
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: '',
        description: '',
        thumbnail: '',
        videoUrl: ''
      }
    ]);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const updateLesson = (index: number, field: keyof LessonForm, value: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = {
      ...updatedLessons[index],
      [field]: value
    };
    setLessons(updatedLessons);
  };

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const newCategory = {
          id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
          name: newCategoryName.trim()
        };

        // Create category in backend
        const response = await fetch('http://localhost:3002/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory)
        });

        if (response.ok) {
          setAvailableCategories(prev => [...prev, newCategory]);
          setCategory(newCategory.id);
          setNewCategoryName('');
          setShowCreateCategory(false);

          // Log audit event
          logAuditEvent('category_created', `Created new category: ${newCategory.name}`);
        } else {
          console.error('Failed to create category');
          alert('Failed to create category. Please try again.');
        }
      } catch (error) {
        console.error('Error creating category:', error);
        alert('Failed to create category. Please try again.');
      }
    }
  };

  const logAuditEvent = (action: string, details: string) => {
    const auditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('adminEmail') || 'Unknown',
      action,
      details,
      ipAddress: '192.168.1.100' // Mock IP
    };

    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.unshift(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000))); // Keep last 1000 logs
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Submitting course data to backend...');
    console.log('Is editing:', isEditing);
    console.log('Edit course ID:', editCourseId);

    try {
      // Get instructor info
      let instructorId = 'instructor-1'; // Default instructor
      if (useInstructor && selectedInstructorId) {
        instructorId = selectedInstructorId;
      }

      // Prepare course data for backend
      const courseData = {
        title,
        description,
        instructor_id: instructorId,
        category_id: category,
        thumbnail,
        banner,
        video_url: '', // Will be set by lessons
        featured: isFeatured,
        total_xp: lessons.length * 100
      };

      console.log('Course data to save:', courseData);

      // Create course in backend
      const courseResponse = await fetch('http://localhost:3002/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      });

      if (!courseResponse.ok) {
        const errorData = await courseResponse.json();
        throw new Error(errorData.error || 'Failed to create course');
      }

      const courseResult = await courseResponse.json();
      const courseId = courseResult.id;

      console.log('Course created with ID:', courseId);

      // Create lessons for the course
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const lessonData = {
          course_id: courseId,
          title: lesson.title,
          duration: '10:00',
          thumbnail: lesson.thumbnail,
          video_url: lesson.videoUrl,
          description: lesson.description,
          xp_points: 100,
          order_index: i
        };

        const lessonResponse = await fetch('http://localhost:3002/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonData)
        });

        if (!lessonResponse.ok) {
          const errorData = await lessonResponse.json();
          console.error('Failed to create lesson:', errorData);
          // Continue with other lessons even if one fails
        } else {
          const lessonResult = await lessonResponse.json();
          console.log('Lesson created with ID:', lessonResult.id);
        }
      }

      console.log('Course and lessons created successfully');
      logAuditEvent('course_created', `Created new course: ${title}`);

      // Navigate back to admin page
      navigate('/admin');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Edit Course' : 'Upload New Course'}
          </h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter course description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <div className="flex space-x-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select a category</option>
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateCategory(true)}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </div>
            </div>

            {/* Instructor Selection */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useInstructor"
                  checked={useInstructor}
                  onChange={(e) => {
                    setUseInstructor(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedInstructorId('');
                    }
                  }}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="useInstructor" className="ml-2 text-gray-300 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Assign to Instructor
                </label>
              </div>

              {useInstructor && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Instructor
                  </label>
                  {instructors.length > 0 ? (
                    <select
                      value={selectedInstructorId}
                      onChange={(e) => setSelectedInstructorId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required={useInstructor}
                    >
                      <option value="">Choose an instructor</option>
                      {instructors.map(instructor => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name} - {instructor.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-gray-700 border border-gray-600 rounded-md p-4">
                      <p className="text-gray-400 text-sm mb-3">
                        No instructors available. You need to add instructors first.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/add-instructor')}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Instructor
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Create Category Modal */}
            {showCreateCategory && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold text-white mb-4">Create New Category</h3>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                  />
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateCategory(false);
                        setNewCategoryName('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleCreateCategory}
                      className="flex-1"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Course Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload
                onImageUpload={setThumbnail}
                currentImage={thumbnail}
                uploadType="courseThumbnail"
                label="Course Thumbnail"
                previewSize="sm"
                required
              />

              <ImageUpload
                onImageUpload={setBanner}
                currentImage={banner}
                uploadType="courseBanner"
                label="Course Banner"
                previewSize="sm"
                required
              />
            </div>

            {/* Course Settings */}
            <div className="space-y-4">
              {/* Coming Soon Settings */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="comingSoon"
                  checked={isComingSoon}
                  onChange={(e) => setIsComingSoon(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="comingSoon" className="ml-2 text-gray-300">
                  Mark as "Coming Soon"
                </label>
              </div>

              {/* Featured Course Settings */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="featured" className="ml-2 text-gray-300 flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  Add to Featured Classes
                </label>
              </div>
            </div>

            {isComingSoon && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Release Date
                </label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            )}

            {/* Lessons Section */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Lessons</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLesson}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </Button>
              </div>

              <div className="space-y-6">
                {lessons.map((lesson, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-6 relative">
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Lesson Title
                        </label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Enter lesson title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={lesson.description}
                          onChange={(e) => updateLesson(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Enter lesson description"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImageUpload
                          onImageUpload={(url) => updateLesson(index, 'thumbnail', url)}
                          currentImage={lesson.thumbnail}
                          uploadType="lessonThumbnail"
                          label="Lesson Thumbnail"
                          previewSize="sm"
                          required
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                            Video URL
                            <div className="ml-2 group relative">
                              <Info className="h-4 w-4 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Supports YouTube URLs and direct video files (MP4, WebM, etc.)
                              </div>
                            </div>
                          </label>
                          <input
                            type="url"
                            value={lesson.videoUrl}
                            onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter YouTube URL or direct video file URL"
                            required
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            YouTube URLs will be automatically embedded. Direct video files (MP4, WebM) will use the custom player.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex items-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                {isEditing ? 'Update Course' : 'Upload Course'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadCoursePage;