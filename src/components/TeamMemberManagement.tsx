'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiSearch, FiUsers, FiCheck } from 'react-icons/fi';

interface TeamMemberManagementProps {
  team: any;
  assignedStudents: any[];
  onUpdate: () => void;
}

export default function TeamMemberManagement({ team, assignedStudents, onUpdate }: TeamMemberManagementProps) {
  const [currentMembers, setCurrentMembers] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);

  useEffect(() => {
    if (team?.members) {
      setCurrentMembers(team.members);
    }
  }, [team]);

  useEffect(() => {
    if (assignedStudents && team?.members) {
      // Filter out students who are already team members
      const memberIds = new Set(team.members.map((m: any) => m.studentId || m.student?.id));
      const available = assignedStudents.filter(student => !memberIds.has(student.id));
      setAvailableStudents(available);
    }
  }, [assignedStudents, team]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    setIsUpdating(true);
    try {
      // Get updated member list
      const updatedMemberIds = currentMembers
        .filter(m => (m.studentId || m.student?.id) !== memberId)
        .map(m => m.studentId || m.student?.id);

      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: team.name,
          description: team.description,
          memberIds: updatedMemberIds
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentMembers(result.team.members || []);
        onUpdate();
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student to add');
      return;
    }

    setIsUpdating(true);
    try {
      // Combine current members with new selections
      const currentMemberIds = currentMembers.map(m => m.studentId || m.student?.id);
      const updatedMemberIds = [...new Set([...currentMemberIds, ...selectedStudents])];

      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: team.name,
          description: team.description,
          memberIds: updatedMemberIds
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentMembers(result.team.members || []);
        setSelectedStudents([]);
        setShowAddMembers(false);
        onUpdate();
      } else {
        throw new Error('Failed to add members');
      }
    } catch (error) {
      console.error('Error adding members:', error);
      alert('Failed to add members. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredAvailable = availableStudents.filter(student =>
    student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{team?.name || 'Team'}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {team?.description || 'Manage team members'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            <FiUsers className="inline mr-1" />
            {currentMembers.length} members
          </span>
          {availableStudents.length > 0 && !showAddMembers && (
            <button
              onClick={() => setShowAddMembers(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              disabled={isUpdating}
            >
              <FiPlus />
              Add Members
            </button>
          )}
        </div>
      </div>

      {/* Current Members */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Members</h4>
        {currentMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No members in this team yet</p>
        ) : (
          <div className="space-y-2">
            {currentMembers.map((member) => {
              const student = member.student || member;
              const studentId = member.studentId || student.id;
              return (
                <div
                  key={studentId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">{student.studentName}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    {member.roles && member.roles.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {member.roles.map((role: string) => (
                          <span key={role} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {role.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveMember(studentId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={isUpdating}
                    title="Remove from team"
                  >
                    <FiX />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Members Section */}
      {showAddMembers && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-gray-700">Add Members</h4>
            <button
              onClick={() => {
                setShowAddMembers(false);
                setSelectedStudents([]);
                setSearchTerm('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Available Students */}
          {filteredAvailable.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {searchTerm ? 'No students found' : 'All assigned students are already in this team'}
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {filteredAvailable.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudentSelection(student.id)}
                    className="mr-3 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{student.studentName}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddMembers}
              disabled={selectedStudents.length === 0 || isUpdating}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              <FiCheck />
              Add {selectedStudents.length} Selected
            </button>
            <button
              onClick={() => {
                setShowAddMembers(false);
                setSelectedStudents([]);
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Updating team...</p>
          </div>
        </div>
      )}
    </div>
  );
} 