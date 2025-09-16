import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const { searchParams } = new URL(request.url);
  const place_id = searchParams.get('place_id');

  if (!place_id) {
    return NextResponse.json({ error: "place_id is required" }, { status: 400 });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,international_phone_number,website,url,rating,user_ratings_total,reviews&reviews_sort=newest&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Add logo path from environment variable
    const resultWithLogo = {
      ...data.result,
      logo_path: process.env.WIDGET_LOGO_PATH || '/g.jpg'
    };
    
    // Add CORS headers to allow cross-origin requests
    const response_data = NextResponse.json(resultWithLogo);
    response_data.headers.set('Access-Control-Allow-Origin', '*');
    response_data.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response_data.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response_data;
  } catch (err) {
    const error_response = NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    error_response.headers.set('Access-Control-Allow-Origin', '*');
    return error_response;
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
