/**
 * context/AnnouncementHeightContext.js — lets the fixed Navbar (and the
 * public Layout's <main> top padding) know the real, current height of
 * the global AnnouncementBanner, so they can sit directly below it
 * instead of overlapping it. Defaults to 0 (no banner showing).
 */
import { createContext, useContext } from "react";

export const AnnouncementHeightContext = createContext(0);
export const useAnnouncementHeight = () => useContext(AnnouncementHeightContext);
