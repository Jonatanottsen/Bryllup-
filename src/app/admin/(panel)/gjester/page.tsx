import { allergenLabel } from "@/config/wedding";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteResponse } from "../../actions";
import { getResponses } from "../../queries";

export default async function GuestsAdmin() {
  const responses = await getResponses();
  const speeches = responses.filter((r) => r.attending && r.speechWanted);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-5xl">Gjester</h1>
        <div className="flex gap-2">
          <a className="btn-outline" href="/admin/eksport/gjester">Eksporter gjester (CSV)</a>
        </div>
      </div>

      <section className="card overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="p-3">Svar</th>
              <th className="p-3">Personer</th>
              <th className="p-3">Allergier / diett</th>
              <th className="p-3">Kontakt</th>
              <th className="p-3">Hilsen</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id} className="border-t border-black/5 align-top">
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.attending ? "bg-sage-light text-sage-dark" : "bg-rose/10 text-rose"}`}>
                    {r.attending ? "Kommer" : "Kommer ikke"}
                  </span>
                </td>
                <td className="p-3">{r.guests.map((g) => <div key={g.id}>{g.fullName}</div>)}</td>
                <td className="p-3">
                  {r.guests.map((g) => (
                    <div key={g.id}>
                      {g.dietary.length || g.dietaryNotes ? (
                        <>
                          {g.dietary.map(allergenLabel).join(", ")}
                          {g.dietaryNotes && <em className="text-muted"> {g.dietaryNotes}</em>}
                        </>
                      ) : (
                        <span className="text-muted">–</span>
                      )}
                    </div>
                  ))}
                </td>
                <td className="p-3">
                  <div>{r.contactName}</div>
                  <a className="text-sage-dark underline" href={`mailto:${r.email}`}>{r.email}</a>
                  <div><a href={`tel:${r.phone}`}>{r.phone}</a></div>
                </td>
                <td className="max-w-xs p-3 text-muted">{r.message}</td>
                <td className="p-3">
                  <ConfirmButton action={deleteResponse.bind(null, r.id)} confirm={`Slette svaret fra ${r.contactName}?`}>Slett</ConfirmButton>
                </td>
              </tr>
            ))}
            {responses.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted">Ingen svar ennå.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section id="taler" className="card">
        <h2 className="mb-4 text-3xl">Taler og innslag ({speeches.length})</h2>
        {speeches.length === 0 ? (
          <p className="text-muted">Ingen påmeldt ennå.</p>
        ) : (
          <ul className="space-y-3">
            {speeches.map((r) => (
              <li key={r.id} className="rounded-lg bg-cream p-3">
                <strong>{r.contactName}</strong> · {r.phone} · {r.email}
                {r.speechNote && <p className="mt-1 text-muted">{r.speechNote}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
