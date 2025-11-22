import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Navbar from "./components/Navbar";
import GuestForm from "./components/GuestForm";
import GuestTable from "./components/GuestTable";
import PDFGenerator from "./components/PDFGenerator";
import { exportAllToExcel } from "./components/ExcelExport";

const STORAGE_KEY = "casino_admin_v1";
const SAMPLE_PDF_PATH = "/mnt/data/REPORT_7-9 JULY 2025.pdf"; // sample uploaded file (local path)

const DEFAULT_DAY_LABELS = ["07-Jul", "08-Jul", "09-Jul"];

export default function App() {
  const [guests, setGuests] = useState([]);
  const [days, setDays] = useState(DEFAULT_DAY_LABELS);
  const [casinoName, setCasinoName] = useState("ATLANTIZ CASINO , CALANGUTE");
  const [groupName, setGroupName] = useState("KESHAR GROUP");
  const [activeTable, setActiveTable] = useState("Main"); // allows multiple tables/games
  const [tables, setTables] = useState(["Main"]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setGuests(parsed.guests || []);
      setDays(parsed.days || DEFAULT_DAY_LABELS);
      setCasinoName(parsed.casinoName || "ATLANTIZ CASINO , CALANGUTE");
      setGroupName(parsed.groupName || "KESHAR GROUP");
      setTables(parsed.tables || ["Main"]);
      setActiveTable(parsed.activeTable || "Main");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ guests, days, casinoName, groupName, tables, activeTable })
    );
  }, [guests, days, casinoName, groupName, tables, activeTable]);

  const addGuest = (guest) => {
    guest.id = uuidv4();
    guest.table = activeTable; // attach to selected table
    setGuests((p) => [guest, ...p]);
  };

  const updateGuest = (updated) => {
    setGuests((p) => p.map((g) => (g.id === updated.id ? updated : g)));
  };

  const removeGuest = (id) => {
    setGuests((p) => p.filter((g) => g.id !== id));
  };

  const totalsForDisplay = guests
    .filter((g) => g.table === activeTable)
    .reduce(
      (acc, g) => {
        acc.totalCredit += Number(g.total || 0);
        acc.hours24 += Number(g["2/4-N"] || 0);
        acc.hours36 += Number(g["3/6-Z"] || 0);
        return acc;
      },
      { totalCredit: 0, hours24: 0, hours36: 0 }
    );

  const addTable = () => {
    const name = prompt("New table/game name (e.g. 1Z, 3MZ, 5N):");
    if (!name) return;
    setTables((t) => [...t, name]);
    setActiveTable(name);
  };

  const deleteTable = (name) => {
    if (!window.confirm(`Delete table ${name} and its guests?`)) return;
    setGuests((g) => g.filter((x) => x.table !== name));
    setTables((t) => t.filter((x) => x !== name));
    setActiveTable("Main");
  };

  return (
    <>
      <Navbar />
      <div className="container my-3">
        <div className="card p-3 mb-3">
          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control"
              value={casinoName}
              onChange={(e) => setCasinoName(e.target.value)}
              placeholder="Casino Name"
            />
            <input
              className="form-control"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
            />

            <div>
              <select
                className="form-select"
                value={activeTable}
                onChange={(e) => setActiveTable(e.target.value)}
              >
                {tables.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-outline-secondary" onClick={addTable}>
              + Add Table
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={() => deleteTable(activeTable)}
              disabled={activeTable === "Main"}
            >
              Delete Table
            </button>
          </div>

          <div className="mt-2 d-flex justify-content-between">
            <div>
              <strong>{casinoName}</strong> — <span className="small-muted">{groupName}</span>
            </div>
            <div className="text-end small-muted">
              Guests (table): {guests.filter((g) => g.table === activeTable).length} &nbsp; • &nbsp;
              Total Credit: {totalsForDisplay.totalCredit}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4 mb-3">
            <GuestForm
              onAdd={addGuest}
              days={days}
              setDays={setDays}
              activeTable={activeTable}
            />
          </div>

          <div className="col-lg-8">
            <GuestTable
              guests={guests.filter((g) => g.table === activeTable)}
              days={days}
              onUpdate={updateGuest}
              onDelete={removeGuest}
              showGuestNameInAction
            />

            <div className="mt-3 d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  if (!window.confirm("Clear all data?")) return;
                  setGuests([]);
                }}
              >
                Clear Data
              </button>

              <button
                className="btn btn-primary"
                onClick={() =>
                  exportAllToExcel(guests, days, { casinoName, groupName, tables })
                }
              >
                Export Excel (All tables)
              </button>

              <PDFGenerator
                guests={guests.filter((g) => g.table === activeTable)}
                days={days}
                casinoName={casinoName}
                groupName={groupName}
              />

              <a className="btn btn-outline-info" href={SAMPLE_PDF_PATH} target="_blank" rel="noreferrer">
                Open sample PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
