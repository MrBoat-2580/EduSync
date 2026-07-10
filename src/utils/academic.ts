import type { ScoreRow } from '../lib/supabase';

// Convert a 0-100 score to a letter grade.
export function scoreToLetter(score: number): string {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
}

// Tailwind text color class for a given score.
export function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 80) return 'text-brand-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-rose-600';
}

// Tailwind bg color class for a given score (for bars).
export function scoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 80) return 'bg-brand-500';
  if (score >= 70) return 'bg-amber-500';
  return 'bg-rose-500';
}

// Average of an array of scores (0-100).
export function averageScore(scores: ScoreRow[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
}

// Convert a 0-100 average to a 4.0 GPA scale.
export function scoreToGpa(score: number): number {
  if (score >= 93) return 4.0;
  if (score >= 90) return 3.7;
  if (score >= 87) return 3.3;
  if (score >= 83) return 3.0;
  if (score >= 80) return 2.7;
  if (score >= 77) return 2.3;
  if (score >= 73) return 2.0;
  if (score >= 70) return 1.7;
  if (score >= 60) return 1.0;
  return 0.0;
}

// Status badge styling.
export function statusStyles(status: string): string {
  switch (status) {
    case 'Honors':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'At Risk':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20';
    default:
      return 'bg-brand-50 text-brand-700 ring-brand-600/20';
  }
}

// School level display label.
export function classLevelLabel(level: number): string {
  if (level === 1) return 'Nursery 1';
  if (level === 2) return 'Nursery 2';
  if (level === 3) return 'Kindergarten 1';
  if (level === 4) return 'Kindergarten 2';
  if (level >= 5 && level <= 10) return `Primary ${level - 4}`;
  if (level === 11) return 'JHS 1';
  if (level === 12) return 'JHS 2';
  if (level === 13) return 'JHS 3';
  return `Level ${level}`;
}

export function gradeLabel(level: number): string {
  return classLevelLabel(level);
}

// Group scores by term.
export function groupByTerm(scores: ScoreRow[]): Record<string, ScoreRow[]> {
  return scores.reduce(
    (acc, s) => {
      (acc[s.term] ??= []).push(s);
      return acc;
    },
    {} as Record<string, ScoreRow[]>,
  );
}

// Group scores by subject.
export function groupBySubject(scores: ScoreRow[]): Record<string, ScoreRow[]> {
  return scores.reduce(
    (acc, s) => {
      (acc[s.subject] ??= []).push(s);
      return acc;
    },
    {} as Record<string, ScoreRow[]>,
  );
}
