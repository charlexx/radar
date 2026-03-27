export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    // Validate required fields
    const required = ['title', 'artist_names', 'venue_name', 'city', 'country', 'start_date', 'type', 'submitter_email'];
    const missing = required.filter(f => !data[f] || data[f].trim() === '');
    if (missing.length > 0) {
      return new Response(JSON.stringify({ error: 'Missing required fields', fields: missing }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic email validation
    if (!data.submitter_email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build submission record
    const submission = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
      submitted_at: new Date().toISOString(),
      status: 'pending',
      reviewed: false,
      title: data.title.trim(),
      artist_names: data.artist_names.trim(),
      artist_origin: (data.artist_origin || '').trim(),
      venue_name: data.venue_name.trim(),
      city: data.city.trim(),
      country: data.country.trim(),
      start_date: data.start_date.trim(),
      end_date: (data.end_date || '').trim(),
      type: data.type.trim(),
      admission: (data.admission || '').trim(),
      mediums: (data.mediums || '').trim(),
      description: (data.description || '').trim(),
      exhibition_url: (data.exhibition_url || '').trim(),
      submitter_name: (data.submitter_name || '').trim(),
      submitter_email: data.submitter_email.trim(),
      submitter_role: (data.submitter_role || '').trim()
    };

    // Store in KV
    // The KV namespace is bound as SUBMISSIONS in the Pages project settings
    await context.env.SUBMISSIONS.put(submission.id, JSON.stringify(submission));

    // Also maintain an index of all submission IDs for easy listing
    let index = [];
    try {
      const existingIndex = await context.env.SUBMISSIONS.get('__index__');
      if (existingIndex) {
        index = JSON.parse(existingIndex);
      }
    } catch (e) {
      index = [];
    }
    index.push(submission.id);
    await context.env.SUBMISSIONS.put('__index__', JSON.stringify(index));

    return new Response(JSON.stringify({ success: true, id: submission.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Reject non-POST requests
export async function onRequestGet() {
  return new Response('Method not allowed', { status: 405 });
}
