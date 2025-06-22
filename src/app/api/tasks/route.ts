import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

/**
 * GET /api/tasks?userId=xxx
 * Fetch user's tasks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ tasks });
    
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create new task and trigger optimization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, duration_min, priority, due_at } = body;
    
    // Validate required fields
    if (!userId || !title || !duration_min) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, duration_min' },
        { status: 400 }
      );
    }
    
    // Insert task into database
    const { data: task, error: insertError } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        description: description || null,
        duration_min: parseInt(duration_min),
        priority: priority || 1,
        due_at: due_at || null,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating task:', insertError);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }
    
    // Get user's existing events for context
    const { data: events } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('user_id', userId);
    
    // Call solver API for optimization
    try {
      const solverResponse = await fetch(`${process.env.NEXT_PUBLIC_SOLVER_API_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks: [task], // New task to schedule
          available_slots: events || [], // Existing events as constraints
        }),
      });
      
      if (solverResponse.ok) {
        const optimizationResult = await solverResponse.json();
        console.log('Optimization result:', optimizationResult);
        
        // TODO: Process optimization result and create events
        // For now, just log success
      } else {
        console.warn('Solver optimization failed, task created without scheduling');
      }
      
    } catch (solverError) {
      console.error('Solver API error:', solverError);
      // Don't fail task creation if solver is unavailable
    }
    
    return NextResponse.json({ 
      task,
      message: 'Task created successfully'
    });
    
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}