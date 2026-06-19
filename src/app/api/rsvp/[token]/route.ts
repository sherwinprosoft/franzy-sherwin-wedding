import {
  getRsvpErrorResponse,
  getRsvpParty,
  updateRsvpParty,
} from "@/lib/rsvp";

type RouteParams = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;
    const party = await getRsvpParty(token);

    return Response.json({ party });
  } catch (error) {
    const response = getRsvpErrorResponse(error);

    return Response.json(response.body, { status: response.status });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;
    const payload = await request.json();
    const party = await updateRsvpParty(token, payload);

    return Response.json({ party });
  } catch (error) {
    const response = getRsvpErrorResponse(error);

    return Response.json(response.body, { status: response.status });
  }
}
