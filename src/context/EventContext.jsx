import { useEffect, useState } from "react";
import { getAllEvents, getAllRegistrations } from "../api/api";
import EventContext from "../hook/useEvents";

const extractList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    return [];
};

const getEventId = (event) => event?.event_id ?? event?.id ?? event?.eventId;

const getRegistrationEventId = (registration) =>
    registration?.event?.event_id ??
    registration?.event?.id ??
    registration?.event?.eventId ??
    registration?.eventId ??
    registration?.event_id;

export default function EventProvider({ children }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const eventsResponse = await getAllEvents();
            const eventList = extractList(eventsResponse);

            let registrations = [];
            try {
                const registrationsResponse = await getAllRegistrations();
                registrations = extractList(registrationsResponse);
            } catch (registrationError) {
                console.warn("Error fetching registrations:", registrationError);
            }

            const participationCounts = registrations.reduce((counts, registration) => {
                const eventId = getRegistrationEventId(registration);
                if (eventId == null) return counts;

                const key = String(eventId);
                counts[key] = (counts[key] || 0) + 1;
                return counts;
            }, {});

            setEvents(
                eventList.map((event) => {
                    const eventId = getEventId(event);
                    const participantCount = eventId == null
                        ? 0
                        : participationCounts[String(eventId)] || 0;

                    return {
                        ...event,
                        participantCount,
                        registeredCount: participantCount,
                    };
                })
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

    useEffect(() => {
        const handleFocus = () => {
            refetchEvents();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refetchEvents();
            }
        };

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return (
        <EventContext.Provider value={{ events, loading, error, refetchEvents }}>
            {children}
        </EventContext.Provider>
    );
}