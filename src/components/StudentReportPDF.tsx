"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { FiDownload, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface StudentReportPDFProps {
  studentId: string;
  studentName: string;
  onGenerateStart?: () => void;
  onGenerateComplete?: () => void;
  onGenerateError?: (error: string) => void;
  className?: string;
  variant?: 'button' | 'icon';
  dateRange?: number;
}

interface StudentData {
  student: {
    id: string;
    name: string;
    username: string;
    email: string;
    age: number;
    height: number;
    weight: number;
    academy: string;
    sport: string;
    role: string;
  };
  currentMetrics: {
    physical: number;
    mental: number;
    nutrition: number;
    wellness: number;
    technique: number;
    tactical: number;
  };
  peakScore: number;
  skillHistory: Array<{
    date: string;
    physicalScore: number;
    mentalScore: number;
    nutritionScore: number;
    wellnessScore: number;
    techniqueScore: number;
    tacticalScore: number;
  }>;
  recentFeedback: Array<{
    date: string;
    coach: string;
    title: string;
    content: string;
  }>;
  actionItems: Array<{
    date: string;
    task: string;
    completed: boolean;
  }>;
  matchCount: number;
  totalFeedback: number;
}

export default function StudentReportPDF({
  studentId,
  studentName,
  onGenerateStart,
  onGenerateComplete,
  onGenerateError,
  className = "",
  variant = 'button',
  dateRange = 30
}: StudentReportPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchStudentData = async (): Promise<StudentData> => {
    try {
      const response = await fetch(`/api/student/comprehensive-report?studentId=${studentId}&days=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  };

  const addPeakPlayLogo = (doc: jsPDF, x: number, y: number, size: number = 40) => {
    // PeakPlay Lightning Bolt Logo
    doc.setFillColor(139, 92, 246); // Purple gradient start
    
    // Lightning bolt shape
    const lightningPath = [
      [x, y],
      [x + size * 0.3, y],
      [x + size * 0.15, y + size * 0.4],
      [x + size * 0.4, y + size * 0.4],
      [x + size * 0.2, y + size],
      [x + size * 0.6, y + size * 0.6],
      [x + size * 0.3, y + size * 0.6],
      [x + size * 0.45, y + size * 0.2],
      [x + size * 0.2, y + size * 0.2]
    ];
    
    // Draw lightning bolt
    doc.setFillColor(59, 130, 246); // Blue
    doc.triangle(x + 5, y + 5, x + 25, y + 5, x + 15, y + 25, 'F');
    doc.setFillColor(139, 92, 246); // Purple
    doc.triangle(x + 15, y + 15, x + 35, y + 15, x + 25, y + 35, 'F');
  };

  const drawRadarChart = (doc: jsPDF, x: number, y: number, size: number, data: number[]) => {
    const center = { x: x + size/2, y: y + size/2 };
    const radius = size * 0.35;
    const skills = ['Physical', 'Mental', 'Nutrition', 'Technique', 'Tactical'];
    
    // Draw background circles
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5;
      doc.circle(center.x, center.y, r, 'S');
    }

    // Draw axis lines
    doc.setDrawColor(226, 232, 240);
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 - 90) * (Math.PI / 180);
      const endX = center.x + Math.cos(angle) * radius;
      const endY = center.y + Math.sin(angle) * radius;
      doc.line(center.x, center.y, endX, endY);
    }

    // Draw data polygon
    doc.setFillColor(59, 130, 246, 0.3); // Blue with transparency
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1.5);

    const points = data.map((value, index) => {
      const angle = (index * 72 - 90) * (Math.PI / 180);
      const r = (value / 100) * radius;
      return {
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r
      };
    });

    // Create polygon path
    if (points.length > 0) {
      doc.setFillColor(59, 130, 246, 0.2);
      let pathString = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathString += ` L ${points[i].x} ${points[i].y}`;
      }
      pathString += ' Z';
      
      // Draw filled polygon
      doc.setFillColor(139, 92, 246, 0.3);
      for (let i = 0; i < points.length; i++) {
        const nextIndex = (i + 1) % points.length;
        if (i === 0) {
          doc.moveTo(points[i].x, points[i].y);
        }
        doc.lineTo(points[nextIndex].x, points[nextIndex].y);
      }
    }

    // Draw data points
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    points.forEach(point => {
      doc.circle(point.x, point.y, 3, 'FD');
    });

    // Add skill labels
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    skills.forEach((skill, index) => {
      const angle = (index * 72 - 90) * (Math.PI / 180);
      const labelRadius = radius + 15;
      const labelX = center.x + Math.cos(angle) * labelRadius;
      const labelY = center.y + Math.sin(angle) * labelRadius;
      
      // Center text
      const textWidth = doc.getTextWidth(skill);
      doc.text(skill, labelX - textWidth/2, labelY + 3);
      
      // Add score
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const score = `${data[index]}%`;
      const scoreWidth = doc.getTextWidth(score);
      doc.text(score, labelX - scoreWidth/2, labelY + 10);
      doc.setFont('helvetica', 'bold');
    });
  };

  const drawProgressBar = (doc: jsPDF, x: number, y: number, width: number, value: number, color: [number, number, number]) => {
    // Background bar
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, y, width, 6, 3, 3, 'F');
    
    // Progress bar
    const progressWidth = (value / 100) * width;
          doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, progressWidth, 6, 3, 3, 'F');
  };

  const getStatusColor = (score: number): [number, number, number] => {
    if (score >= 70) return [34, 197, 94]; // Green
    if (score >= 50) return [234, 179, 8]; // Yellow
    return [239, 68, 68]; // Red
  };

  const getStatusText = (score: number): string => {
    if (score >= 70) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Needs Work';
  };

  const generatePDF = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    onGenerateStart?.();

    try {
      const studentData = await fetchStudentData();
      
      // Add safety checks and fallbacks for all data properties
      const safeStudentData = {
        student: {
          id: studentData.student?.id || '',
          name: studentData.student?.name || studentName || 'Unknown Student',
          username: studentData.student?.username || '',
          email: studentData.student?.email || '',
          age: studentData.student?.age || 18,
          height: studentData.student?.height || 0,
          weight: studentData.student?.weight || 0,
          academy: studentData.student?.academy || 'Not specified',
          sport: studentData.student?.sport || 'CRICKET',
          role: studentData.student?.role || 'ALL_ROUNDER'
        },
        currentMetrics: {
          physical: studentData.currentMetrics?.physical || 0,
          mental: studentData.currentMetrics?.mental || 0,
          nutrition: studentData.currentMetrics?.nutrition || 0,
          wellness: studentData.currentMetrics?.wellness || 0,
          technique: studentData.currentMetrics?.technique || 0,
          tactical: studentData.currentMetrics?.tactical || 0
        },
        peakScore: studentData.peakScore || 0,
        skillHistory: studentData.skillHistory || [],
        recentFeedback: studentData.recentFeedback || [],
        actionItems: studentData.actionItems || [],
        matchCount: studentData.matchCount || 0,
        totalFeedback: studentData.totalFeedback || 0
      };
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ===== HEADER SECTION - Professional Blue Design =====
      // Primary blue gradient background
      doc.setFillColor(67, 56, 202);
      doc.rect(0, 0, pageWidth, 50, 'F');

      // PeakPlay Logo and Title
      addPeakPlayLogo(doc, 15, 10);
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('PEAKPLAY', 50, 25);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Performance Report', 50, 32);

      // Generated date (top right)
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Generated on', pageWidth - 55, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(format(new Date(), 'MMMM dd, yyyy'), pageWidth - 55, 28);

      // Academy badge
      doc.setFillColor(255, 255, 255, 0.2);
      doc.roundedRect(15, 37, 40, 7, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const academyText = safeStudentData.student.academy.length > 12 ? 
        safeStudentData.student.academy.substring(0, 12) + '...' : 
        safeStudentData.student.academy;
      doc.text(academyText, 17, 41.5);

      // ===== INFO CARDS SECTION - Clean White Cards =====
      const cardY = 60;
      const cardWidth = 43;
      const cardHeight = 25;
      const cardSpacing = 45;
      
      // Helper function to create info cards
      const createInfoCard = (x: number, icon: string, label: string, value: string, subText?: string) => {
        // Clean white background
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'F');
        
        // Subtle border
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'S');
        
        // Icon and label
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`${icon} ${label}`, x + 3, cardY + 6);
        
        // Main value
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const truncatedValue = value.length > 12 ? value.substring(0, 12) + '...' : value;
        doc.text(truncatedValue, x + 3, cardY + 14);
        
        // Sub text if provided
        if (subText) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          const truncatedSub = subText.length > 15 ? subText.substring(0, 15) + '...' : subText;
          doc.text(truncatedSub, x + 3, cardY + 20);
        }
      };

      // Create all info cards
      createInfoCard(15, '👤', 'Player', safeStudentData.student.name, `${safeStudentData.student.role} • Age ${safeStudentData.student.age}`);
      createInfoCard(15 + cardSpacing, '🏏', 'Sport', safeStudentData.student.sport);
      createInfoCard(15 + (cardSpacing * 2), '📅', 'Report Period', `${dateRange} days`);
      createInfoCard(15 + (cardSpacing * 3), '📊', 'Overall Score', `${safeStudentData.peakScore.toFixed(1)}%`);

      // ===== MAIN CONTENT AREA =====
      let currentY = 95;

      // ===== LEFT COLUMN: SKILLS RADAR =====
      const leftColumnX = 15;
      const leftColumnWidth = 85;
      const rightColumnX = 105;
      const rightColumnWidth = 85;
      const sectionHeight = 80;

      // Skills Radar Section
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftColumnX, currentY, leftColumnWidth, sectionHeight, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(leftColumnX, currentY, leftColumnWidth, sectionHeight, 4, 4, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('🎯 Skills Radar', leftColumnX + 5, currentY + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Performance across all skill areas', leftColumnX + 5, currentY + 16);

      // Draw radar chart with better positioning
      const radarData = [
        safeStudentData.currentMetrics.physical,
        safeStudentData.currentMetrics.mental,
        safeStudentData.currentMetrics.nutrition,
        safeStudentData.currentMetrics.technique,
        safeStudentData.currentMetrics.tactical
      ];
      
      drawRadarChart(doc, leftColumnX + 5, currentY + 20, 70, radarData);

      // Performance legend at bottom
      doc.setFontSize(6);
      doc.setTextColor(34, 197, 94);
      doc.text('● Excellent (70-100%)', leftColumnX + 5, currentY + 70);
      doc.setTextColor(251, 191, 36);
      doc.text('● Good (50-69%)', leftColumnX + 40, currentY + 70);
      doc.setTextColor(239, 68, 68);
      doc.text('● Needs Work (0-49%)', leftColumnX + 5, currentY + 75);

      // ===== RIGHT COLUMN: PERFORMANCE BREAKDOWN =====
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightColumnX, currentY, rightColumnWidth, sectionHeight, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(rightColumnX, currentY, rightColumnWidth, sectionHeight, 4, 4, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('✅ Performance Breakdown', rightColumnX + 5, currentY + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Detailed metrics by skill area', rightColumnX + 5, currentY + 16);

      // Performance metrics with proper spacing
      const performanceMetrics = [
        { name: 'Physical', score: safeStudentData.currentMetrics.physical, icon: '⚡' },
        { name: 'Mental', score: safeStudentData.currentMetrics.mental, icon: '❤️' },
        { name: 'Nutrition', score: safeStudentData.currentMetrics.nutrition, icon: '🍎' },
        { name: 'Technique', score: safeStudentData.currentMetrics.technique, icon: '⚙️' },
        { name: 'Tactical', score: safeStudentData.currentMetrics.tactical, icon: '🎯' }
      ];

      performanceMetrics.forEach((metric, index) => {
        const yPos = currentY + 25 + (index * 10);
        
        // Icon and name
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`${metric.icon} ${metric.name}`, rightColumnX + 5, yPos);
        
        // Score
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`${metric.score}%`, rightColumnX + 35, yPos);
        
        // Status badge with proper colors
        const status = getStatusText(metric.score);
        const statusColor = getStatusColor(metric.score);
        
        // Clean status background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(rightColumnX + 50, yPos - 3, 20, 6, 2, 2, 'F');
        
        // Status text
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.text(status, rightColumnX + 52, yPos);
      });

      // ===== SECOND ROW =====
      currentY = 185;

      // ===== PROGRESS ANALYSIS (Left) =====
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftColumnX, currentY, leftColumnWidth, sectionHeight, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(leftColumnX, currentY, leftColumnWidth, sectionHeight, 4, 4, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('📈 Progress Analysis', leftColumnX + 5, currentY + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${dateRange}-day performance trends`, leftColumnX + 5, currentY + 16);

      // Progress cards in 2x2 grid with better spacing
      const progressCards = [
        { label: 'Physical', score: safeStudentData.currentMetrics.physical, color: [59, 130, 246] },
        { label: 'Nutrition', score: safeStudentData.currentMetrics.nutrition, color: [34, 197, 94] },
        { label: 'Mental', score: safeStudentData.currentMetrics.mental, color: [251, 191, 36] },
        { label: 'Technique', score: safeStudentData.currentMetrics.technique, color: [239, 68, 68] }
      ];

      progressCards.forEach((card, index) => {
        const xPos = leftColumnX + 8 + (index % 2) * 35;
        const yPos = currentY + 25 + Math.floor(index / 2) * 22;
        
        // Clean card background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xPos, yPos, 30, 18, 2, 2, 'F');
        
        // Card border with theme color
        doc.setDrawColor(card.color[0], card.color[1], card.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(xPos, yPos, 30, 18, 2, 2, 'S');
        
        // Score
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${card.score}%`, xPos + 3, yPos + 8);
        
        // Label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(card.label, xPos + 3, yPos + 13);
        
        // Status
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text('Maintained', xPos + 3, yPos + 16);
      });

      // ===== RECENT FEEDBACK (Right) =====
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightColumnX, currentY, rightColumnWidth, sectionHeight, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(rightColumnX, currentY, rightColumnWidth, sectionHeight, 4, 4, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('💬 Recent Feedback', rightColumnX + 5, currentY + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Latest coach comments and updates', rightColumnX + 5, currentY + 16);

      // Feedback items with proper spacing
      if (safeStudentData.recentFeedback.length > 0) {
        safeStudentData.recentFeedback.slice(0, 3).forEach((feedback, index) => {
          const yPos = currentY + 25 + (index * 17);
          
          // Coach avatar
          doc.setFillColor(59, 130, 246);
          doc.circle(rightColumnX + 8, yPos + 2, 1.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5);
          doc.text('CA', rightColumnX + 7, yPos + 3);
          
          // Coach name and date on same line
          doc.setTextColor(59, 130, 246);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          const coachName = (feedback.coach || 'Coach A').substring(0, 8);
          doc.text(coachName, rightColumnX + 12, yPos + 1);
          
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          const feedbackDate = feedback.date || format(new Date(), 'MMM dd');
          doc.text(feedbackDate, rightColumnX + 65, yPos + 1);
          
          // Feedback title
          doc.setTextColor(30, 41, 59);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          const title = (feedback.title || 'Feedback').substring(0, 20);
          doc.text(title, rightColumnX + 12, yPos + 6);
          
          // Feedback content (wrapped)
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.setTextColor(100, 116, 139);
          const content = feedback.content || 'No feedback content';
          const truncated = content.length > 35 ? content.substring(0, 35) + '...' : content;
          doc.text(truncated, rightColumnX + 12, yPos + 10);
        });
      } else {
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('No recent feedback available', rightColumnX + 5, currentY + 40);
      }

      // ===== THIRD ROW =====
      currentY = 275;

      // ===== ACTION ITEMS (Left) =====
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftColumnX, currentY, leftColumnWidth, sectionHeight, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(leftColumnX, currentY, leftColumnWidth, sectionHeight, 4, 4, 'S');

      const completedCount = safeStudentData.actionItems.filter(item => item.completed).length;
      const totalCount = safeStudentData.actionItems.length;

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('✅ Action Items', leftColumnX + 5, currentY + 10);
      
      // Completion status
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${completedCount}/${totalCount} completed`, leftColumnX + 50, currentY + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Tasks and objectives tracking', leftColumnX + 5, currentY + 16);

      // Action items list with proper checkboxes
      if (safeStudentData.actionItems.length > 0) {
        safeStudentData.actionItems.slice(0, 6).forEach((item, index) => {
          const yPos = currentY + 25 + (index * 8);
          
          // Checkbox
          if (item.completed) {
            doc.setFillColor(34, 197, 94);
            doc.circle(leftColumnX + 8, yPos, 1.2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(5);
            doc.text('✓', leftColumnX + 7.2, yPos + 0.8);
          } else {
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.3);
            doc.circle(leftColumnX + 8, yPos, 1.2, 'S');
          }
          
          // Task text with proper wrapping
          doc.setTextColor(item.completed ? 156 : 30, item.completed ? 163 : 41, item.completed ? 175 : 59);
          doc.setFont('helvetica', item.completed ? 'normal' : 'normal');
          doc.setFontSize(7);
          const task = item.task || 'Task item';
          const taskText = task.length > 25 ? task.substring(0, 25) + '...' : task;
          doc.text(taskText, leftColumnX + 12, yPos + 1);
          
          // Date
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5);
          const itemDate = item.date || format(new Date(), 'MMM dd');
          doc.text(itemDate, leftColumnX + 70, yPos + 1);
        });
      } else {
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('No action items assigned', leftColumnX + 5, currentY + 40);
      }

      // ===== SUMMARY STATISTICS (Right) =====
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightColumnX, currentY, rightColumnWidth, sectionHeight, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(rightColumnX, currentY, rightColumnWidth, sectionHeight, 4, 4, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('📊 Summary Statistics', rightColumnX + 5, currentY + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Key performance indicators', rightColumnX + 5, currentY + 16);

      // Summary stats in 2x2 grid
      const summaryStats = [
        { label: 'Overall Average', value: `${safeStudentData.peakScore.toFixed(1)}%`, color: [59, 130, 246] },
        { label: 'Progress Entries', value: safeStudentData.skillHistory.length.toString(), color: [34, 197, 94] },
        { label: 'Feedback Received', value: safeStudentData.totalFeedback.toString(), color: [139, 92, 246] },
        { label: 'Matches Played', value: safeStudentData.matchCount.toString(), color: [251, 191, 36] }
      ];

      summaryStats.forEach((stat, index) => {
        const xPos = rightColumnX + 8 + (index % 2) * 35;
        const yPos = currentY + 25 + Math.floor(index / 2) * 22;
        
        // Clean stat background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xPos, yPos, 30, 18, 2, 2, 'F');
        
        // Stat border with theme color
        doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(xPos, yPos, 30, 18, 2, 2, 'S');
        
        // Value
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(stat.value, xPos + 3, yPos + 10);
        
        // Label with proper wrapping
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(30, 41, 59);
        const labelLines = stat.label.split(' ');
        if (labelLines.length > 1) {
          doc.text(labelLines[0], xPos + 3, yPos + 14);
          doc.text(labelLines.slice(1).join(' '), xPos + 3, yPos + 16.5);
        } else {
          doc.text(stat.label, xPos + 3, yPos + 15);
        }
      });

      // ===== COACH COMMENTS SECTION =====
      currentY = 365;
      
      // Professional yellow background for recommendations
      doc.setFillColor(254, 252, 232);
      doc.roundedRect(15, currentY, 175, 45, 4, 4, 'F');
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, currentY, 175, 45, 4, 4, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('💡 Coach Comments & Recommendations', 20, currentY + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Personalized feedback and development plan', 20, currentY + 16);

      // Development focus areas
      doc.setTextColor(146, 64, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Development Focus Areas', 20, currentY + 24);

      doc.setTextColor(68, 64, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      
      // Personalized recommendations based on actual scores
      const lowScores = performanceMetrics.filter(m => m.score < 50);
      const highScores = performanceMetrics.filter(m => m.score >= 70);
      
      const recommendations = [
        `• ${lowScores.length > 0 ? `Focus Areas: ${lowScores.map(m => m.name).join(', ')} need immediate attention` : 'Continue current performance across all areas'}`,
        `• ${highScores.length > 0 ? `Strengths: ${highScores.map(m => m.name).join(', ')} show excellent performance` : 'Develop stronger performance areas'}`,
        `• Overall trajectory shows ${safeStudentData.peakScore >= 70 ? 'exceptional' : safeStudentData.peakScore >= 50 ? 'solid' : 'developing'} potential for growth`,
        `• Recommendation: ${safeStudentData.peakScore < 50 ? 'Focus on fundamental skill development' : 'Maintain current training with targeted improvements'}`
      ];

      recommendations.forEach((rec, index) => {
        // Wrap long recommendations
        if (rec.length > 80) {
          const words = rec.split(' ');
          let line1 = '';
          let line2 = '';
          let currentLine = 1;
          
          words.forEach(word => {
            if (currentLine === 1 && (line1 + word).length < 80) {
              line1 += (line1 ? ' ' : '') + word;
            } else {
              if (currentLine === 1) currentLine = 2;
              line2 += (line2 ? ' ' : '') + word;
            }
          });
          
          doc.text(line1, 20, currentY + 28 + (index * 5.5));
          if (line2) {
            doc.text('  ' + line2, 20, currentY + 31 + (index * 5.5));
          }
        } else {
          doc.text(rec, 20, currentY + 28 + (index * 4));
        }
      });

      // Coach signature
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(`"${safeStudentData.student.name} demonstrates strong fundamentals. Continued focus on identified areas will yield significant improvements."`, 20, currentY + 48);
      doc.text(`- Coach A, ${format(new Date(), 'MMMM dd, yyyy')}`, 20, currentY + 52);

      // ===== FOOTER =====
      const footerY = pageHeight - 10;
      doc.setTextColor(156, 163, 175);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Generated by PeakPlay Performance Analytics', 15, footerY);
      doc.text('Confidential Report - For Internal Use Only', pageWidth - 65, footerY);

      // Save with personalized filename
      const fileName = `${safeStudentData.student.name.replace(/\s+/g, '_')}_Performance_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

      onGenerateComplete?.();
    } catch (error) {
      console.error('Error generating PDF:', error);
      onGenerateError?.(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonContent = (
    <>
      {isGenerating ? (
        <FiLoader className="h-3 w-3 animate-spin mr-2" />
      ) : (
        <FiDownload className="h-3 w-3 mr-2" />
      )}
      {isGenerating ? 'Generating...' : 'Generate Report'}
    </>
  );

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={generatePDF}
        disabled={isGenerating}
        className={`p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] flex items-center justify-center ${className}`}
        title="Generate PDF Report"
      >
        {isGenerating ? (
          <FiLoader className="h-3 w-3 animate-spin" />
        ) : (
          <FiDownload className="h-3 w-3" />
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={generatePDF}
      disabled={isGenerating}
      className={`w-full flex items-center justify-center px-2 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] ${className}`}
    >
      {buttonContent}
    </motion.button>
  );
} 