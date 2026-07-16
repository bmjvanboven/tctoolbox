-- Maak password optioneel: nieuwe gebruikers kunnen worden uitgenodigd
-- (via e-mail hun eigen wachtwoord instellen) zonder dat de admin zelf
-- een wachtwoord hoeft te verzinnen. Zolang password NULL is, kan het
-- account niet inloggen (zie authorize() in src/lib/auth.ts).
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
