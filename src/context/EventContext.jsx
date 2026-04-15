import { useEffect, useState } from "react";
import { getAllEvents } from "../api/api";
import EventContext from "../hook/useEvents";

export default function EventProvider({ children }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getAllEvents();
            setEvents(
                Array.isArray(res.data)
                    ? res.data
                    : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : [])
            );
        }
        catch (error) {
            console.error("Error fetching events:", error);
            setError("Failed to load events. Please try again.");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetchEvents();
    }, []);

    return (
        <EventContext.Provider value={{ events, loading, error, refetchEvents }}>
            {children}
        </EventContext.Provider>
    );
}