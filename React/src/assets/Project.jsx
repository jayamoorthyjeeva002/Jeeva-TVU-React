import React, { useState, useEffect, useMemo } from 'react';

const MOCK_STUDENTS = {
  'batch-a': [
    { id: '01', name: 'Balaji.M' },
    { id: '02', name: 'Mathan.R' },
    { id: '03', name: 'Boopathi.E'},
   ],
  'batch-b': [
    { id: '04', name: 'Manoj kumar.L' },
    { id: '05', name: 'Saaran Raj.M' }
  ]
};
function Project() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('attendance_records');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentFormAttendance, setCurrentFormAttendance] = useState({});

  useEffect(() => {
    localStorage.setItem('attendance_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (selectedBatch && selectedDate) {
      const savedDayRecords = records[selectedBatch]?.[selectedDate] || {};
      const initialFormState = {};
      MOCK_STUDENTS[selectedBatch]?.forEach(student => {
        initialFormState[student.id] = savedDayRecords[student.id] || '';
      });
      setCurrentFormAttendance(initialFormState);
    } else {
      setCurrentFormAttendance({});
    }
  }, [selectedBatch, selectedDate, records]);

  const handleStatusChange = (studentId, status) => {
    setCurrentFormAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedBatch || !selectedDate) return;

    setRecords(prev => ({
      ...prev,
      [selectedBatch]: {
        ...(prev[selectedBatch] || {}),
        [selectedDate]: currentFormAttendance
      }
    }));
    
    alert('Attendance updated successfully.');
  };

  const metrics = useMemo(() => {
    if (!selectedBatch) return { daily: '0.0%', overall: '0.0%' };
    const totalStudentsInBatch = MOCK_STUDENTS[selectedBatch]?.length || 0;
    if (totalStudentsInBatch === 0) return { daily: '0.0%', overall: '0.0%' };

    const activeFormEntries = Object.values(currentFormAttendance);
    const completedDailyEntries = activeFormEntries.filter(status => status !== '').length;
    const dailyPresentCount = activeFormEntries.filter(status => status === 'Present').length;
    const dailyPercentage = completedDailyEntries > 0 
      ? ((dailyPresentCount / completedDailyEntries) * 100).toFixed(1) 
      : '0.0';

    const batchHistory = records[selectedBatch] || {};
    let totalHistoricalSlots = 0;
    let totalHistoricalPresent = 0;

    Object.values(batchHistory).forEach(dayRecord => {
      Object.values(dayRecord).forEach(status => {
        totalHistoricalSlots++;
        if (status === 'Present') totalHistoricalPresent++;
      });
    });

    const overallPercentage = totalHistoricalSlots > 0
      ? ((totalHistoricalPresent / totalHistoricalSlots) * 100).toFixed(1)
      : '0.0';

    return { daily: `${dailyPercentage}%`, overall: `${overallPercentage}%` };
  }, [selectedBatch, currentFormAttendance, records]);

  return (
    <main className="card1">
      <header>
        <center>
          <h1> Trainer Session Attendance Dashboard </h1>
        </center>
      </header>

      <section className="controls-card">
        <center>
        <form className="controls-form">
          <div className="field-group">
            <label htmlFor="batch-select">Select Batch:</label>
            <select 
              id="batch-select" 
              value={selectedBatch} 
              onChange={(e) => setSelectedBatch(e.target.value)}
              required
            >
              <option value="">-- Choose a Batch --</option>
              <option value="batch-a">Computer Science(Batch A)</option>
              <option value="batch-b">Comuter Application(Batch B)</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="attendance-date">Date:</label>
            <input 
              type="date" 
              id="attendance-date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>
        </form>
        </center>
      </section>
    
      <section className="roster-section">
        <center>
        <h2>Daily Attendance Marker</h2>
        {selectedBatch ? (
          <form onSubmit={handleSave}>
            <table className="attendance-table">
              <caption className="table-caption">
                Mark Present or Absent for each student row below.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Student ID</th>
                  <th scope="col">Student Name</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {(MOCK_STUDENTS[selectedBatch] || []).map(student => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td><strong>{student.name}</strong></td>
                    <td>
                      <label className="radio-label">
                        <input 
                          type="radio" 
                          name={`status-${student.id}`} 
                          value="Present"
                          checked={currentFormAttendance[student.id] === 'Present'}
                          onChange={() => handleStatusChange(student.id, 'Present')}
                          required
                        /> Present
                      </label>
                      <label className="radio-label">
                        <input 
                          type="radio" 
                          name={`status-${student.id}`} 
                          value="Absent"
                          checked={currentFormAttendance[student.id] === 'Absent'}
                          onChange={() => handleStatusChange(student.id, 'Absent')}
                        /> Absent
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="submit" className="submit-btn">
              Save Attendance
            </button>
          </form>
        ) : (
          <p className="placeholder-text">Please select a batch above to display the student information.</p>
        )}
        </center>
      </section>

      <section className="metrics-section">
        <center>
          <h2>Summary</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3> Attendance percentage </h3>
            <h2>{metrics.daily}</h2>
          </div>
          <div className="metric-card">
            <h3> Average of the Students presence in percentage </h3>
            <h2>{metrics.overall}</h2>
          </div>
        </div>
        </center>
      </section>
    </main>
  );
}
export default Project;