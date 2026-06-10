import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import InstellingenForm from "./InstellingenForm";

export default async function InstellingenPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });

  return (
    <div className="max-w-lg">
      <InstellingenForm user={{ voornaam: user?.voornaam ?? "", achternaam: user?.achternaam ?? "", email: user?.email ?? "" }} />
    </div>
  );
}
