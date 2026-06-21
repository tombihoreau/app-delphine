import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuthStore from "../store/useAuthStore";
import MoodSmiley from "../components/MoodSmiley";
import SunIcon from "../components/SunIcon";
import HorizontalScrollRow from "../components/HorizontalScrollRow";

const weekLabels = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

const Chevron = ({ direction = "left" }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
  </svg>
);

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
);

const formatShortDate = (value) => {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year.slice(-2)}`;
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatWeekLabel = (weekRange) => {
  if (!weekRange?.start || !weekRange?.end) return "";
  return `${formatShortDate(weekRange.start)} au ${formatShortDate(weekRange.end)}`;
};

const buildWeekDays = (weekRange, assignments, checkins = []) => {
  if (!weekRange?.start) return [];
  const start = new Date(`${weekRange.start}T12:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const key = formatDateKey(current);
    return {
      key,
      label: weekLabels[index],
      day: current.getDate(),
      hasAssignment: assignments.some(
        (assignment) => assignment.scheduled_date === key,
      ),
      hasCheckin: checkins.some((checkin) => checkin.checkin_date === key),
    };
  });
};

const SessionCard = ({ assignment, compact = false, featured = false, onOpen }) => (
  <article
    className={`rounded-md border border-brand-tamarillo bg-brand-beige p-3 ${compact ? "min-w-[260px]" : ""}`}
  >
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left"
    >
      {featured && assignment.feedback_id ? (
        <span className="mb-4 inline-flex rounded-full border border-[#4cae68] bg-[#e8f7ea] px-4 py-2 text-sm font-medium text-[#34824a]">
          Séance réalisée !
        </span>
      ) : null}

      <div className={featured ? "flex items-end justify-between gap-5" : "flex items-start justify-between gap-3"}>
        <div className="min-w-0">
          <h3 className={`${featured ? "text-xl" : "truncate text-lg"} font-medium text-brand-tamarillo`}>
            {assignment.program_name}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brand-brown">
            <span className="inline-flex items-center gap-1">
              <ClockIcon />
              {assignment.session_minutes || 35} min
            </span>
          </div>
          <span className="mt-3 inline-flex rounded-full border border-brand-tamarillo px-3 py-1 text-xs text-brand-tamarillo">
            {assignment.program_category}
          </span>
        </div>

        {featured ? (
          <span className="mb-1 inline-flex shrink-0 items-center gap-2 text-base text-brand-tamarillo">
            Voir la séance
            <Chevron direction="right" />
          </span>
        ) : (
          <span className="mt-2 shrink-0 text-brand-tamarillo">
            <Chevron direction="right" />
          </span>
        )}
      </div>
    </button>
  </article>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [weekDate, setWeekDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [selectedAssignment, setSelectedAssignment] = useState(undefined);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      navigate("/admin/programs");
      return;
    }
    loadHomepage(weekDate);
  }, [user, navigate, weekDate]);

  const loadHomepage = async (date) => {
    try {
      const response = await api.get("/api/client/homepage", {
        params: { week: formatDateKey(date) },
      });
      setData(response.data);
    } catch (err) {
      setError("Impossible de charger la page d'accueil");
    }
  };

  useEffect(() => {
    if (!data || selectedAssignment !== undefined) return;

    const assignments = data.weekAssignments || [];
    setSelectedAssignment(
      assignments.find((assignment) => assignment.scheduled_date === selectedDate) || null,
    );
  }, [data, selectedAssignment, selectedDate]);

  const changeWeek = (direction) => {
    setWeekDate((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + direction * 7);
      return next;
    });
  };

  const weekDays = useMemo(
    () => buildWeekDays(data?.weekRange, data?.weekAssignments || [], data?.checkins || []),
    [data],
  );
  const weekLabel = formatWeekLabel(data?.weekRange);
  const firstName = data?.user?.first_name || data?.user?.name || "Adeline";
  const todayCheckin = data?.todayCheckin;

  const selectDay = (dayKey) => {
    const assignments = data?.weekAssignments || [];
    setSelectedDate(dayKey);
    setSelectedAssignment(
      assignments.find((assignment) => assignment.scheduled_date === dayKey) || null,
    );
  };

  return (
    <div className="client-screen">
      <div className="client-frame">
        {error && (
          <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
            {error}
          </p>
        )}

        <header className="mb-7">
          <h1 className="flex items-center gap-2 font-display text-3xl font-normal text-brand-tamarillo">
            <SunIcon className="h-8 w-8" />
            Bonjour, {firstName} !
          </h1>
          <p className="ml-10 mt-1 max-w-[240px] text-sm italic leading-5 text-brand-brown">
            Aujourd'hui est une bonne journée pour prendre soin de toi.
          </p>
        </header>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between text-brand-tamarillo">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
              aria-label="Semaine précédente"
            >
              <Chevron direction="left" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-medium text-brand-brown">
                Ma semaine
              </h2>
              <p className="mt-1 text-xs italic text-brand-brown">
                {weekLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => changeWeek(1)}
              aria-label="Semaine suivante"
            >
              <Chevron direction="right" />
            </button>
          </div>

          <div className="mb-8 grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const selected = day.key === selectedDate;
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => selectDay(day.key)}
                  className="flex flex-col items-center gap-2 text-brand-tamarillo"
                >
                  <span className="text-xs">{day.label}</span>
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border font-display text-xl font-normal ${
                      selected
                        ? "border-brand-tamarillo bg-brand-tamarillo text-brand-beige"
                        : "border-brand-tamarillo bg-brand-beige text-brand-tamarillo"
                    }`}
                  >
                    {day.day}
                    {day.hasAssignment ? (
                      <span className="absolute -bottom-3 h-1.5 w-1.5 rounded-full bg-brand-tamarillo" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAssignment ? (
            <SessionCard
              assignment={selectedAssignment}
              featured
              onOpen={() => navigate(`/sessions/${selectedAssignment.id}`)}
            />
          ) : null}
        </section>

        <section className="relative mb-9 rounded-md bg-brand-peach/35 p-5">
          <div className="w-2/3">
            <h2 className="font-display text-xl font-normal text-brand-tamarillo">
              Humeur du jour
            </h2>
            <p className="mt-2 text-sm leading-5 text-brand-brown">
              Ajoute ton humeur de la journée ! Prend le temps de te demander
              comment tu te sens.
            </p>
          </div>
          <MoodSmiley value={5} alt="" className="absolute -right-[2%] -top-[10%] h-24 w-24" />
          <button
            type="button"
            onClick={() => navigate("/mood")}
            disabled={Boolean(todayCheckin)}
            className="mt-4 w-full rounded-md bg-brand-tamarillo px-5 py-3 text-sm font-semibold text-brand-beige disabled:cursor-not-allowed disabled:opacity-50"
          >
            {todayCheckin ? "Mood ajouté aujourd'hui" : "Ajouter mon mood"}
          </button>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-medium text-brand-brown">
            Mes prochaines séances
          </h2>
          <HorizontalScrollRow>
            {(data?.upcomingAssignments || []).map((assignment) => (
              <SessionCard
                key={assignment.id}
                assignment={assignment}
                compact
                onOpen={() => navigate(`/sessions/${assignment.id}`)}
              />
            ))}
          </HorizontalScrollRow>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
