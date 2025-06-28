// app/user/[username]/page.tsx
import UserPage from "./UserPage";

type PageProps = {
  params: {
    username: string;
  };
};

export default function Page({ params }: PageProps) {
  return <UserPage username={params.username} />;
}
