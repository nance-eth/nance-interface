import { NANCE_API_URL } from "@/constants/Nance";
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import React from 'react';

// Get avatar from Stamp.fyi for snapshot spaces
function getImageUrl(spaceInfo: any): string {
  if (!spaceInfo) return "https://nance.app/images/logo-min.svg";
  
  // Use Stamp.fyi avatar service if we have a snapshot space
  if (spaceInfo.snapshotSpace) {
    return `https://cdn.stamp.fyi/avatar/${spaceInfo.snapshotSpace}`;
  }
  
  // Fallback to space avatar or Nance logo
  return spaceInfo.avatarURL || "https://nance.app/images/logo-min.svg";
}

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams, pathname } = new URL(req.url);
  
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

    // Get logo URL using Stamp.fyi for snapshot spaces
    const logoUrl = getImageUrl(spaceInfo);

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
            padding: '40px 60px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={logoUrl}
              alt="Space Logo"
              width="48"
              height="48"
              style={{
                borderRadius: '50%',
              }}
            />
            <span style={{ 
              marginLeft: '12px',
              fontSize: '24px',
              color: '#4B5563',
              textTransform: 'uppercase'
            }}>
              {spaceInfo?.displayName || space}
            </span>
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 600,
              marginTop: '20px',
              color: '#111827',
              maxWidth: '90%'
            }}
          >
            {proposal?.title || 'Proposal'}
          </div>
          <div
            style={{
              fontSize: '24px',
              marginTop: '12px',
              color: '#6B7280',
            }}
          >
            {proposal?.status || 'Loading...'}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#9CA3AF',
              fontSize: '18px',
            }}
          >
            <span>powered by</span>
            <img
              src="https://nance.app/images/logo-min.svg"
              alt="Nance Logo"
              width="28"
              height="28"
            />
            <span style={{ fontWeight: 500, fontSize: '20px' }}>Nance</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error('Error generating OG image:', e);
    // Return default OG image on error
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
} 
