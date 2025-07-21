import { Category, Course, Instructor } from '../types';

export const categories: Category[] = [
  { id: 'business', name: 'Business' },
  { id: 'entrepreneurship', name: 'Entrepreneurship' },
  { id: 'finance', name: 'Finance' },
  { id: 'personal-development', name: 'Personal Development' },
  { id: 'technology', name: 'Technology' },
];

export const instructors: Instructor[] = [
  {
    id: 'ray-dalio',
    name: 'Ray Dalio',
    title: 'Founder of Bridgewater Associates',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bio: 'Ray Dalio is the founder of Bridgewater Associates, one of the world\'s largest hedge funds. His principles for success have influenced business leaders worldwide.',
    email: 'ray.dalio@forwardafrica.com',
    phone: '+1-555-0101',
    expertise: ['Investment Strategy', 'Business Principles', 'Economic Analysis'],
    experience: 45,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/raydalio',
      twitter: 'https://twitter.com/raydalio',
      website: 'https://principles.com'
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'sara-blakely',
    name: 'Sara Blakely',
    title: 'Founder of SPANX',
    image: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bio: 'Sara Blakely is the founder of SPANX and the youngest self-made female billionaire. She revolutionized the shapewear industry through innovative entrepreneurship.',
    email: 'sara.blakely@forwardafrica.com',
    phone: '+1-555-0102',
    expertise: ['Entrepreneurship', 'Product Development', 'Brand Building'],
    experience: 25,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarablakely',
      twitter: 'https://twitter.com/sarablakely'
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'howard-marks',
    name: 'Howard Marks',
    title: 'Co-founder of Oaktree Capital',
    image: 'https://images.pexels.com/photos/5439367/pexels-photo-5439367.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bio: 'Howard Marks is the co-founder of Oaktree Capital Management and a renowned expert in investment strategy and market cycles.',
    email: 'howard.marks@forwardafrica.com',
    phone: '+1-555-0103',
    expertise: ['Investment Management', 'Market Cycles', 'Risk Assessment'],
    experience: 50,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/howardmarks',
      website: 'https://oaktreecapital.com'
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'brene-brown',
    name: 'Brené Brown',
    title: 'Leadership Researcher & Author',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bio: 'Brené Brown is a research professor and bestselling author known for her work on leadership, courage, and vulnerability.',
    email: 'brene.brown@forwardafrica.com',
    phone: '+1-555-0104',
    expertise: ['Leadership', 'Vulnerability', 'Courage', 'Team Building'],
    experience: 20,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/brenebrown',
      twitter: 'https://twitter.com/brenebrown',
      website: 'https://brenebrown.com'
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    title: 'CEO of Tesla & SpaceX',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bio: 'Elon Musk is a technology entrepreneur and business magnate known for founding and leading multiple groundbreaking companies including Tesla, SpaceX, and Neuralink.',
    email: 'elon.musk@forwardafrica.com',
    phone: '+1-555-0105',
    expertise: ['Innovation', 'Technology', 'Space Exploration', 'Electric Vehicles', 'Artificial Intelligence'],
    experience: 25,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/elonmusk',
      twitter: 'https://twitter.com/elonmusk',
      website: 'https://tesla.com'
    },
    createdAt: new Date('2024-01-01')
  },
];

export const courses: Course[] = [
  {
    id: 'business-fundamentals',
    title: 'Business Fundamentals & Essentials',
    instructor: instructors[0],
    instructorId: instructors[0].id,
    category: 'business',
    thumbnail: 'https://images.pexels.com/photos/7681118/pexels-photo-7681118.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://youtu.be/q5_PrTvNypY',
    description: 'Master the core principles of business with Ray Dalio. Learn strategic thinking, decision-making, and organizational leadership that drove Bridgewater\'s success.',
    featured: true,
    lessons: [
      {
        id: 'lesson-1',
        title: 'Understanding Business Fundamentals',
        duration: '32:15',
        thumbnail: 'https://images.pexels.com/photos/7681891/pexels-photo-7681891.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Ray introduces the essential components of successful business operations and the foundational principles that every entrepreneur needs to understand.',
        xpPoints: 100
      },
      {
        id: 'lesson-2',
        title: 'Strategic Decision Making',
        duration: '41:30',
        thumbnail: 'https://images.pexels.com/photos/7681866/pexels-photo-7681866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        description: 'Learn how to make effective business decisions using proven frameworks and analytical thinking processes.',
        xpPoints: 100
      },
      {
        id: 'lesson-3',
        title: 'Building High-Performance Teams',
        duration: '38:45',
        thumbnail: 'https://images.pexels.com/photos/7681892/pexels-photo-7681892.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        description: 'Discover the secrets to creating and managing teams that consistently deliver exceptional results.',
        xpPoints: 100
      },
      {
        id: 'lesson-4',
        title: 'Financial Management Essentials',
        duration: '45:20',
        thumbnail: 'https://images.pexels.com/photos/7681893/pexels-photo-7681893.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
        description: 'Master the fundamentals of business finance, cash flow management, and financial planning strategies.',
        xpPoints: 100
      },
      {
        id: 'lesson-5',
        title: 'Scaling Your Business',
        duration: '52:10',
        thumbnail: 'https://images.pexels.com/photos/7681894/pexels-photo-7681894.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        description: 'Learn proven strategies for scaling your business operations while maintaining quality and culture.',
        xpPoints: 100
      }
    ],
    totalXP: 500,
    comingSoon: false
  },
  {
    id: 'innovation-masterclass',
    title: 'Innovation & Technology Leadership',
    instructor: instructors[4], // Elon Musk
    instructorId: instructors[4].id,
    category: 'technology',
    thumbnail: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/3861959/pexels-photo-3861959.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    description: 'Learn from Elon Musk about innovation, technology leadership, and building companies that change the world. Discover the mindset and strategies behind Tesla, SpaceX, and other revolutionary ventures.',
    featured: true,
    lessons: [
      {
        id: 'lesson-1',
        title: 'First Principles Thinking',
        duration: '28:30',
        thumbnail: 'https://images.pexels.com/photos/3861960/pexels-photo-3861960.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=NV3sBlRgzTI',
        description: 'Master the art of first principles thinking to break down complex problems and find innovative solutions.',
        xpPoints: 120
      },
      {
        id: 'lesson-2',
        title: 'Building Revolutionary Products',
        duration: '35:45',
        thumbnail: 'https://images.pexels.com/photos/3861961/pexels-photo-3861961.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=t705r8ICkRw',
        description: 'Learn how to design and develop products that fundamentally change industries and create new markets.',
        xpPoints: 120
      },
      {
        id: 'lesson-3',
        title: 'Managing Risk in Innovation',
        duration: '42:15',
        thumbnail: 'https://images.pexels.com/photos/3861962/pexels-photo-3861962.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=H7Uyfqi_TE8',
        description: 'Understand how to balance bold innovation with calculated risk management in high-stakes ventures.',
        xpPoints: 120
      },
      {
        id: 'lesson-4',
        title: 'Leading Through Disruption',
        duration: '39:20',
        thumbnail: 'https://images.pexels.com/photos/3861963/pexels-photo-3861963.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=wsixsRI-Sz4',
        description: 'Discover leadership strategies for navigating uncertainty and driving change in rapidly evolving industries.',
        xpPoints: 120
      }
    ],
    totalXP: 480,
    comingSoon: false
  },
  {
    id: 'business-administration',
    title: 'Business Administration & Management',
    instructor: instructors[0],
    instructorId: instructors[0].id,
    category: 'business',
    thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Comprehensive guide to business administration, covering management principles, organizational behavior, and leadership strategies.',
    featured: false,
    lessons: [],
    totalXP: 0,
    comingSoon: true,
    releaseDate: '2024-03-15'
  },
  {
    id: 'entrepreneurship-essentials',
    title: 'Entrepreneurship Essentials',
    instructor: instructors[1],
    instructorId: instructors[1].id,
    category: 'entrepreneurship',
    thumbnail: 'https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/7413916/pexels-photo-7413916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Master the fundamentals of entrepreneurship with Sara Blakely. Learn essential skills and mindsets for business success.',
    featured: true,
    lessons: [],
    totalXP: 0,
    comingSoon: true,
    releaseDate: '2024-02-28'
  },
  {
    id: 'venture-creation',
    title: 'Venture Creation & Launching Your Startup',
    instructor: instructors[1],
    instructorId: instructors[1].id,
    category: 'entrepreneurship',
    thumbnail: 'https://images.pexels.com/photos/7005691/pexels-photo-7005691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/7005934/pexels-photo-7005934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Sara Blakely shares her journey of building SPANX and teaches you how to turn your idea into a successful business venture.',
    featured: true,
    lessons: [],
    totalXP: 0,
    comingSoon: true,
    releaseDate: '2024-04-10'
  },
  {
    id: 'business-model-design',
    title: 'Business Model Design & Innovation',
    instructor: instructors[1],
    instructorId: instructors[1].id,
    category: 'entrepreneurship',
    thumbnail: 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/8867483/pexels-photo-8867483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Learn to design and innovate business models that create sustainable competitive advantages.',
    featured: false,
    lessons: [],
    totalXP: 0,
    comingSoon: true,
    releaseDate: '2024-05-20'
  },
  {
    id: 'personal-finance-101',
    title: 'Personal Finance 101',
    instructor: instructors[2],
    instructorId: instructors[2].id,
    category: 'finance',
    thumbnail: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/3943717/pexels-photo-3943717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Master the fundamentals of personal finance with Howard Marks. Learn budgeting, saving, and building long-term wealth.',
    featured: true,
    lessons: [],
    totalXP: 0,
    comingSoon: true,
    releaseDate: '2024-03-01'
  },
  {
    id: 'investment-fundamentals',
    title: 'Investment Fundamentals',
    instructor: instructors[2],
    instructorId: instructors[2].id,
    category: 'finance',
    thumbnail: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/6801647/pexels-photo-6801647.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Howard Marks teaches you the principles of successful investing, from market cycles to risk management.',
    featured: true,
    lessons: [],
    totalXP: 0,
    comingSoon: true,
    releaseDate: '2024-04-15'
  },
  {
    id: 'leadership-skills',
    title: 'Leadership & Management Skills',
    instructor: instructors[3],
    instructorId: instructors[3].id,
    category: 'personal-development',
    thumbnail: 'https://images.pexels.com/photos/6592626/pexels-photo-6592626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    banner: 'https://images.pexels.com/photos/6592567/pexels-photo-6592567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Brené Brown teaches you how to lead with courage, build resilient teams, and create a culture of belonging.',
    featured: true,
    lessons: [
      {
        id: 'lesson-1',
        title: 'Courageous Leadership',
        duration: '39:30',
        thumbnail: 'https://images.pexels.com/photos/6592627/pexels-photo-6592627.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
        description: 'Learn the principles of leading with courage and authenticity in challenging times.',
        xpPoints: 100
      },
      {
        id: 'lesson-2',
        title: 'Building Resilient Teams',
        duration: '44:15',
        thumbnail: 'https://images.pexels.com/photos/6592628/pexels-photo-6592628.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=psN1DORYYV0',
        description: 'Develop strategies for creating and maintaining high-performing teams that thrive under pressure.',
        xpPoints: 100
      },
      {
        id: 'lesson-3',
        title: 'Vulnerability in Leadership',
        duration: '36:50',
        thumbnail: 'https://images.pexels.com/photos/6592629/pexels-photo-6592629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        videoUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
        description: 'Understand how vulnerability can be a strength in leadership and team building.',
        xpPoints: 100
      }
    ],
    totalXP: 300,
    comingSoon: false
  },
];

// Safe localStorage access for SSR
const getLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

// Initialize data from localStorage if available
export const initializeMockData = () => {
  const savedCourses = getLocalStorage('courses');
  const savedCategories = getLocalStorage('categories');
  const savedInstructors = getLocalStorage('instructors');

  if (savedCourses) {
    try {
      const parsedCourses = JSON.parse(savedCourses);
      // Clean up any courses with incorrect instructor IDs and save back to localStorage
      const cleanedCourses = parsedCourses.map((course: any) => {
        if (course.instructorId && course.instructorId.startsWith('inst')) {
          const instructorIdMap: { [key: string]: string } = {
            'inst1': 'ray-dalio',
            'inst2': 'sara-blakely',
            'inst3': 'howard-marks',
            'inst4': 'brene-brown',
            'inst5': 'elon-musk'
          };

          if (instructorIdMap[course.instructorId]) {
            course.instructorId = instructorIdMap[course.instructorId];
            // Also update the instructor object if it exists
            if (course.instructor) {
              const correctInstructor = instructors.find(inst => inst.id === course.instructorId);
              if (correctInstructor) {
                course.instructor = correctInstructor;
              }
            }
          }
        }
        return course;
      });

      // Save cleaned courses back to localStorage
      setLocalStorage('courses', JSON.stringify(cleanedCourses));
      courses.push(...cleanedCourses);
    } catch (error) {
      console.error('Error parsing saved courses:', error);
    }
  }

  if (savedCategories) {
    try {
      categories.push(...JSON.parse(savedCategories));
    } catch (error) {
      console.error('Error parsing saved categories:', error);
    }
  }

  if (savedInstructors) {
    try {
      instructors.push(...JSON.parse(savedInstructors));
    } catch (error) {
      console.error('Error parsing saved instructors:', error);
    }
  }
};

// Helper functions to get all courses including saved ones
export const getAllCourses = () => {
  try {
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');

    // Clean up any courses with incorrect instructor IDs
    const cleanedSavedCourses = savedCourses.map((course: any) => {
      if (course.instructorId && course.instructorId.startsWith('inst')) {
        // Map old instructor IDs to correct ones
        const instructorIdMap: { [key: string]: string } = {
          'inst1': 'ray-dalio',
          'inst2': 'sara-blakely',
          'inst3': 'howard-marks',
          'inst4': 'brene-brown',
          'inst5': 'elon-musk'
        };

        if (instructorIdMap[course.instructorId]) {
          course.instructorId = instructorIdMap[course.instructorId];
          // Also update the instructor object if it exists
          if (course.instructor) {
            const correctInstructor = instructors.find(inst => inst.id === course.instructorId);
            if (correctInstructor) {
              course.instructor = correctInstructor;
            }
          }
        }
      }
      return course;
    });

    return [...courses, ...cleanedSavedCourses];
  } catch (error) {
    console.error('Error loading saved courses:', error);
    return courses;
  }
};

// Helper functions to get all categories including saved ones
export const getAllCategories = () => {
  try {
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    return [...categories, ...savedCategories];
  } catch (error) {
    console.error('Error loading saved categories:', error);
    return categories;
  }
};

// Helper functions to get all instructors including saved ones
export const getAllInstructors = () => {
  try {
    const savedInstructors = JSON.parse(localStorage.getItem('instructors') || '[]').map((inst: any) => ({
      ...inst,
      createdAt: inst.createdAt ? new Date(inst.createdAt) : new Date(),
    }));
    const allInstructors = [...instructors, ...savedInstructors];
    // Deduplicate by id
    const unique = allInstructors.filter(
      (inst, idx, arr) => arr.findIndex(i => i.id === inst.id) === idx
    );
    return unique;
  } catch (error) {
    console.error('Error loading saved instructors:', error);
    return instructors;
  }
};

export const getFeaturedCourses = () => {
  const allCourses = getAllCourses();
  return allCourses.filter(course => course.featured);
};

export const getCoursesByCategory = (categoryId: string) => {
  const allCourses = getAllCourses();
  return allCourses.filter(course => course.category === categoryId);
};

export const getCourseById = (courseId: string) => {
  const allCourses = getAllCourses();
  return allCourses.find(course => course.id === courseId);
};

export const getInstructorById = (instructorId: string) => {
  const allInstructors = getAllInstructors();
  return allInstructors.find(instructor => instructor.id === instructorId);
};

export const getCoursesByInstructor = (instructorId: string) => {
  const allCourses = getAllCourses();
  return allCourses.filter(course => course.instructorId === instructorId);
};