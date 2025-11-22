import React, { useState, useEffect } from "react";

/*
Guest structure:
{
  id, cn, guestName, co, group,
  days: [{date, credit}], total, '2/4-N', '3/6-Z', timePlayed, TA, table
}
*/

export default function GuestForm({ onAdd, days, setDays, activeTable }) {
  const [guestName, setGuestName] = useState("");
  const [cn, setCn] = useState("");
  const [co, setCo] = useState("");
  const [group, setGroup] = useState("");
  const [timePlayed, setTimePlayed] = useState("");
  const [credits, setCredits] = useState(days.map(() => 0));
  const [twofour, setTwofour] = useState(0);
  const [threeSix, setThreeSix] = useState(0);
  const [TA, setTA] = useState(0);

  useEffect(() => {
    setCredits((c) => {
      const copy = [...c];
      while (copy.length < days.length) copy.push(0);
      while (copy.length > days.length) copy.pop();
      return copy;
    });
  }, [days]);

  const calcTotal = () => credits.reduce((s, v) => s + Number(v || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return alert("Enter guest name");
    const guest = {
      cn,
      guestName,
      co,
      group,
      days: days.map((d, i) => ({ date: d, credit: Number(credits[i] || 0) })),
      total: calcTotal(),
      "2/4-N": Number(twofour || 0),
      "3/6-Z": Number(threeSix || 0),
      timePlayed,
      TA: Number(TA || 0),
      table: activeTable
    };
    onAdd(guest);
    // reset
    setGuestName("");
    setCn("");
    setCo("");
    setGroup("");
    setTimePlayed("");
    setCredits(days.map(() => 0));
    setTwofour(0);
    setThreeSix(0);
    setTA(0);
  };

  const updateCredit = (index, val) => {
    const copy = [...credits];
    copy[index] = val === "" ? "" : Number(val);
    setCredits(copy);
  };

  return (
    <div className="card p-3">
      <h5 className="mb-3">Add Guest (Multi-day)</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input
            className="form-control"
            placeholder="Guest Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>

        <div className="mb-2 d-flex gap-2">
          <input
            className="form-control"
            placeholder="C.N"
            value={cn}
            onChange={(e) => setCn(e.target.value)}
          />
          <input
            className="form-control"
            placeholder="C/O"
            value={co}
            onChange={(e) => setCo(e.target.value)}
          />
        </div>

        <div className="mb-2 d-flex gap-2">
          <input
            className="form-control"
            placeholder="Group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          />
          <input
            className="form-control"
            placeholder="Time Played (eg 2:00-4:30 PM)"
            value={timePlayed}
            onChange={(e) => setTimePlayed(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="form-label small-muted">Day-wise Credits</label>
          <div className="d-flex gap-2 flex-wrap">
            {days.map((d, i) => (
              <div key={i} style={{ minWidth: 110 }}>
                <div className="small-muted">{d}</div>
                <input
                  type="number"
                  className="form-control"
                  value={credits[i]}
                  onChange={(e) => updateCredit(i, e.target.value)}
                />
              </div>
            ))}
            <div style={{ minWidth: 110 }}>
              <div className="small-muted">&nbsp;</div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setDays((prev) => [...prev, `Day-${prev.length + 1}`])
                }
              >
                + Add Day
              </button>
            </div>
          </div>
        </div>

        <div className="mb-2 d-flex gap-2">
          <input
            className="form-control"
            placeholder="2/4-N hours"
            value={twofour}
            onChange={(e) => setTwofour(e.target.value)}
          />
          <input
            className="form-control"
            placeholder="3/6-Z hours"
            value={threeSix}
            onChange={(e) => setThreeSix(e.target.value)}
          />
          <input
            className="form-control"
            placeholder="T.A (Time Allowance)"
            value={TA}
            onChange={(e) => setTA(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="small-muted">Total: {calcTotal()}</div>
          <div>
            <button type="submit" className="btn btn-success">
              Add Guest
            </button>
          </div>
        </div>
      </form>

      <hr />
      <div>
        <label className="form-label small-muted">Edit Day Labels</label>
        <div className="d-flex gap-2">
          {days.map((d, i) => (
            <input
              key={i}
              className="form-control"
              value={d}
              onChange={(e) =>
                setDays((prev) => prev.map((p, idx) => (idx === i ? e.target.value : p)))
              }
            />
          ))}
          <button
            className="btn btn-outline-secondary"
            onClick={() => setDays((prev) => [...prev, `Day-${prev.length + 1}`])}
          >
            + Day
          </button>
        </div>
        <div className="small-muted mt-2">Change day labels to match your date range.</div>
      </div>
    </div>
  );
}
