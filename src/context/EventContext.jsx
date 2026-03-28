import { useEffect, useState } from "react";
import { getAllEvents } from "../api/api";
import EventContext from "../hook/useEvents";

export default function EventProvider({ children }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);           // ← Important: Start loading
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
            }finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <EventContext.Provider value={{ events, loading, error }}>
            {children}
        </EventContext.Provider>
    );
}