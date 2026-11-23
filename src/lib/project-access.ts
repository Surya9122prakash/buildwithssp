import { prisma } from "@/lib/db";

/** Only the owner or the client assigned to a project may access it. */
export async function canAccessProject(
  projectId: string,
  user: { id: string; role: string }
): Promise<boolean> {
  if (user.role !== "owner" && user.role !== "client") return false;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(user.role === "client" ? { clientId: user.id } : {}),
    },
    select: { id: true },
  });
  return Boolean(project);
}
