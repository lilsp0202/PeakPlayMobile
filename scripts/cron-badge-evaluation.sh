#!/bin/bash
# Cron wrapper for badge evaluation
cd "/Users/lilsp/peakplay-prototype"
/usr/bin/env node scripts/periodic-badge-evaluation.js >> logs/badge-evaluation.log 2>&1
