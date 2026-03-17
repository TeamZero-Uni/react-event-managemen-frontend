import { createContext, useContext } from "react";

const EventContext = createContext();

export const useEvents = () => useContext(EventContext);

export default EventContext;