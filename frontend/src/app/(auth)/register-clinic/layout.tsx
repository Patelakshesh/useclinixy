import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register Your Clinic - Start 14-Day Free Trial | Clinixy',
  description: 'Create your clinic account on Clinixy in seconds. Get a custom subdomain, online booking portal, and manage your practice effortlessly. Start your free trial today.',
  alternates: {
    canonical: 'https://useclinixy.online/register-clinic',
  }
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
