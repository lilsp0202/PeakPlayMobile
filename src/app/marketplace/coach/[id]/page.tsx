"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Star,
  MapPin,
  Clock,
  Video,
  Users,
  MessageSquare,
  Trophy,
  Award,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react';
import { PageHeader } from "../../../../components/Navigation";

interface SpecializedCoach {
  id: string;
  name: string;
  email: string;
  bio: string;
  specialties: string[];
  location: string;
  avatar?: string;
  experience: number;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  videoCallRate?: number;
  inPersonRate?: number;
  asyncFeedbackRate?: number;
  certifications: string[];
  socialLinks: any;
  timezone: string;
  availability: any;
  reviews: any[];
  _count: {
    reviews: number;
    bookings: number;
  };
}

interface BookingForm {
  sessionType: 'VIDEO_CALL' | 'IN_PERSON' | 'ASYNC_FEEDBACK';
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
}

const CoachProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const coachId = params.id as string;

  const [coach, setCoach] = useState<SpecializedCoach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    sessionType: 'VIDEO_CALL',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && coachId) {
      fetchCoach();
    }
  }, [status, coachId, router]);

  const fetchCoach = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marketplace/coaches/${coachId}`);
      
      if (!response.ok) {
        throw new Error('Coach not found');
      }
      
      const data = await response.json();
      setCoach(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSessionPrice = (sessionType: string) => {
    if (!coach) return 0;
    
    switch (sessionType) {
      case 'VIDEO_CALL':
        return coach.videoCallRate || coach.pricePerHour;
      case 'IN_PERSON':
        return coach.inPersonRate || coach.pricePerHour;
      case 'ASYNC_FEEDBACK':
        return coach.asyncFeedbackRate || coach.pricePerHour;
      default:
        return coach.pricePerHour;
    }
  };

  const calculatePrice = () => {
    const basePrice = getSessionPrice(bookingForm.sessionType);
    if (bookingForm.sessionType === 'ASYNC_FEEDBACK') {
      return basePrice; // Flat rate for async feedback
    }
    return (basePrice / 60) * bookingForm.duration;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coach) return;
    
    setBookingLoading(true);
    
    try {
      const response = await fetch('/api/marketplace/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: coach.id,
          ...bookingForm,
          scheduledAt: bookingForm.scheduledAt ? new Date(bookingForm.scheduledAt).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      // Redirect to bookings page on success
      router.push('/bookings?message=booking-created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const isSessionTypeAvailable = (sessionType: string) => {
    if (!coach) return false;
    
    switch (sessionType) {
      case 'VIDEO_CALL':
        return !!coach.videoCallRate;
      case 'IN_PERSON':
        return !!coach.inPersonRate;
      case 'ASYNC_FEEDBACK':
        return !!coach.asyncFeedbackRate;
      default:
        return true;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader 
            title="Coach Not Found"
            subtitle={error}
            backButtonText="Back to Marketplace"
            onBackClick={() => router.push('/marketplace')}
          />
        </div>
      </div>
    );
  }

  if (!coach) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeader 
          title={coach.name}
          subtitle="Specialized Cricket Coach"
          backButtonText="Back to Marketplace"
          onBackClick={() => router.push('/marketplace')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coach Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-6">
                <img
                  src={coach.avatar || '/api/placeholder/96/96'}
                  alt={coach.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{coach.name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-medium text-gray-900">{coach.rating}</span>
                      <span className="text-gray-600">({coach.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {coach.location}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center text-gray-600">
                      <Trophy className="h-4 w-4 mr-2" />
                      <span>{coach.experience} years experience</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{coach._count.bookings} sessions completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{coach.bio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {coach.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {coach.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
                <div className="space-y-2">
                  {coach.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {coach.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {coach.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">{review.title}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        by {review.isAnonymous ? 'Anonymous' : review.athlete.studentName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Book a Session</h2>
              
              {/* Session Types */}
              <div className="space-y-3 mb-6">
                {[
                  { type: 'VIDEO_CALL', label: 'Video Call', icon: Video, description: 'Live online coaching session' },
                  { type: 'IN_PERSON', label: 'In-Person', icon: Users, description: 'Face-to-face coaching session' },
                  { type: 'ASYNC_FEEDBACK', label: 'Video Analysis', icon: MessageSquare, description: 'Upload videos for feedback' }
                ].map(({ type, label, icon: Icon, description }) => {
                  const available = isSessionTypeAvailable(type);
                  const price = getSessionPrice(type);
                  
                  return (
                    <div
                      key={type}
                      className={`border rounded-lg p-4 ${
                        available ? 'border-gray-200 hover:border-blue-300' : 'border-gray-100 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">{label}</h3>
                            <p className="text-sm text-gray-600">{description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${price}/hr</p>
                          {available && (
                            <button
                              onClick={() => {
                                setBookingForm(prev => ({ ...prev, sessionType: type as any }));
                                setShowBookingForm(true);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Contact</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{coach.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Timezone: {coach.timezone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Book {bookingForm.sessionType.replace('_', ' ').toLowerCase()} session
              </h3>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.title}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Batting technique improvement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what you'd like to work on..."
                  />
                </div>

                {bookingForm.sessionType !== 'ASYNC_FEEDBACK' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={bookingForm.scheduledAt}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <select
                        value={bookingForm.duration}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                        <option value={120}>120 minutes</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Total Price:</p>
                    <p className="text-lg font-bold text-gray-900">${calculatePrice().toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Booking...' : 'Book Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachProfilePage; 