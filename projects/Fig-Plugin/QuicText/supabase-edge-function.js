// Supabase Edge Function for syncing usage analytics
// Deploy this to: https://kmkjuuytbgpozrigspgw.supabase.co/functions/v1/sync-usage

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
      // Sync usage with delta increment
      const { delta, deviceId } = await req.json()

      if (typeof delta !== 'number' || delta < 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid delta: must be a non-negative number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!deviceId || typeof deviceId !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid deviceId: must be a non-empty string' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Read existing total
      const { data: existingRows, error: selectError } = await supabaseClient
        .from('command_usage')
        .select('total_commands')
        .eq('device_id', deviceId)
        .limit(1)

      if (selectError) {
        console.error('Database select error:', selectError)
        return new Response(
          JSON.stringify({ error: 'Database error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Calculate new total
      const current = existingRows && existingRows[0] && typeof existingRows[0].total_commands === 'number' 
        ? existingRows[0].total_commands 
        : 0
      const newTotal = current + delta

      // Upsert new total
      const { error: upsertError } = await supabaseClient
        .from('command_usage')
        .upsert(
          {
            device_id: deviceId,
            total_commands: newTotal,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'device_id' }
        )

      if (upsertError) {
        console.error('Database upsert error:', upsertError)
        return new Response(
          JSON.stringify({ error: 'Database error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return updated total
      return new Response(
        JSON.stringify({ 
          total_commands: newTotal,
          delta,
          updated_at: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

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

