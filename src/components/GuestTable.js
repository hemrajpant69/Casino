import React, { useState } from "react";

export default function GuestTable({ guests, days, onUpdate, onDelete, showGuestNameInAction }) {
  const [expandedId, setExpandedId] = useState(null);

  const totals = guests.reduce(
    (acc, g) => {
      acc.total += Number(g.total || 0);
      acc.hours24 += Number(g["2/4-N"] || 0);
      acc.hours36 += Number(g["3/6-Z"] || 0);
      return acc;
    },
    { total: 0, hours24: 0, hours36: 0 }
  );

  return (
    <div className="card p-3">
      <h5>Credit Details</h5>

      <div className="table-responsive">
        <table className="table table-bordered table-casino">
          <thead>
            <tr>
              <th style={{ width: 50 }}>C.N</th>
              <th>GUEST NAME</th>
              <th>C/O</th>
              <th>GROUP</th>
              <th>TOTAL</th>
              {days.map((d, i) => (
                <th key={i}>{d}</th>
              ))}
              <th>2/4-N</th>
              <th>3/6-Z</th>
              <th>TOT-HR</th>
              <th>TA</th>
              <th>NET TOTAL</th>
              <th style={{ width: 130 }}>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {guests.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center small-muted">
                  No records yet
                </td>
              </tr>
            )}

            {guests.map((g, idx) => {
              const net = Number(g.total || 0) + Number(g.TA || 0);
              const totHr = Number(g["2/4-N"] || 0) + Number(g["3/6-Z"] || 0);
              return (
                <tr key={g.id}>
                  <td>{g.cn}</td>
                  <td style={{ textAlign: "left" }}>{g.guestName}</td>
                  <td>{g.co}</td>
                  <td>{g.group}</td>
                  <td style={{ textAlign: "right" }}>{g.total}</td>

                  {g.days.map((dd, i) => (
                    <td key={i} style={{ textAlign: "right" }} className={dd.credit < 0 ? "neg" : ""}>
                      {dd.credit}
                    </td>
                  ))}

                  <td style={{ textAlign: "right" }}>{g["2/4-N"]}</td>
                  <td style={{ textAlign: "right" }}>{g["3/6-Z"]}</td>
                  <td style={{ textAlign: "right" }}>{totHr}</td>
                  <td style={{ textAlign: "right" }}>{g.TA || 0}</td>
                  <td style={{ textAlign: "right" }} className="cell-net">
                    {net}
                  </td>

                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
                      >
                        View
                      </button>

                      {showGuestNameInAction ? (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => alert(`Guest: ${g.guestName}\nCN: ${g.cn}`)}
                        >
                          {g.guestName}
                        </button>
                      ) : null}

                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(g.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                TOTAL CREDIT & HOUR
              </td>
              <td style={{ textAlign: "right" }}>{totals.total}</td>
              { /* empty cells for day columns */ }
              {days.map((_, i) => (
                <td key={i}></td>
              ))}
              <td style={{ textAlign: "right" }}>{totals.hours24}</td>
              <td style={{ textAlign: "right" }}>{totals.hours36}</td>
              <td style={{ textAlign: "right" }}>{totals.hours24 + totals.hours36}</td>
              <td style={{ textAlign: "right" }} className="cell-subtotal">
                {totals.total}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
