"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  MessageSquare,
  Star,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from "../../components/Navigation";

interface Booking {
  id: string;
  sessionType: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  status: string;
  price: number;
  paymentStatus: string;
  meetingLink?: string;
  location?: string;
  feedback?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  coach: {
    id: string;
    name: string;
    avatar?: string;
    specialties: string[];
    rating: number;
  };
  athlete?: {
    id: string;
    studentName: string;
    email: string;
  };
}

const BookingsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [userRole, setUserRole] = useState<string>('ATHLETE');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings();
      // Get user role from session or API
      if (session?.user) {
        setUserRole((session as unknown as Session).user.role || 'ATHLETE');
      }
    }
  }, [status, session]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketplace/bookings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO_CALL':
        return <Video className="h-4 w-4" />;
      case 'IN_PERSON':
        return <MapPin className="h-4 w-4" />;
      case 'ASYNC_FEEDBACK':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatSessionType = (type: string) => {
    switch (type) {
      case 'VIDEO_CALL':
        return 'Video Call';
      case 'IN_PERSON':
        return 'In-Person';
      case 'ASYNC_FEEDBACK':
        return 'Async Feedback';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterBookings = (bookings: Booking[]) => {
    const now = new Date();
    
    switch (selectedTab) {
      case 'upcoming':
        return bookings.filter(booking => 
          booking.status === 'CONFIRMED' || booking.status === 'PENDING'
        );
      case 'completed':
        return bookings.filter(booking => booking.status === 'COMPLETED');
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'CANCELLED');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(bookings);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeader 
          title={userRole === 'COACH' ? 'Student Bookings' : 'My Bookings'}
          subtitle={userRole === 'COACH' 
            ? 'Manage your students\' coaching session bookings' 
            : 'Manage your coaching session bookings'
          }
          backButtonText="Back to Dashboard"
          onBackClick={() => router.push('/dashboard')}
        />

        {/* Refresh Button */}
        <div className="mb-8">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'upcoming', label: 'Upcoming', count: filterBookings(bookings).length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                    selectedTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading bookings</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedTab === 'all' ? 'No current bookings' : `No ${selectedTab} bookings found`}
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              {selectedTab === 'all' 
                ? "You haven't made any bookings yet. Start by exploring our marketplace of specialized coaches."
                : `No ${selectedTab} bookings found. Try switching to a different tab or explore the marketplace.`
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/marketplace')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Browse Coaches
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Booking Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          {booking.coach.avatar ? (
                            <img
                              src={booking.coach.avatar}
                              alt={booking.coach.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.title}</h3>
                          <p className="text-sm text-gray-600">
                            {userRole === 'COACH' && booking.athlete 
                              ? `Student: ${booking.athlete.studentName} • Coach: ${booking.coach.name}`
                              : `with ${booking.coach.name}`
                            }
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {getSessionTypeIcon(booking.sessionType)}
                          <span>{formatSessionType(booking.sessionType)}</span>
                        </div>
                        
                        {booking.scheduledAt && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.scheduledAt)}</span>
                          </div>
                        )}
                        
                        {booking.duration && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{booking.duration} minutes</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>${booking.price}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {booking.description && (
                        <p className="text-sm text-gray-700 mb-4">{booking.description}</p>
                      )}

                      {/* Coach Rating and Specialties */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{booking.coach.rating}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {booking.coach.specialties.slice(0, 3).map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Feedback Section */}
                      {booking.feedback && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Coach Feedback</h4>
                          <p className="text-sm text-gray-700">{booking.feedback}</p>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="flex items-center space-x-4">
                        {booking.meetingLink && booking.status === 'CONFIRMED' && (
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <Video className="h-3 w-3 mr-1" />
                            Join Session
                          </a>
                        )}
                        
                        {booking.status === 'COMPLETED' && !booking.rating && (
                          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            <Star className="h-3 w-3 mr-1" />
                            Rate Session
                          </button>
                        )}
                        
                        <button
                          onClick={() => router.push(`/marketplace/coach/${booking.coach.id}`)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Coach Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status Footer */}
                <div className={`px-6 py-3 border-t ${
                  booking.paymentStatus === 'PAID' 
                    ? 'bg-green-50 border-green-200' 
                    : booking.paymentStatus === 'REFUNDED'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Payment Status: <span className="font-medium">{booking.paymentStatus}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage; 