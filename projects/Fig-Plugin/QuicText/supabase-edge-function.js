// Supabase Edge Function for tracking total commands
// Deploy this to: https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/track-commands

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (req.method === 'POST') {
      // Update total commands with delta increments
      const { device_id, delta, total_commands } = await req.json()

      if (!device_id || (typeof delta !== 'number' && typeof total_commands !== 'number')) {
        return new Response(
          JSON.stringify({ error: 'Invalid request data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If delta provided, atomically increment (read -> compute -> upsert)
      if (typeof delta === 'number') {
        // Read existing value
        const { data: existingRows, error: selectError } = await supabaseClient
          .from('command_usage')
          .select('device_id,total_commands')
          .eq('device_id', device_id)
          .limit(1)

        if (selectError) {
          console.error('Database select error:', selectError)
          return new Response(
            JSON.stringify({ error: 'Database error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const current = existingRows && existingRows[0] && typeof existingRows[0].total_commands === 'number' ? existingRows[0].total_commands : 0
        const newTotal = current + delta

        const { data, error } = await supabaseClient
          .from('command_usage')
          .upsert(
            {
              device_id,
              total_commands: newTotal,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'device_id' }
          )

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Database error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, delta, total_commands: newTotal }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Legacy path: accept absolute total_commands
      if (typeof total_commands === 'number') {
        const { data, error } = await supabaseClient
          .from('command_usage')
          .upsert(
            {
              device_id,
              total_commands,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'device_id' }
          )

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Database error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, total_commands }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

    } else if (req.method === 'GET') {
      // Return the global total sum of commands across all devices
      const { data, error } = await supabaseClient
        .from('command_usage')
        .select('total_commands')

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ total_commands: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const sum = (data || []).reduce((acc, row) => acc + (row?.total_commands || 0), 0)

      return new Response(
        JSON.stringify({ total_commands: sum }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

