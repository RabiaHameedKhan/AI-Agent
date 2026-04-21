import db, { ensureDatabase } from "@/lib/db";
import LandingPageClient from "@/components/LandingPageClient";

export default async function HomePage() {
  await ensureDatabase();

  const services = await db`
    SELECT id, name, description, duration_minutes, price, category
    FROM services
    ORDER BY id ASC
  `;

  return <LandingPageClient services={services} />;
}
