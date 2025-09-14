import React from 'react';

interface TeamMemberManagementProps {
  team: any;
  assignedStudents: any[];
  onUpdate: () => void;
}

export default function TeamMemberManagement({ team, assignedStudents, onUpdate }: TeamMemberManagementProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Team Member Management</h3>
      <p className="text-gray-600">Team member management functionality is currently being updated.</p>
      <div className="mt-4">
        <p className="text-sm text-gray-500">Team: {team?.name || 'Unknown'}</p>
        <p className="text-sm text-gray-500">Members: {team?._count?.members || 0}</p>
      </div>
    </div>
  );
} 