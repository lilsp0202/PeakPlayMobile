"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Video,
  Users,
  Trophy,
  DollarSign,
  Calendar,
  MessageSquare,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { PageHeader } from "../../components/Navigation";

interface SpecializedCoach {
  id: string;
  name: string;
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
  reviews: any[];
  _count: {
    reviews: number;
    bookings: number;
  };
}

const MarketplacePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coaches, setCoaches] = useState<SpecializedCoach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<SpecializedCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    minRating: '',
    maxPrice: '',
    sessionType: ''
  });
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchCoaches();
    }
  }, [status, router]);

  const fetchCoaches = async () => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.specialty) queryParams.append('specialty', filters.specialty);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sessionType) queryParams.append('sessionType', filters.sessionType);
      if (searchTerm) queryParams.append('search', searchTerm);
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      const response = await fetch(`/api/marketplace/coaches?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setCoaches(data);
        setFilteredCoaches(data);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCoaches();
    }
  }, [filters, searchTerm, sortBy, sortOrder]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      location: '',
      minRating: '',
      maxPrice: '',
      sessionType: ''
    });
    setSearchTerm('');
  };

  const getSessionPrice = (coach: SpecializedCoach, sessionType: string) => {
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

  const handleBookCoach = (coachId: string) => {
    router.push(`/marketplace/coach/${coachId}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeader 
          title="Coaching Marketplace"
          subtitle="Discover specialized cricket coaches and book personalized sessions"
          backButtonText="Back to Dashboard"
          onBackClick={() => router.push('/dashboard')}
        />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search coaches, specialties, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.specialty}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              >
                <option value="">All Specialties</option>
                <option value="Batting Technique">Batting Technique</option>
                <option value="Spin Bowling">Spin Bowling</option>
                <option value="Fast Bowling">Fast Bowling</option>
                <option value="Fielding Excellence">Fielding Excellence</option>
                <option value="Mental Toughness">Mental Toughness</option>
                <option value="T20 Cricket">T20 Cricket</option>
                <option value="Women's Cricket">Women's Cricket</option>
              </select>

              <select
                value={filters.sessionType}
                onChange={(e) => handleFilterChange('sessionType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              >
                <option value="">All Session Types</option>
                <option value="VIDEO_CALL">Video Call</option>
                <option value="IN_PERSON">In-Person</option>
                <option value="ASYNC_FEEDBACK">Async Feedback</option>
              </select>

              <input
                type="number"
                placeholder="Min Rating"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-32 text-gray-800"
                min="0"
                max="5"
                step="0.1"
              />

              <input
                type="number"
                placeholder="Max Price ($)"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-32 text-gray-800"
              />

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              >
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="price">Price</option>
                <option value="reviewCount">Review Count</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
            <span className="text-sm text-gray-700">
              {filteredCoaches.length} coaches found
            </span>
          </div>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => (
            <div key={coach.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Coach Header */}
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={coach.avatar || '/api/placeholder/64/64'}
                    alt={coach.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{coach.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-700 ml-1">
                          {coach.rating} ({coach.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {coach.location}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-700 text-sm mt-4 line-clamp-3">{coach.bio}</p>

                {/* Specialties */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                    {coach.specialties.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                        +{coach.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="text-sm text-gray-700">{coach.experience} years</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-green-600 mb-1">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="text-sm text-gray-700">{coach._count.bookings} sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-purple-600 mb-1">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div className="text-sm text-gray-700">
                      ${filters.sessionType ? getSessionPrice(coach, filters.sessionType) : coach.pricePerHour}/hr
                    </div>
                  </div>
                </div>

                {/* Session Types */}
                <div className="mt-4">
                  <div className="flex space-x-2">
                    {coach.videoCallRate && (
                      <div className="flex items-center text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </div>
                    )}
                    {coach.inPersonRate && (
                      <div className="flex items-center text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        <Users className="h-3 w-3 mr-1" />
                        In-Person
                      </div>
                    )}
                    {coach.asyncFeedbackRate && (
                      <div className="flex items-center text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Async
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleBookCoach(coach.id)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  View Profile & Book
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCoaches.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coaches found</h3>
            <p className="text-gray-700 mb-4">
              Try adjusting your search criteria or filters to find coaches.
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage; 