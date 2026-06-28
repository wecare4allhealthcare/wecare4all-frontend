/**
 * utils/calendarExport.js — "Add to Calendar" for confirmed appointments.
 *
 * Two options, both pure client-side, no API key or paid service needed:
 *  - downloadICS(appt)     → generates a standard .ics file (works with
 *                            Apple Calendar, Outlook, and can be imported
 *                            into Google Calendar too)
 *  - googleCalendarUrl(appt) → a plain deep-link URL that opens Google
 *                            Calendar's own "add event" screen pre-filled
 *
 * Appointment date/time is stored as naive IST wall-clock values
 * (confirmed from the appointment-reminders work earlier in this
 * project — appointment_date/appointment_time are IST, not UTC). Both
 * calendar formats need a real UTC instant, so this converts IST → UTC
 * by subtracting the fixed +5:30 offset, verified against several
 * cases including the midnight-rollover edge case.
 */

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DEFAULT_DURATION_MIN = 30; // matches the platform's default slot length (slot_mins)

function toUtcStamp(dateStr, timeStr, addMinutes = 0) {
  const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
  const [y, mo, d] = dateStr.split("-").map(Number);
  let utcMs = Date.UTC(y, mo - 1, d, h, m, 0) - IST_OFFSET_MS;
  utcMs += addMinutes * 60 * 1000;
  const dt = new Date(utcMs);
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
}

function escapeICS(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function buildEventDetails(appt) {
  const doctorName = appt.doctors?.full_name ? `Dr. ${appt.doctors.full_name}` : "your doctor";
  const typeLabel = { video: "Video Consultation", inperson: "In-Person Visit", home: "Home Visit" }[appt.appointment_type] || "Consultation";
  const title = `${typeLabel} with ${doctorName}`;

  const descLines = [
    `Appointment with ${doctorName}`,
    appt.video_room_url ? `Join link: ${appt.video_room_url}` : null,
    "Booked via We Care 4 'all'",
  ].filter(Boolean);

  const location =
    appt.appointment_type === "video" ? (appt.video_room_url || "Online") :
    appt.appointment_type === "home"  ? "Your registered address" :
    (appt.doctors?.location || "Clinic — see confirmation email for address");

  return { title, description: descLines.join("\n"), location };
}

export function downloadICS(appt) {
  const { title, description, location } = buildEventDetails(appt);
  const dtStart = toUtcStamp(appt.appointment_date, appt.appointment_time);
  const dtEnd   = toUtcStamp(appt.appointment_date, appt.appointment_time, DEFAULT_DURATION_MIN);
  const dtStamp = toUtcStamp(
    new Date().toISOString().slice(0, 10),
    new Date().toISOString().slice(11, 16)
  );
  const uid = `${appt.id}@wecare4all`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//We Care 4 all//Appointment//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(location)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Appointment reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `appointment-${appt.id.slice(0, 8)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(appt) {
  const { title, description, location } = buildEventDetails(appt);
  const dtStart = toUtcStamp(appt.appointment_date, appt.appointment_time);
  const dtEnd   = toUtcStamp(appt.appointment_date, appt.appointment_time, DEFAULT_DURATION_MIN);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dtStart}/${dtEnd}`,
    details: description,
    location: location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
