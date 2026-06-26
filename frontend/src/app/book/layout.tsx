import { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  const parts = host.split('.');
  let subdomain = '';
  if (parts.length > 2) {
    subdomain = parts[0];
  } else if (parts.length === 2 && host.includes('localhost')) {
    subdomain = parts[0];
  }

  if (!subdomain || subdomain === 'www' || subdomain === 'useclinixy') {
    return {
      title: 'Book Appointment',
      description: 'Book your medical appointment online instantly.',
    };
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/public/${subdomain}`, { next: { revalidate: 60 } });
    const data = await res.json();
    
    if (data && data.data && data.data.name) {
      const clinicName = data.data.name;
      return {
        title: `${clinicName} - Book Appointment Online`,
        description: `Book an online appointment with doctors at ${clinicName}. Instant scheduling and confirmation.`,
        openGraph: {
          title: `${clinicName} - Book Appointment`,
          description: `Book your next medical appointment at ${clinicName} easily through our online portal.`,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch clinic metadata', error);
  }

  return {
    title: 'Book Appointment',
    description: 'Book your medical appointment online instantly.',
  };
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
