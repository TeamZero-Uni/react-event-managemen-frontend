import { useEffect, useState } from "react";
import { getAllEvents } from "../api/api";
import EventContext from "../hook/useEvents";

export default function EventProvider({ children }) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await getAllEvents();
                setEvents(res.data);
            }
            catch (error) {
                console.error("Error fetching events:", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <EventContext.Provider value={{ events }}>
            {children}
        </EventContext.Provider>
    );
}