import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    
    // Server-side fetch to get the clinic name for SEO
    const res = await fetch(`${apiUrl}/public/${params.slug}`, { 
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      return { 
        title: 'Book Appointment | Clinixy',
        description: 'Book your medical appointment instantly online.'
      };
    }

    const json = await res.json();
    const clinic = json.data;

    if (!clinic) {
       return { 
         title: 'Book Appointment | Clinixy',
         description: 'Book your medical appointment instantly online.'
       };
    }

    return {
      title: `Book Appointment - ${clinic.name}`,
      description: `Book your medical appointment online with ${clinic.name}. View available doctors, select a time slot, and confirm instantly. Powered by Clinixy.`,
      openGraph: {
        title: `Book Appointment - ${clinic.name}`,
        description: `Book your medical appointment online with ${clinic.name}. View available doctors, select a time slot, and confirm instantly.`,
        siteName: 'Clinixy',
      }
    };
  } catch (error) {
    return {
      title: 'Book Appointment | Clinixy',
      description: 'Book your medical appointment instantly online.'
    };
  }
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
