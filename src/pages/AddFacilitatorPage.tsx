import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Phone, Globe, Plus, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate, useSearchParams } from '../lib/router';
import { Instructor } from '../types';

const AddInstructorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editInstructorId = searchParams.get('edit');
  const isEditing = !!editInstructorId;

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    bio: '',
    image: '',
    experience: 0,
    expertise: [] as string[],
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  const [newExpertise, setNewExpertise] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing instructor data if editing
  useEffect(() => {
    if (isEditing && editInstructorId) {
      const savedInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
      const existingInstructor = savedInstructors.find((f: Instructor) => f.id === editInstructorId);

      if (existingInstructor) {
        setFormData({
          name: existingInstructor.name,
          title: existingInstructor.title,
          email: existingInstructor.email,
          phone: existingInstructor.phone || '',
          bio: existingInstructor.bio,
          image: existingInstructor.image,
          experience: existingInstructor.experience,
          expertise: existingInstructor.expertise,
          socialLinks: existingInstructor.socialLinks || {
            linkedin: '',
            twitter: '',
            website: ''
          }
        });
      }
    }
  }, [isEditing, editInstructorId]);

  const logAuditEvent = (action: string, details: string) => {
    const auditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('adminEmail') || 'Unknown',
      action,
      details,
      ipAddress: '192.168.1.100'
    };

    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.unshift(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000)));
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const handleRemoveExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const instructorData: Instructor = {
        id: isEditing ? editInstructorId! : `instructor-${Date.now()}`,
        name: formData.name,
        title: formData.title,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        image: formData.image,
        experience: formData.experience,
        expertise: formData.expertise,
        socialLinks: formData.socialLinks,
        createdAt: new Date()
      };

      const savedInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');

      if (isEditing) {
        const updatedInstructors = savedInstructors.map((f: Instructor) =>
          f.id === editInstructorId ? instructorData : f
        );
        localStorage.setItem('instructors', JSON.stringify(updatedInstructors));
        logAuditEvent('instructor_updated', `Updated instructor: ${formData.name}`);
      } else {
        savedInstructors.push(instructorData);
        localStorage.setItem('instructors', JSON.stringify(savedInstructors));
        logAuditEvent('instructor_created', `Created new instructor: ${formData.name}`);
      }

      // Force a storage event to trigger updates in other components
      window.dispatchEvent(new Event('storage'));

      navigate('/admin');
    } catch (error) {
      console.error('Error saving instructor:', error);
    } finally {
      setIsSubmitting(false);
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
            {isEditing ? 'Edit Instructor' : 'Add New Instructor'}
          </h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Professional Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Senior Business Consultant"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="instructor@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Profile Image and Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Image URL *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter image URL"
                    required
                  />
                  {formData.image && (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="5"
                  required
                />
              </div>
            </div>

            {/* Biography */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Professional Biography *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter professional biography and background..."
                required
              />
            </div>

            {/* Areas of Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Areas of Expertise
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Business Strategy, Leadership"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddExpertise}
                  disabled={!newExpertise.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.expertise.map((expertise, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30"
                    >
                      {expertise}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(expertise)}
                        className="ml-2 hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Social Links (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter Profile
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Personal Website
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, website: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Instructor' : 'Add Instructor')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInstructorPage;