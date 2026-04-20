import db from "@/lib/db";
import LandingPageClient from "@/components/LandingPageClient";

export default function HomePage() {
  const services = db
    .prepare(
      `
        SELECT id, name, description, duration_minutes, price, category
        FROM services
        ORDER BY id ASC
      `
    )
    .all();

  return <LandingPageClient services={services} />;
}
