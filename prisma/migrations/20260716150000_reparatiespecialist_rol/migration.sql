-- Nieuwe rol voor reparatiespecialisten: zelfde basisrechten als een
-- shopmedewerker, met daarbovenop het recht om reparatie- en
-- verkoopprijzen te beheren (zie /api/admin/reparatieprijzen en
-- /api/admin/verkoopprijzen).
ALTER TYPE "Role" ADD VALUE 'REPARATIESPECIALIST';
