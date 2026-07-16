import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { logAudit, getClientIp } from "@/lib/audit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
  interface User {
    role: Role;
    wachtwoordGewijzigdOp: number;
  }
}

const MAX_MISLUKTE_POGINGEN = 5;
const LOCKOUT_MINUTEN = 15;

class AccountGeblokkeerd extends CredentialsSignin {
  code = "account-locked";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = getClientIp(request);
        const email = credentials.email as string;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.active) {
          await logAudit({ actie: "INLOGGEN_MISLUKT", email, ip, detail: "onbekend e-mailadres" });
          return null;
        }

        if (user.inlogGeblokkeerdTot && user.inlogGeblokkeerdTot > new Date()) {
          await logAudit({ actie: "INLOGGEN_GEBLOKKEERD", userId: user.id, email, ip });
          throw new AccountGeblokkeerd();
        }

        if (!user.password) {
          await logAudit({ actie: "INLOGGEN_MISLUKT", userId: user.id, email, ip, detail: "account nog niet geactiveerd" });
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!valid) {
          const pogingen = user.mislukteInlogpogingen + 1;
          const geblokkeerd = pogingen >= MAX_MISLUKTE_POGINGEN;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              mislukteInlogpogingen: geblokkeerd ? 0 : pogingen,
              inlogGeblokkeerdTot: geblokkeerd
                ? new Date(Date.now() + LOCKOUT_MINUTEN * 60 * 1000)
                : null,
            },
          });
          await logAudit({
            actie: geblokkeerd ? "ACCOUNT_GEBLOKKEERD" : "INLOGGEN_MISLUKT",
            userId: user.id,
            email,
            ip,
            detail: geblokkeerd ? `${MAX_MISLUKTE_POGINGEN} mislukte pogingen op rij` : undefined,
          });
          if (geblokkeerd) throw new AccountGeblokkeerd();
          return null;
        }

        if (user.mislukteInlogpogingen > 0 || user.inlogGeblokkeerdTot) {
          await prisma.user.update({
            where: { id: user.id },
            data: { mislukteInlogpogingen: 0, inlogGeblokkeerdTot: null },
          });
        }

        await logAudit({ actie: "INLOGGEN_GELUKT", userId: user.id, email, ip });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          wachtwoordGewijzigdOp: user.wachtwoordGewijzigdOp.getTime(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.wachtwoordGewijzigdOp = user.wachtwoordGewijzigdOp;
        return token;
      }

      const actueel = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { wachtwoordGewijzigdOp: true, active: true },
      });

      if (
        !actueel ||
        !actueel.active ||
        actueel.wachtwoordGewijzigdOp.getTime() !== token.wachtwoordGewijzigdOp
      ) {
        return null;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
