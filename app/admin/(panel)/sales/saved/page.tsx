import { Card } from "../../../_components/ui";

export default function SavedLeadsPage() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-white">Saved Leads</h2>
      <p className="mt-2 text-sm text-[#cfd9e5]">
        Leads you flag from the Home Sales or Businesses tabs land here.
        Each saved lead carries a status (new / contacted / quoted /
        won / dead), notes, and next-action timestamps so the Bulldog
        sales team can work it without spreadsheets.
      </p>
      <p className="mt-4 text-xs text-[#7a8aa0]">
        Empty until the scrapers are wired and you start saving prospects.
      </p>
    </Card>
  );
}
