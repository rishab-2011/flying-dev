import { db } from "@/lib/db";
import { AddArea, AreaToggle, type AreaRow } from "@/components/admin/AreaManager";
import { addServiceAreaAction, toggleServiceAreaAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminAreasPage() {
  const areas = await db.serviceArea.findMany({
    orderBy: [{ city: "asc" }, { pincode: "asc" }],
  });

  const byCity = areas.reduce<Record<string, AreaRow[]>>((acc, area) => {
    (acc[area.city] ??= []).push(area);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <AddArea action={addServiceAreaAction} />

      <div className="space-y-6">
        {Object.entries(byCity).map(([city, rows]) => (
          <div key={city} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-surface-line px-5 py-4">
              <h2 className="font-semibold">{city}</h2>
              <span className="text-sm text-ink-muted">
                {rows.filter((r) => r.active).length} of {rows.length} live
              </span>
            </div>
            <div className="divide-y divide-surface-line">
              {rows.map((area) => (
                <AreaToggle key={area.id} area={area} action={toggleServiceAreaAction} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
