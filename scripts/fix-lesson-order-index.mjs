#!/usr/bin/env node
/**
 * Fix Bible Study Lesson order_index values
 * 
 * This script normalizes order_index to start at 0 for each study.
 * Run with: node scripts/fix-lesson-order-index.mjs
 * 
 * Optional: Pass a study title to fix only that study:
 *   node scripts/fix-lesson-order-index.mjs "Baptism"
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixLessonOrderIndex(studyTitleFilter = null) {
  console.log('Fetching Bible studies...');
  
  // Get all studies (or filter by title)
  let studiesQuery = supabase.from('bible_studies').select('id, title');
  if (studyTitleFilter) {
    studiesQuery = studiesQuery.ilike('title', `%${studyTitleFilter}%`);
  }
  
  const { data: studies, error: studiesError } = await studiesQuery;
  
  if (studiesError) {
    console.error('Error fetching studies:', studiesError);
    return;
  }
  
  console.log(`Found ${studies.length} studies to check\n`);
  
  let totalFixed = 0;
  
  for (const study of studies) {
    // Get lessons for this study, ordered by current order_index
    const { data: lessons, error: lessonsError } = await supabase
      .from('bible_study_lessons')
      .select('id, title, order_index')
      .eq('study_id', study.id)
      .order('order_index', { ascending: true });
    
    if (lessonsError) {
      console.error(`Error fetching lessons for "${study.title}":`, lessonsError);
      continue;
    }
    
    if (!lessons || lessons.length === 0) {
      continue;
    }
    
    // Check if order_index needs fixing (should be 0, 1, 2, ...)
    const needsFix = lessons.some((lesson, idx) => lesson.order_index !== idx);
    
    if (!needsFix) {
      console.log(`✓ "${study.title}" - ${lessons.length} lessons, order_index OK`);
      continue;
    }
    
    // Show current state
    console.log(`\n⚠ "${study.title}" - needs fixing:`);
    lessons.forEach((lesson, idx) => {
      const status = lesson.order_index !== idx ? '❌' : '✓';
      console.log(`  ${status} Lesson "${lesson.title}" - current: ${lesson.order_index}, should be: ${idx}`);
    });
    
    // Fix the order_index values
    console.log(`  Fixing...`);
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      if (lesson.order_index !== i) {
        const { data: updateData, error: updateError } = await supabase
          .from('bible_study_lessons')
          .update({ order_index: i })
          .eq('id', lesson.id)
          .select('id, order_index');
        
        if (updateError) {
          console.error(`  Error updating lesson "${lesson.title}":`, updateError);
        } else {
          console.log(`    Updated "${lesson.title}": ${lesson.order_index} -> ${updateData?.[0]?.order_index}`);
          totalFixed++;
        }
      }
    }
    console.log(`  ✓ Fixed ${study.title}`);
  }
  
  console.log(`\n========================================`);
  console.log(`Done! Fixed ${totalFixed} lesson(s) across ${studies.length} studies.`);
}

// Get optional study title filter from command line
const studyTitleFilter = process.argv[2] || null;

if (studyTitleFilter) {
  console.log(`Filtering studies by title containing: "${studyTitleFilter}"\n`);
}

fixLessonOrderIndex(studyTitleFilter);
