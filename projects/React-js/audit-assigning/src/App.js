import React, { useState, useEffect } from "react";

export default function AuditFrequencyGenerator() {
  const [auditType, setAuditType] = useState("");
  const [department, setDepartment] = useState("");
  const [shift, setShift] = useState("Any Shift");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minEndDate, setMinEndDate] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [periods, setPeriods] = useState([]);

  // 🧭 Function to calculate frequency span
  const getEndDateByFrequency = (start, freq) => {
    let newEnd = new Date(start);
    switch (freq) {
      case "Daily":
        break;
      case "Weekly":
        newEnd.setDate(start.getDate() + 6);
        break;
      case "Monthly":
        newEnd.setMonth(start.getMonth() + 1);
        newEnd.setDate(newEnd.getDate() - 1);
        break;
      case "Quarterly":
        newEnd.setMonth(start.getMonth() + 3);
        newEnd.setDate(newEnd.getDate() - 1);
        break;
      case "Half-Yearly":
        newEnd.setMonth(start.getMonth() + 6);
        newEnd.setDate(newEnd.getDate() - 1);
        break;
      default:
        break;
    }
    return newEnd;
  };

  // ⚙️ Automatically update end date and restriction when frequency or start changes
  useEffect(() => {
    if (!startDate) return;
    const start = new Date(startDate);
    const newEnd = getEndDateByFrequency(start, frequency);
    const formatted = newEnd.toISOString().split("T")[0];
    setEndDate(formatted);
    setMinEndDate(formatted);
  }, [startDate, frequency]);

  const generatePeriods = () => {
    if (!startDate || !endDate || !auditType || !department) {
      alert("Please fill all required fields before generating.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = [];
    let count = 1;

    // Handle Daily / Weekly / Monthly / Quarterly / Half-Yearly
    const pushPeriod = (label, s, e) =>
      result.push({ label, start: s.toDateString(), end: e.toDateString() });

    if (frequency === "Daily") {
      const cur = new Date(start);
      while (cur <= end) {
        pushPeriod(`Day ${count}`, cur, cur);
        cur.setDate(cur.getDate() + 1);
        count++;
      }
    } else if (frequency === "Weekly") {
      let cur = new Date(start);
      while (cur <= end) {
        const weekStart = new Date(cur);
        const weekEnd = new Date(cur);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > end) break;
        pushPeriod(`Week ${count}`, weekStart, weekEnd);
        cur.setDate(cur.getDate() + 7);
        count++;
      }
    } else if (frequency === "Monthly" || frequency === "Quarterly" || frequency === "Half-Yearly") {
      const cur = new Date(start);
      const increment = frequency === "Monthly" ? 1 : frequency === "Quarterly" ? 3 : 6;
      while (cur <= end) {
        const pStart = new Date(cur);
        const pEnd = new Date(cur);
        pEnd.setMonth(pEnd.getMonth() + increment);
        pEnd.setDate(pEnd.getDate() - 1);
        if (pEnd > end) break;
        pushPeriod(`${frequency} ${count}`, pStart, pEnd);
        cur.setMonth(cur.getMonth() + increment);
        count++;
      }
    }

    setPeriods(result);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Audit Assignment Generator</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Audit Type: </label>
        <select value={auditType} onChange={(e) => setAuditType(e.target.value)}>
          <option value="">-- Select Audit --</option>
          <option>System Audit</option>
          <option>Process Audit</option>
          <option>Product Audit</option>
          <option>Layered Process Audit</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Department: </label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">-- Select Department --</option>
          <option>Paint Shop</option>
          <option>Assembly</option>
          <option>Production</option>
          <option>Maintenance</option>
          <option>Quality Control</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Shift: </label>
        <select value={shift} onChange={(e) => setShift(e.target.value)}>
          <option>Any Shift</option>
          <option>S1</option>
          <option>S2</option>
          <option>S3</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Frequency: </label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Half-Yearly</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Start Date: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>End Date: </label>
        <input
          type="date"
          value={endDate}
          min={minEndDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button onClick={generatePeriods} style={{ padding: "6px 12px" }}>
        Generate Schedule
      </button>

      <hr />

      {periods.length > 0 && (
        <div>
          <h3>
            Generated {periods.length} {frequency}{" "}
            {periods.length === 1 ? "period" : "periods"}:
          </h3>
          <ul>
            {periods.map((p, i) => (
              <li key={i} style={{ marginBottom: "8px" }}>
                <strong>{p.label}</strong>: {p.start} → {p.end} <br />
                <span>
                  Audit: {auditType} | Department: {department}
                  {shift !== "Any Shift" && ` | Shift: ${shift}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
