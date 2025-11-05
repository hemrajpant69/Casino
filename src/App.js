import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Navbar from "./components/Navbar";
import GuestForm from "./components/GuestForm";
import GuestTable from "./components/GuestTable";
import PDFGenerator from "./components/PDFGenerator";

const STORAGE_KEY = "casino_admin_v1";

const DEFAULT_DAY_LABELS = ["29-Aug", "30-Aug", "31-Aug"]; // change as required

export default function App() {
  const [guests, setGuests] = useState([]);
  const [days, setDays] = useState(DEFAULT_DAY_LABELS);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setGuests(parsed.guests || []);
      setDays(parsed.days || DEFAULT_DAY_LABELS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ guests, days }));
  }, [guests, days]);

  const addGuest = (guest) => {
    guest.id = uuidv4();
    setGuests((p) => [guest, ...p]);
  };

  const updateGuest = (updated) => {
    setGuests((p) => p.map((g) => (g.id === updated.id ? updated : g)));
  };

  const removeGuest = (id) => {
    setGuests((p) => p.filter((g) => g.id !== id));
  };

  const totals = guests.reduce(
    (acc, g) => {
      acc.totalCredit += Number(g.total || 0);
      acc.hours24 += Number(g["2/4-N"] || 0);
      acc.hours36 += Number(g["3/6-Z"] || 0);
      return acc;
    },
    { totalCredit: 0, hours24: 0, hours36: 0 }
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="header d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">ATLANTIZ CASINO , CALANGUTE</h4>
            <div className="small-muted">KESHAR GROUP — CREDIT DETAILS</div>
            <div className="small-muted">Dates: {days.join(" , ")}</div>
          </div>
          <div className="text-end">
            <div className="small-muted">Guests: {guests.length}</div>
            <div className="small-muted">Total Credit: {totals.totalCredit}</div>
          </div>
        </div>

        <div className="row my-3">
          <div className="col-lg-4">
            <GuestForm onAdd={addGuest} days={days} setDays={setDays} />
          </div>

          <div className="col-lg-8">
            <GuestTable
              guests={guests}
              days={days}
              onUpdate={updateGuest}
              onDelete={removeGuest}
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
              <PDFGenerator guests={guests} days={days} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
