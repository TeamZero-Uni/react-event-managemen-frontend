import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateEvent } from "../../api/api.js";
import { uploadFile } from "../../utils/mediaUpload.js";
import toast from "react-hot-toast";

export default function EditEvent() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  if (!state?.eventId) {
    navigate("/organizer/my-events");
    return null;
  }

  const [eventTitle, setEventTitle] = useState(state.eventTitle || "");
  const [eventType, setEventType] = useState(state.eventType || "");
  const [eventDate, setEventDate] = useState(state.eventDate || "");
  const [startTime, setStartTime] = useState((state.startTime || "").slice(0, 5));
  const [endTime, setEndTime] = useState((state.endTime || "").slice(0, 5));
  const [venueName, setVenueName] = useState(state.venueName || "");
  const [maxParticipants, setMaxParticipants] = useState(state.maxParticipants || "");
  const [budget, setBudget] = useState(state.budget || "");
  const [description, setDescription] = useState(state.description || "");
  const [posterFile, setPosterFile] = useState(null);
  const [preview, setPreview] = useState(state.posterUrl || null);
  const [loading, setLoading] = useState(false);

  const normalizeNumber = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const parsed = Number(value);
    return Number.isFinite(parsed) ? String(parsed) : String(value);
  };

  const initialData = {
    eventTitle: (state.eventTitle || "").trim(),
    eventType: state.eventType || "",
    eventDate: state.eventDate || "",
    startTime: (state.startTime || "").slice(0, 5),
    endTime: (state.endTime || "").slice(0, 5),
    venueName: state.venueName || "",
    maxParticipants: normalizeNumber(state.maxParticipants),
    budget: normalizeNumber(state.budget),
    description: (state.description || "").trim(),
    posterUrl: state.posterUrl || "",
  };

  const currentData = {
    eventTitle: eventTitle.trim(),
    eventType,
    eventDate,
    startTime,
    endTime,
    venueName,
    maxParticipants: normalizeNumber(maxParticipants),
    budget: normalizeNumber(budget),
    description: description.trim(),
    posterUrl: preview || "",
  };

  const hasChanges =
    currentData.eventTitle !== initialData.eventTitle ||
    currentData.eventType !== initialData.eventType ||
    currentData.eventDate !== initialData.eventDate ||
    currentData.startTime !== initialData.startTime ||
    currentData.endTime !== initialData.endTime ||
    currentData.venueName !== initialData.venueName ||
    currentData.maxParticipants !== initialData.maxParticipants ||
    currentData.budget !== initialData.budget ||
    currentData.description !== initialData.description ||
    currentData.posterUrl !== initialData.posterUrl;

  const hasDateTimeChanges =
    currentData.eventDate !== initialData.eventDate ||
    currentData.startTime !== initialData.startTime ||
    currentData.endTime !== initialData.endTime;

  const participantCount = Number(maxParticipants);
  const budgetAmount = Number(budget);
  const isFormReady =
    !!eventTitle.trim() &&
    !!eventType &&
    !!eventDate &&
    !!startTime &&
    !!endTime &&
    !!venueName &&
    !!description.trim() &&
    maxParticipants !== "" &&
    budget !== "" &&
    Number.isFinite(participantCount) &&
    participantCount > 0 &&
    Number.isFinite(budgetAmount) &&
    budgetAmount > 0;

  const handleUpdateNotifyClick = () => {
    if (!hasChanges || !isFormReady || loading) return;
    toast("Saving changes and notifying all participants...", { icon: "📢" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPosterFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setPosterFile(null);
    setPreview(null);
  };

  const handleCancel = () => {
    navigate("/organizer/my-events");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const trimmedTitle = eventTitle.trim();
      const trimmedDescription = description.trim();

      if (!hasChanges) {
        toast.error("No changes detected to update.");
        return;
      }

      if (
        !trimmedTitle ||
        !eventType ||
        !eventDate ||
        !startTime ||
        !endTime ||
        !venueName ||
        !trimmedDescription ||
        maxParticipants === "" ||
        budget === ""
      ) {
        toast.error("Please fill all required fields.");
        return;
      }

      if (!Number.isFinite(participantCount) || participantCount <= 0) {
        toast.error("Max capacity must be greater than 0.");
        return;
      }

      if (!Number.isFinite(budgetAmount) || budgetAmount <= 0) {
        toast.error("Budget must be greater than 0.");
        return;
      }

      if (startTime >= endTime) {
        toast.error("End time must be after start time.");
        return;
      }

      if (hasDateTimeChanges) {
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        if (eventDate < today) {
          toast.error("Event date cannot be in the past.");
          return;
        }

        if (eventDate === today) {
          const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes()
          ).padStart(2, "0")}`;

          if (startTime <= currentTime) {
            toast.error("Start time cannot be in the past.");
            return;
          }
        }
      }

      // ✅ REMOVED: localStorage token check
      // Token is automatically added by AuthContext interceptor

      setLoading(true);

      let posterUrl = state.posterUrl || "";
      if (posterFile) {
        posterUrl = await uploadFile(posterFile);
      }
      if (!preview) {
        posterUrl = "";
      }

      const eventData = {
        eventTitle: trimmedTitle,
        eventType,
        venueName,
        eventDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        maxParticipants: participantCount,
        budget: budgetAmount,
        description: trimmedDescription,
        posterUrl,
        status: state.status || "PENDING",
      };

      // ✅ FIXED: No token passed - interceptor handles it automatically
      const response = await updateEvent(state.eventId, eventData);

      if (response?.success || response?.data || response?.message) {
        toast.success(response?.message || "Event updated successfully");
        setTimeout(() => {
          navigate("/organizer/my-events");
        }, 800);
      } else {
        toast.error(response?.message || "Failed to update event");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full text-white text-sm outline-none transition-all duration-300 placeholder-white/20 py-3 px-4 appearance-none";

  const inputStyle = {
    background: "rgba(6,14,26,0.8)",
    border: "1px solid rgba(201,162,39,0.15)",
  };

  const labelStyle = {
    color: "#c9a227",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#060e1a" }}>
      <div
        className="relative w-full max-w-2xl backdrop-blur-xl p-8"
        style={{
          background: "rgba(10,22,40,0.7)",
          border: "1px solid rgba(201,162,39,0.12)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,162,39,0.08)",
        }}
      >
        <div
          className="absolute top-0 left-8 right-8 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)",
          }}
        />

        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-0 h-0"
            style={{
              borderStyle: "solid",
              borderWidth: "0 32px 32px 0",
              borderColor: "transparent rgba(201,162,39,0.25) transparent transparent",
            }}
          />
        </div>

        <div className="mb-8 text-center">
          <p className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(201,162,39,0.5)" }}>
            Organizer Panel
          </p>
          <h2 className="font-bold text-white text-2xl" style={{ fontFamily: "Playfair Display, serif" }}>
            Update Event
          </h2>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Field label="Event Title" labelStyle={labelStyle}>
            <input
              type="text"
              id="title"
              placeholder="Enter event title"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className={inputBase}
              style={{ ...inputStyle }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(201,162,39,0.6)";
                e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                e.target.style.background = "#060e1a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(201,162,39,0.15)";
                e.target.style.boxShadow = "none";
                e.target.style.background = "rgba(6,14,26,0.8)";
              }}
            />
          </Field>

          <Field label="Event Type" labelStyle={labelStyle}>
            <select
              id="type"
              required
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={inputBase}
              style={{ ...inputStyle }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(201,162,39,0.6)";
                e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                e.target.style.background = "#060e1a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(201,162,39,0.15)";
                e.target.style.boxShadow = "none";
                e.target.style.background = "rgba(6,14,26,0.8)";
              }}
            >
              <option value="" disabled style={{ background: "#0a1525" }}>
                Select a type...
              </option>
              <option value="CONFERENCE" style={{ background: "#0a1525" }}>
                Conference
              </option>
              <option value="FESTIVAL" style={{ background: "#0a1525" }}>
                Festival
              </option>
              <option value="MEETUP" style={{ background: "#0a1525" }}>
                Meetup
              </option>
              <option value="SEMINAR" style={{ background: "#0a1525" }}>
                Seminar
              </option>
              <option value="WORKSHOP" style={{ background: "#0a1525" }}>
                Workshop
              </option>
            </select>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Date" labelStyle={labelStyle}>
              <input
                type="date"
                id="event_date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputBase}
                style={{ ...inputStyle }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.6)";
                  e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                  e.target.style.background = "#060e1a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.15)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(6,14,26,0.8)";
                }}
              />
            </Field>
            <Field label="Start Time" labelStyle={labelStyle}>
              <input
                type="time"
                id="start_time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputBase}
                style={{ ...inputStyle }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.6)";
                  e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                  e.target.style.background = "#060e1a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.15)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(6,14,26,0.8)";
                }}
              />
            </Field>
            <Field label="End Time" labelStyle={labelStyle}>
              <input
                type="time"
                id="end_time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputBase}
                style={{ ...inputStyle }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.6)";
                  e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                  e.target.style.background = "#060e1a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.15)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(6,14,26,0.8)";
                }}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Venue" labelStyle={labelStyle}>
              <select
                id="venue_name"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className={inputBase}
                style={{ ...inputStyle }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.6)";
                  e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                  e.target.style.background = "#060e1a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.15)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(6,14,26,0.8)";
                }}
              >
                <option value="" disabled style={{ background: "#0a1525" }}>
                  Select a venue...
                </option>
                <option value="Main Hall" style={{ background: "#0a1525" }}>
                  Main Hall
                </option>
                <option value="Auditorium" style={{ background: "#0a1525" }}>
                  Auditorium
                </option>
                <option value="Open Ground" style={{ background: "#0a1525" }}>
                  Open Ground
                </option>
              </select>
            </Field>
            <Field label="Max Capacity" labelStyle={labelStyle}>
              <input
                type="number"
                id="max_participants"
                placeholder="e.g. 500"
                required
                min="1"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className={inputBase}
                style={{ ...inputStyle }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.6)";
                  e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                  e.target.style.background = "#060e1a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.15)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(6,14,26,0.8)";
                }}
              />
            </Field>
            <Field label="Budget" labelStyle={labelStyle}>
              <input
                type="number"
                id="budget"
                placeholder="e.g. 10000"
                required
                min="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={inputBase}
                style={{ ...inputStyle }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.6)";
                  e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                  e.target.style.background = "#060e1a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(201,162,39,0.15)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(6,14,26,0.8)";
                }}
              />
            </Field>
          </div>

          <Field label="Upload Poster Image" labelStyle={labelStyle}>
            {!preview ? (
              <input
                type="file"
                id="poster_file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-white/50 cursor-pointer py-3 px-4 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:tracking-widest file:uppercase file:cursor-pointer file:transition-all"
                style={{
                  background: "rgba(6,14,26,0.8)",
                  border: "1px solid rgba(201,162,39,0.15)",
                }}
              />
            ) : (
              <div
                className="p-3"
                style={{ border: "1px solid rgba(201,162,39,0.2)", background: "rgba(6,14,26,0.8)" }}
              >
                <img src={preview} alt="preview" className="w-full h-48 object-cover" />
                {posterFile?.name && (
                  <p className="text-xs mt-2" style={{ color: "rgba(201,162,39,0.7)" }}>
                    {posterFile.name} ({(posterFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <label
                    htmlFor="poster_file_change"
                    className="flex-1 text-center cursor-pointer font-bold text-xs tracking-widest uppercase py-2 px-4 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #c9a227, #a07c18)",
                      color: "#0a1525",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                  >
                    Change Photo
                  </label>
                  <input
                    type="file"
                    id="poster_file_change"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-1 font-bold text-xs tracking-widest uppercase py-2 px-4 transition-all"
                    style={{
                      background: "rgba(201,62,39,0.1)",
                      border: "1px solid rgba(201,62,39,0.3)",
                      color: "#e05a4a",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,62,39,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,62,39,0.1)")}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}
          </Field>

          <Field label="Description" labelStyle={labelStyle}>
            <textarea
              id="description"
              rows="4"
              placeholder="Tell us about the event..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputBase} resize-none`}
              style={{ ...inputStyle }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(201,162,39,0.6)";
                e.target.style.boxShadow = "0 0 0 1px rgba(201,162,39,0.15)";
                e.target.style.background = "#060e1a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(201,162,39,0.15)";
                e.target.style.boxShadow = "none";
                e.target.style.background = "rgba(6,14,26,0.8)";
              }}
            />
          </Field>

          <div className="py-1">
            <div
              className="h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.15), transparent)",
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              onClick={handleUpdateNotifyClick}
              disabled={loading || !hasChanges || !isFormReady}
              className="flex-1 font-bold text-[11px] tracking-[0.28em] uppercase py-4 transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c9a227, #a07c18)",
                color: "#0a1525",
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                boxShadow: "0 4px 20px rgba(201,162,39,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(201,162,39,0.5)";
                e.currentTarget.style.filter = "brightness(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,162,39,0.3)";
                e.currentTarget.style.filter = "none";
              }}
            >
              {loading ? "Updating..." : "Update & Notify All"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="sm:w-1/3 font-bold text-[11px] tracking-[0.28em] uppercase py-4 transition-all duration-300 active:scale-[0.98]"
              style={{
                background: "transparent",
                border: "1px solid rgba(201,162,39,0.4)",
                color: "#c9a227",
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(201,162,39,0.08)";
                e.currentTarget.style.borderColor = "rgba(201,162,39,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(201,162,39,0.4)";
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, labelStyle, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold tracking-[0.25em] uppercase" style={labelStyle}>
        {label}
      </label>
      {children}
    </div>
  );
}