import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/*
Export sheets:
- For each table/game, make a separate sheet
- Each sheet contains: CN, Name, CO, Group, day columns..., 2/4-N, 3/6-Z, TOT-HR, TA, NET
*/

export const exportAllToExcel = (guests, days, meta = {}) => {
  if (!guests || guests.length === 0) {
    return alert("No data to export");
  }

  const wb = XLSX.utils.book_new();
  const tables = [...new Set(guests.map((g) => g.table || "Main"))];

  tables.forEach((table) => {
    const tableGuests = guests.filter((g) => g.table === table);
    const rows = tableGuests.map((g) => {
      const row = {
        CN: g.cn || "",
        Name: g.guestName,
        "C/O": g.co || "",
        Group: g.group || "",
        Total: Number(g.total || 0),
      };
      // day columns
      g.days.forEach((d, idx) => {
        row[days[idx] || `Day-${idx + 1}`] = Number(d.credit || 0);
      });
      row["2/4-N"] = Number(g["2/4-N"] || 0);
      row["3/6-Z"] = Number(g["3/6-Z"] || 0);
      row["TOT-HR"] = Number(g["2/4-N"] || 0) + Number(g["3/6-Z"] || 0);
      row["TA"] = Number(g.TA || 0);
      row["NET TOTAL"] = Number(g.total || 0) + Number(g.TA || 0);
      return row;
    });

    // add summary row at end
    const totals = rows.reduce((acc, r) => {
      acc.Total = (acc.Total || 0) + Number(r.Total || 0);
      acc["2/4-N"] = (acc["2/4-N"] || 0) + Number(r["2/4-N"] || 0);
      acc["3/6-Z"] = (acc["3/6-Z"] || 0) + Number(r["3/6-Z"] || 0);
      acc["TOT-HR"] = (acc["TOT-HR"] || 0) + Number(r["TOT-HR"] || 0);
      acc["TA"] = (acc["TA"] || 0) + Number(r["TA"] || 0);
      acc["NET TOTAL"] = (acc["NET TOTAL"] || 0) + Number(r["NET TOTAL"] || 0);
      return acc;
    }, {});

    const summary = { CN: "", Name: `${table} TOTALS`, "C/O": "", Group: "" };
    Object.assign(summary, { Total: totals.Total || 0 });
    days.forEach((d) => (summary[d] = ""));
    summary["2/4-N"] = totals["2/4-N"] || 0;
    summary["3/6-Z"] = totals["3/6-Z"] || 0;
    summary["TOT-HR"] = totals["TOT-HR"] || 0;
    summary["TA"] = totals["TA"] || 0;
    summary["NET TOTAL"] = totals["NET TOTAL"] || 0;

    rows.push(summary);

    const ws = XLSX.utils.json_to_sheet(rows, { origin: "A1" });

    // Add heading rows with casino & group names
    const header = [
      [meta.casinoName || "CASINO", "", "", "", ""],
      [meta.groupName || "GROUP", "", "", "", ""],
      [`Table: ${table}`, "", "", "", ""],
      []
    ];
    const headerWs = XLSX.utils.aoa_to_sheet(header);
    // Combine header and data by copying cells
    const finalWs = XLSX.utils.sheet_add_json(headerWs, rows, { origin: -1, skipHeader: false });

    XLSX.utils.book_append_sheet(wb, finalWs, table.substring(0, 31));
  });

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), `casino_report.xlsx`);
};
