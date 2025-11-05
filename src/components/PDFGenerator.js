import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
/*
Exports:
- Per-guest PDF (two modes: single-day snapshot or full multi-day)
*/

export default function PDFGenerator({ guests, days }) {
  const saveGuestPdf = async (guest, mode = "full") => {
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });

    // Header area
    doc.setFontSize(18);
    doc.text("ATLANTIZ CASINO , CALANGUTE", 40, 40);
    doc.setFontSize(12);
    doc.text("KESHAR GROUP", 40, 60);
    doc.text(`CREDIT DETAILS AS ON ${days.join(" , ")}`, 40, 78);

    // basic info
    doc.setFontSize(11);
    doc.text(`Guest: ${guest.guestName}`, 40, 110);
    doc.text(`C/O: ${guest.co}`, 260, 110);
    doc.text(`Group: ${guest.group}`, 420, 110);
    doc.text(`Time Played: ${guest.timePlayed || "-"}`, 610, 110);

    // table
    const head = [
      ["C.N", "GUEST NAME", "C/O", "GROUP", "TOTAL", ...days, "2/4-N", "3/6-Z", "TOT-HR", "NET TOTAL"],
    ];

    // For "full" mode show the single guest row; for "singleDay" you may pass different body.
    const dayCredits = guest.days.map((d) => Number(d.credit || 0));
    const totHr = Number(guest["2/4-N"] || 0) + Number(guest["3/6-Z"] || 0);
    const bodyRow = [
      "1",
      guest.guestName,
      guest.co,
      guest.group,
      Number(guest.total || 0),
      ...dayCredits,
      Number(guest["2/4-N"] || 0),
      Number(guest["3/6-Z"] || 0),
      totHr,
      Number(guest.total || 0),
    ];

    autoTable(doc, {
      startY: 130,
      head: head,
      body: [bodyRow],
      styles: { fontSize: 10, halign: "right" },
      headStyles: { fillColor: [255, 214, 0], textColor: 0, halign: "center" },
      columnStyles: {
        1: { halign: "left" }, // guest name left align
      },
    });

    // summary block - totals / avg sample - here we show totals for the single guest
    const finalY = doc.lastAutoTable.finalY || 200;
    doc.setFontSize(11);
    doc.text("T.A", 40, finalY + 30);
    doc.text(String(guest.total || 0), 120, finalY + 30);

    doc.save(`${guest.guestName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div>
      <div className="d-flex gap-2">
        {guests.length === 0 ? (
          <div className="small-muted">No guests yet to export</div>
        ) : (
          guests.map((g) => (
            <div key={g.id}>
              <button className="btn btn-outline-primary btn-sm me-1" onClick={() => saveGuestPdf(g, "full")}>
                PDF: {g.guestName}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
