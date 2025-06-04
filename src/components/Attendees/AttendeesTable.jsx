function AttendeeTable({ attendees }) {
  if (attendees.length === 0) return <p>No attendees found.</p>;

  const headers = Object.keys(attendees[0].data);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="p-2 border">{header}</th>
            ))}
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Validation Time</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee._id}>
              {headers.map((header) => (
                <td key={header} className="p-2 border">{attendee.data[header]}</td>
              ))}
              <td className="p-2 border">{attendee.status}</td>
              <td className="p-2 border">
                {attendee.validationTime ? new Date(attendee.validationTime).toLocaleString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendeeTable;