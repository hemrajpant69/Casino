import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/*
PDFGenerator supports:
- Individual guest PDF (full multi-day snapshot) with TA
- Group PDF (all guests in current table) with totals (hours & credit)
*/

export default function PDFGenerator({ guests, days, casinoName = "", groupName = "" }) {
  const saveGuestPdf = async (guest) => {
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });

    // Header
    doc.setFontSize(18);
    doc.text(casinoName || "CASINO", 40, 40);
    doc.setFontSize(12);
    doc.text(groupName || "GROUP", 40, 60);
    doc.text(`CREDIT DETAILS AS ON ${days.join(" , ")}`, 40, 78);

    // Guest Info
    doc.setFontSize(11);
    doc.text(`Guest: ${guest.guestName}`, 40, 110);
    doc.text(`C/O: ${guest.co || "-"}`, 280, 110);
    doc.text(`C.N: ${guest.cn || "-"}`, 420, 110);
    doc.text(`Time Played: ${guest.timePlayed || "-"}`, 540, 110);

    // Table Head
    const head = [
      ["C.N", "GUEST NAME", "C/O", "GROUP", "TOTAL", ...days, "2/4-N", "3/6-Z", "TOT-HR", "TA", "NET TOTAL"],
    ];

    const dayCredits = guest.days.map((d) => Number(d.credit || 0));
    const totHr = Number(guest["2/4-N"] || 0) + Number(guest["3/6-Z"] || 0);
    const net = Number(guest.total || 0) + Number(guest.TA || 0);

    const bodyRow = [
      guest.cn || "",
      guest.guestName,
      guest.co || "",
      guest.group || "",
      Number(guest.total || 0),
      ...dayCredits,
      Number(guest["2/4-N"] || 0),
      Number(guest["3/6-Z"] || 0),
      totHr,
      Number(guest.TA || 0),
      net,
    ];

    autoTable(doc, {
      startY: 130,
      head: head,
      body: [bodyRow],
      styles: { fontSize: 10, halign: "right" },
      headStyles: { fillColor: [255, 214, 0], textColor: 0, halign: "center" },
      columnStyles: { 1: { halign: "left" } },
    });

    const finalY = doc.lastAutoTable.finalY || 200;
    doc.setFontSize(11);
    doc.text("T.A", 40, finalY + 30);
    doc.text(String(guest.TA || 0), 120, finalY + 30);

    doc.save(`${(guest.guestName || "guest").replace(/\s+/g, "_")}.pdf`);
  };

  const saveGroupPdf = async (tableName = "Group", filteredGuests = guests) => {
    if (filteredGuests.length === 0) return alert("No guests to export in this group.");
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });

    doc.setFontSize(18);
    doc.text(casinoName || "CASINO", 40, 40);
    doc.setFontSize(12);
    doc.text(groupName || "GROUP", 40, 60);
    doc.text(`TABLE: ${tableName} — ${days.join(" , ")}`, 40, 78);

    // Build head with dynamic day columns
    const headRow = ["C.N", "NAME", "C/O", "GROUP", "TOTAL", ...days, "2/4-N", "3/6-Z", "TOT-HR", "TA", "NET TOTAL"];
    const body = filteredGuests.map((g, idx) => {
      const dayCredits = g.days.map((d) => Number(d.credit || 0));
      const totHr = Number(g["2/4-N"] || 0) + Number(g["3/6-Z"] || 0);
      const net = Number(g.total || 0) + Number(g.TA || 0);
      return [g.cn || "", g.guestName, g.co || "", g.group || "", Number(g.total || 0), ...dayCredits, Number(g["2/4-N"] || 0), Number(g["3/6-Z"] || 0), totHr, Number(g.TA || 0), net];
    });

    autoTable(doc, {
      startY: 110,
      head: [headRow],
      body,
      styles: { fontSize: 9, halign: "right" },
      headStyles: { fillColor: [255, 214, 0], textColor: 0 }
    });

    // Totals
    const totals = filteredGuests.reduce(
      (acc, g) => {
        acc.total += Number(g.total || 0);
        acc.ta += Number(g.TA || 0);
        acc.hours24 += Number(g["2/4-N"] || 0);
        acc.hours36 += Number(g["3/6-Z"] || 0);
        return acc;
      },
      { total: 0, ta: 0, hours24: 0, hours36: 0 }
    );

    const finalY = doc.lastAutoTable.finalY || 200;
    doc.setFontSize(11);
    doc.text(`TOTAL CREDIT: ${totals.total}`, 40, finalY + 25);
    doc.text(`TOTAL TA: ${totals.ta}`, 200, finalY + 25);
    doc.text(`TOTAL HOURS: ${totals.hours24 + totals.hours36}`, 360, finalY + 25);

    doc.save(`${(tableName || "group").replace(/\s+/g, "_")}_report.pdf`);
  };

  return (
    <div className="d-flex gap-2">
      <div>
        {guests.length === 0 ? (
          <div className="small-muted">No guests yet to export</div>
        ) : (
          guests.map((g) => (
            <div key={g.id} style={{ display: "inline-block", marginRight: 8 }}>
              <button className="btn btn-outline-primary btn-sm me-1" onClick={() => saveGuestPdf(g)}>
                PDF: {g.guestName}
              </button>
            </div>
          ))
        )}
      </div>

      <div>
        <button
          className="btn btn-outline-success btn-sm"
          onClick={() => saveGroupPdf("GroupReport", guests)}
          disabled={guests.length === 0}
        >
          Group PDF (all)
        </button>
      </div>
    </div>
  );
}
