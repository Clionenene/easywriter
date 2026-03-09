import { DocumentType, ElementStatus } from "@prisma/client";

export type WritingElementLLM = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimated_minutes: number;
  dependencies: string[];
  status: ElementStatus;
  completion_criteria: string;
  example_output: string;
  bad_example: string;
  hint: string;
  why_needed: string;
};

export type AnalysisResult = {
  summary: string;
  document_type: DocumentType;
  missing_sections: string[];
  redundant_sections: string[];
  structural_feedback: string;
  logical_feedback: string;
  elements: WritingElementLLM[];
};

export type SubmissionFeedback = {
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  next_sentence: string;
  passed: boolean;
  score: number;
  summary: string;
};

type ApiError = {
  error: string;
  detail?: string;
};

export type ProjectCreateResponse =
  | {
      id: string;
      title: string;
    }
  | ApiError;

export type NextElementResponse = {
  next: {
    id: string;
    title: string;
    description: string;
    whyNeeded: string | null;
    completionCriteria: string;
    exampleOutput: string;
    badExample: string | null;
    hint: string | null;
    estimatedMinutes: number;
    difficulty: number;
    category: string;
    userOutput: string | null;
  } | null;
};
