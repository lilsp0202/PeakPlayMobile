# PeakPlay Documentation

Welcome to the PeakPlay documentation. This guide covers everything you need to know about developing, deploying, and maintaining the PeakPlay athlete development platform.

## Table of Contents

1. [Architecture Overview](./architecture.md)
2. [Getting Started](./getting-started.md)
3. [API Reference](./api-reference.md)
4. [Database Schema](./database-schema.md)
5. [Deployment Guide](./deployment.md)
6. [Security & Compliance](./security.md)
7. [Testing Guide](./testing.md)
8. [Troubleshooting](./troubleshooting.md)

## Quick Links

- **Repository**: [GitHub](https://github.com/lilsp0202/PeakPlayMobile-prototype)
- **Production URL**: https://peakplay.vercel.app
- **Tech Stack**: Next.js 15, React 19, PostgreSQL, Prisma, NextAuth.js, TypeScript

## Overview

PeakPlay is a comprehensive athlete development platform that helps athletes track their performance, connect with professional coaches, and improve their skills through AI-powered insights.

### Key Features

- **Performance Tracking**: Track physical, mental, nutritional, and technical skills
- **Match Analytics**: Record and analyze match performances
- **Coaching Marketplace**: Connect with specialized coaches for personalized training
- **Achievement System**: Earn badges based on performance milestones
- **Voice Feedback**: AI-powered voice transcription for quick feedback
- **PWA Support**: Install as a mobile app for offline access

### Architecture Highlights

- **Frontend**: Next.js with App Router, React 19, TailwindCSS
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: NextAuth.js with credentials and Google OAuth
- **Monitoring**: Sentry for error tracking
- **Deployment**: Vercel with edge functions

### Development Philosophy

1. **Security First**: All endpoints are protected with authentication and rate limiting
2. **Type Safety**: Full TypeScript coverage with Zod validation
3. **Performance**: Optimized for mobile with PWA capabilities
4. **Scalability**: Designed for horizontal scaling with serverless architecture
5. **User Privacy**: GDPR compliant with data export and deletion capabilities

## Getting Help

- Check the [Troubleshooting Guide](./troubleshooting.md) for common issues
- Review the [API Reference](./api-reference.md) for endpoint documentation
- See [Security Guide](./security.md) for best practices

## Contributing

Please follow our coding standards and ensure all tests pass before submitting PRs. See [Getting Started](./getting-started.md) for development setup. 