import { NANCE_API_URL } from "@/constants/Nance";
import { ImageResponse } from '@vercel/og';
import Image from "next/image";
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
    const proposalRes = await fetch(`${NANCE_API_URL}/${space}/proposal/${id}`);
    const proposalData = await proposalRes.json();
    
    const proposal = proposalData.data;

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
              {space}
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
            <Image
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
