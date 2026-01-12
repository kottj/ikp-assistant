import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations

export async function createSession(patientId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      patient_id: patientId,
      specialist_type: 'cardiology',
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'in_progress' | 'phase_1_complete' | 'phase_2_complete' | 'completed'
) {
  const updateData: Record<string, unknown> = { status };
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveResponse(
  sessionId: string,
  phase: 1 | 2,
  questionId: string,
  questionText: string,
  answer: string
) {
  const { data, error } = await supabase
    .from('responses')
    .insert({
      session_id: sessionId,
      phase,
      question_id: questionId,
      question_text: questionText,
      answer,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionResponses(sessionId: string) {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function saveReport(
  sessionId: string,
  content: Record<string, unknown>,
  pdfUrl?: string
) {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      session_id: sessionId,
      content,
      pdf_url: pdfUrl || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReport(sessionId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) throw error;
  return data;
}
