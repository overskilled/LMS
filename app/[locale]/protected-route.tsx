// import { adminAuth } from '@/firebase/admin';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// export default async function ProtectedRoute({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     const cookieStore = await cookies();
//     const session = cookieStore.get('__session')?.value;

//     try {
//         if (!session) throw new Error('No session');
//         await adminAuth.verifySessionCookie(session, true);
//     } catch (error) {
//         redirect('/login');
//     }

//     return <>{children}</>;
// }