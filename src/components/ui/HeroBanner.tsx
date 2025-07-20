import React, { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import Button from './Button';
import { Course } from '../../types';

interface HeroBannerProps {
  course: Course;
  onPlay: (courseId: string) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ course, onPlay }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const videoUrl = course.videoUrl || 'https://youtu.be/q5_PrTvNypY';

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    } else if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    }
    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVideoLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoError = () => {
    setIsVideoError(true);
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        {!isVideoError && embedUrl ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="object-cover w-full h-full"
            style={{ opacity: isVideoLoaded ? 1 : 0 }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={handleVideoError}
          />
        ) : (
          <img
            src={course.banner || '/placeholder-course.jpg'}
            alt={course.title || 'Course Banner'}
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-course.jpg';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col items-start">
        <span className="text-sm md:text-base text-red-500 font-semibold mb-2">FEATURED MASTER CLASS</span>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{course.title || 'Featured Course'}</h1>
        {course.instructor && (
          <div className="flex items-center mb-4">
            <img
              src={course.instructor.image || '/placeholder-avatar.jpg'}
              alt={course.instructor.name || 'Instructor'}
              className="w-10 h-10 rounded-full object-cover mr-3"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-avatar.jpg';
              }}
            />
            <div>
              <p className="text-white font-medium">{course.instructor.name || 'Unknown Instructor'}</p>
              <p className="text-gray-300 text-sm">{course.instructor.title || 'Course Instructor'}</p>
            </div>
          </div>
        )}
        <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-6">{course.description || 'Learn from industry experts and advance your skills with our comprehensive course.'}</p>
        <div className="flex space-x-4">
          <Button
            onClick={() => onPlay(course.id || 'default-course')}
            variant="primary"
            size="lg"
            className="group"
          >
            <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Watch First Lesson
          </Button>
          <Button variant="outline" size="lg">More Info</Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;