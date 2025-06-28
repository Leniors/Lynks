// app/user/[username]/page.tsx

import UserPage from './UserPage';

export default function Page({ params }: { params: { username: string } }) {
  return <UserPage username={params.username} />;
}
