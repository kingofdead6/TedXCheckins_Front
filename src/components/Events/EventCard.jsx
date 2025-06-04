import { Link } from 'react-router-dom';

function EventCard({ event }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-xl font-bold">{event.title}</h3>
      <p>{new Date(event.date).toLocaleDateString()}</p>
      <p>{event.description}</p>
      <Link
        to={`/events/${event._id}/attendees`}
        className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        View Attendees
      </Link>
    </div>
  );
}

export default EventCard;