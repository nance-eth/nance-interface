import { NANCE_API_URL } from "@/constants/Nance";
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { pathname } = new URL(req.url);
  
  // Get space and id from path
  const [space, id] = pathname.split('/').slice(-2);

  try {
    // Fetch proposal data and space info
    const [proposalRes, spaceRes] = await Promise.all([
      fetch(`${NANCE_API_URL}/${space}/proposal/${id}`),
      fetch(`${NANCE_API_URL}/${space}`)
    ]);
    
    const [proposalData, spaceData] = await Promise.all([
      proposalRes.json(),
      spaceRes.json()
    ]);
    
    const proposal = proposalData.data;
    const spaceInfo = spaceData.data;

    // Format the end date based on status and available data
    let endDate = null;
    if (proposal?.status?.toLowerCase() === 'voting' && spaceInfo?.currentEvent?.end) {
      // Use currentEvent.end for active votes
      endDate = new Date(spaceInfo.currentEvent.end).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } else if (proposal?.voteEndTime) {
      // Fallback to proposal's voteEndTime
      endDate = new Date(proposal.voteEndTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '60px',
            position: 'relative',
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            width: '100%'
          }}>
            <span style={{ 
              fontSize: '48px',
              color: '#4B5563',
              textTransform: 'uppercase',
              fontWeight: 800
            }}>
              {spaceInfo?.displayName || space}
            </span>
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              marginTop: '24px',
              color: '#111827',
              maxWidth: '90%',
              display: 'flex'
            }}
          >
            {proposal?.title || 'Proposal'}
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px', 
            marginTop: '16px',
            width: '100%'
          }}>
            <div
              style={{
                fontSize: '36px',
                color: '#6B7280',
                display: 'flex'
              }}
            >
              {proposal?.status || 'Loading...'}
            </div>
            {endDate && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#6B7280',
                  display: 'flex',
                  fontStyle: 'italic'
                }}
              >
                Ends {endDate}
              </div>
            )}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#9CA3AF',
              fontSize: '24px',
            }}
          >
            <span>powered by</span>
            <img
              src="https://nance.app/images/logo-min.svg"
              alt="Nance Logo"
              width="32"
              height="32"
            />
            <span style={{ fontWeight: 600, fontSize: '32px' }}>Nance</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    // Return default OG image on error
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
} 
