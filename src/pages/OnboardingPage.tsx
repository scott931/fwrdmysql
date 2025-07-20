import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { ChevronRight, ChevronLeft, GraduationCap, Briefcase, BookOpen, Star, Check, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/supabase';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    education_level: '',
    job_title: '',
    topics_of_interest: [] as string[]
  });

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const educationLevels = [
    { id: 'high-school', label: 'High School', description: 'Secondary education completed' },
    { id: 'associate', label: 'Associate Degree', description: '2-year college degree' },
    { id: 'bachelor', label: "Bachelor's Degree", description: '4-year university degree' },
    { id: 'master', label: "Master's Degree", description: 'Graduate level education' },
    { id: 'phd', label: 'PhD/Doctorate', description: 'Highest academic degree' },
    { id: 'professional', label: 'Professional Certification', description: 'Industry certifications' },
    { id: 'other', label: 'Other', description: 'Alternative education path' }
  ];

  const topicsOfInterest = [
    { id: 'business-strategy', label: 'Business Strategy', icon: '📊', color: 'from-blue-500 to-blue-600' },
    { id: 'entrepreneurship', label: 'Entrepreneurship', icon: '🚀', color: 'from-purple-500 to-purple-600' },
    { id: 'finance', label: 'Finance & Investment', icon: '💰', color: 'from-green-500 to-green-600' },
    { id: 'marketing', label: 'Marketing & Sales', icon: '📈', color: 'from-pink-500 to-pink-600' },
    { id: 'leadership', label: 'Leadership & Management', icon: '👥', color: 'from-indigo-500 to-indigo-600' },
    { id: 'technology', label: 'Technology & Innovation', icon: '💻', color: 'from-cyan-500 to-cyan-600' },
    { id: 'operations', label: 'Operations & Supply Chain', icon: '⚙️', color: 'from-orange-500 to-orange-600' },
    { id: 'hr', label: 'Human Resources', icon: '🤝', color: 'from-teal-500 to-teal-600' },
    { id: 'legal', label: 'Legal & Compliance', icon: '⚖️', color: 'from-gray-500 to-gray-600' },
    { id: 'personal-dev', label: 'Personal Development', icon: '🌟', color: 'from-yellow-500 to-yellow-600' },
    { id: 'industry', label: 'Industry-Specific Knowledge', icon: '🏭', color: 'from-red-500 to-red-600' },
    { id: 'digital', label: 'Digital Transformation', icon: '🔄', color: 'from-violet-500 to-violet-600' }
  ];

  const handleTopicToggle = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      topics_of_interest: prev.topics_of_interest.includes(topicId)
        ? prev.topics_of_interest.filter(t => t !== topicId)
        : [...prev.topics_of_interest, topicId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      await updateUserProfile(user.id, {
        ...formData,
        onboarding_completed: true,
        full_name: user.full_name || user.email?.split('@')[0] || '',
        avatar_url: user.avatar_url || '',
        email: user.email
      });

      // Refresh the user profile by calling updateProfile
      await updateProfile(user.id, {
        ...formData,
        onboarding_completed: true,
        full_name: user.full_name || user.email?.split('@')[0] || '',
        avatar_url: user.avatar_url || '',
        email: user.email
      });

      navigate('/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.education_level !== '';
      case 2:
        return formData.job_title.trim() !== '';
      case 3:
        return formData.topics_of_interest.length > 0;
      default:
        return false;
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return GraduationCap;
      case 2: return Briefcase;
      case 3: return BookOpen;
      default: return GraduationCap;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "What's your education background?";
      case 2: return "What's your current role?";
      case 3: return "What interests you most?";
      default: return "";
    }
  };

  const getStepSubtitle = (step: number) => {
    switch (step) {
      case 1: return "Help us understand your learning foundation";
      case 2: return "We'll personalize your experience based on your role";
      case 3: return "Choose topics that align with your goals";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-purple-900/20"></div>

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Onboarding Header */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-red-600 font-bold text-2xl tracking-tight">FORWARD</span>
            <span className="text-white font-bold text-2xl tracking-tight">AFRICA</span>
          </div>
          <div className="text-gray-400 text-sm">
            Step {currentStep} of 3
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => {
                const Icon = getStepIcon(step);
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;

                return (
                  <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'border-red-500 bg-red-500 text-white'
                        : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-600 bg-gray-800 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-600'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {getStepTitle(currentStep)}
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {getStepSubtitle(currentStep)}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800">
            {currentStep === 1 && (
              <div className="space-y-4">
                {educationLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setFormData(prev => ({ ...prev, education_level: level.id }))}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                      formData.education_level === level.id
                        ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-lg font-semibold mb-1 transition-colors ${
                          formData.education_level === level.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                        }`}>
                          {level.label}
                        </h3>
                        <p className="text-gray-400 text-sm">{level.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                        formData.education_level === level.id
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-600 group-hover:border-gray-500'
                      }`}>
                        {formData.education_level === level.id && (
                          <Check className="h-3 w-3 text-white m-0.5" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="e.g., Marketing Manager, Entrepreneur, Student, CEO"
                    className="w-full px-6 py-6 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-gray-800 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-purple-500/20 opacity-0 transition-opacity duration-300 pointer-events-none focus-within:opacity-100" />
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'CEO', 'Entrepreneur', 'Manager', 'Director', 'Consultant', 'Student',
                    'Analyst', 'Coordinator', 'Specialist', 'Executive', 'Founder', 'Other'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setFormData(prev => ({ ...prev, job_title: suggestion }))}
                      className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 hover:bg-gray-800 transition-all duration-200 text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {topicsOfInterest.map((topic) => {
                    const isSelected = formData.topics_of_interest.includes(topic.id);

                    return (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicToggle(topic.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                          isSelected
                            ? 'border-red-500 bg-gradient-to-br from-red-500/20 to-red-600/20 shadow-lg shadow-red-500/20'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl">{topic.icon}</div>
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-600 group-hover:border-gray-500'
                          }`}>
                            {isSelected && (
                              <Check className="h-3 w-3 text-white m-0.5" />
                            )}
                          </div>
                        </div>
                        <h3 className={`font-semibold transition-colors ${
                          isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                        }`}>
                          {topic.label}
                        </h3>
                      </button>
                    );
                  })}
                </div>

                {formData.topics_of_interest.length > 0 && (
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      {formData.topics_of_interest.length} topic{formData.topics_of_interest.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center ${currentStep === 1 ? 'invisible' : ''}`}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex-1 flex justify-center">
                <div className="flex space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        step === currentStep
                          ? 'bg-red-500 w-8'
                          : step < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {currentStep < 3 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className="flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25"
                >
                  Complete Setup
                  <Star className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Your information helps us create a personalized learning experience
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingPage;