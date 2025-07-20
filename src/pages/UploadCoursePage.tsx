import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeft, Plus, X, Star, User, Info } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate, useSearchParams } from '../lib/router';
import { courses as mockCourses, categories } from '../data/mockData';
import { Instructor } from '../types';

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

  // Load instructors
  useEffect(() => {
    const savedInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
    setInstructors(savedInstructors);
  }, []);

  // Load existing course data if editing
  useEffect(() => {
    if (isEditing && editCourseId) {
      // Check both mock courses and saved courses
      const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const allCourses = [...mockCourses, ...savedCourses];
      const existingCourse = allCourses.find(c => c.id === editCourseId);

      if (existingCourse) {
        console.log('Loading existing course for editing:', existingCourse);
        setTitle(existingCourse.title);
        setDescription(existingCourse.description);
        setCategory(existingCourse.category);
        setThumbnail(existingCourse.thumbnail);
        setBanner(existingCourse.banner);
        setIsComingSoon(existingCourse.comingSoon || false);
        setIsFeatured(existingCourse.featured || false);
        setReleaseDate(existingCourse.releaseDate || '');

        // Check if course has an instructor
        if (existingCourse.instructorId) {
          setUseInstructor(true);
          setSelectedInstructorId(existingCourse.instructorId);
        }

        // Convert lessons to form format
        const lessonForms: LessonForm[] = existingCourse.lessons.map((lesson: any) => ({
          title: lesson.title,
          description: lesson.description,
          thumbnail: lesson.thumbnail,
          videoUrl: lesson.videoUrl
        }));
        setLessons(lessonForms);
      }
    }
  }, [isEditing, editCourseId]);

  // Load saved categories
  useEffect(() => {
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    const allCategories = [...categories, ...savedCategories];
    setAvailableCategories(allCategories);
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

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        name: newCategoryName.trim()
      };

      // Save to localStorage
      const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
      savedCategories.push(newCategory);
      localStorage.setItem('categories', JSON.stringify(savedCategories));

      setAvailableCategories(prev => [...prev, newCategory]);
      setCategory(newCategory.id);
      setNewCategoryName('');
      setShowCreateCategory(false);

      // Log audit event
      logAuditEvent('category_created', `Created new category: ${newCategory.name}`);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Submitting course data...');
    console.log('Is editing:', isEditing);
    console.log('Edit course ID:', editCourseId);

    // Get instructor info
    let instructorInfo;
    if (useInstructor && selectedInstructorId) {
      const instructor = instructors.find(f => f.id === selectedInstructorId);
      if (instructor) {
        instructorInfo = {
          id: instructor.id,
          name: instructor.name,
          title: instructor.title,
          image: instructor.image,
          bio: instructor.bio,
          email: instructor.email,
          phone: instructor.phone,
          expertise: instructor.expertise,
          experience: instructor.experience,
          socialLinks: instructor.socialLinks,
          createdAt: instructor.createdAt
        };
      }
    }

    // Fallback to default instructor if no instructor selected
    if (!instructorInfo) {
      instructorInfo = {
        id: 'instructor-1',
        name: 'Demo Instructor',
        title: 'Expert Educator',
        image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
        bio: 'Experienced professional in the field.',
        email: 'demo@forwardafrica.com',
        expertise: ['General Education'],
        experience: 10,
        createdAt: new Date()
      };
    }

    const courseData = {
      id: isEditing ? editCourseId : `course-${Date.now()}`,
      title,
      description,
      category,
      thumbnail,
      banner,
      comingSoon: isComingSoon,
      featured: isFeatured,
      instructorId: useInstructor ? selectedInstructorId : undefined,
      releaseDate: isComingSoon ? releaseDate : undefined,
      lessons: lessons.map((lesson, index) => ({
        ...lesson,
        id: `lesson-${index + 1}`,
        duration: '10:00', // Default duration since we removed the field
        xpPoints: 100
      })),
      totalXP: lessons.length * 100,
      instructor: instructorInfo
    };

    console.log('Course data to save:', courseData);

    // Save to localStorage (in real app, this would be an API call)
    const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    console.log('Existing courses before save:', existingCourses);

    if (isEditing) {
      const updatedCourses = existingCourses.map((c: any) =>
        c.id === editCourseId ? courseData : c
      );
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      console.log('Updated courses after edit:', updatedCourses);
      logAuditEvent('course_updated', `Updated course: ${title}`);
    } else {
      existingCourses.push(courseData);
      localStorage.setItem('courses', JSON.stringify(existingCourses));
      console.log('Updated courses after add:', existingCourses);
      logAuditEvent('course_created', `Created new course: ${title}`);
    }

    // Force a storage event to trigger updates in other components
    window.dispatchEvent(new Event('storage'));

    navigate('/admin');
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thumbnail Image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter thumbnail URL"
                    required
                  />
                  {thumbnail && (
                    <div className="w-12 h-12 rounded overflow-hidden">
                      <img
                        src={thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Banner Image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter banner URL"
                    required
                  />
                  {banner && (
                    <div className="w-12 h-12 rounded overflow-hidden">
                      <img
                        src={banner}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
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
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Thumbnail URL
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="url"
                              value={lesson.thumbnail}
                              onChange={(e) => updateLesson(index, 'thumbnail', e.target.value)}
                              className="flex-1 px-4 py-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="Enter thumbnail URL"
                              required
                            />
                            {lesson.thumbnail && (
                              <div className="w-12 h-12 rounded overflow-hidden">
                                <img
                                  src={lesson.thumbnail}
                                  alt="Lesson thumbnail preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>

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