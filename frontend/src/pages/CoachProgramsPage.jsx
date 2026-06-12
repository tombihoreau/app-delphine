import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoachLayout from "../components/CoachLayout";
import api from "../services/api";

const ChevronIcon = ({ open = false }) => (
  <svg
    viewBox="0 0 24 24"
    className={`h-6 w-6 transition-transform ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m16.5 16.5 4 4" />
  </svg>
);

const PlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const EditIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
  </svg>
);

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DuplicateIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M8 8h9v11H8z" />
    <path d="M5 16H4V5h9v1" />
  </svg>
);

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 14h10l1-14" />
    <path d="M9 7V4h6v3" />
  </svg>
);

const ActionButton = ({ children, label, danger = false, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    aria-label={label}
    className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
      danger
        ? "bg-brand-tamarillo text-brand-beige"
        : "bg-brand-peach/60 text-brand-tamarillo hover:bg-brand-peach"
    }`}
  >
    {children}
  </button>
);

const normalizeSearchValue = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const CoachProgramsPage = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    goal: "",
    level: "",
    duration_weeks: "",
    description: "",
    session_minutes: "",
    banner_image: "",
    coach_notes: "",
    location: "Domicile",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [programToDelete, setProgramToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);

    if (!normalizedQuery) return programs;

    return programs.filter((program) =>
      normalizeSearchValue(program.name).includes(normalizedQuery),
    );
  }, [programs, query]);

  const loadData = async () => {
    try {
      const programsResponse = await api.get("/api/admin/programs");
      const nextPrograms = programsResponse.data || [];

      setPrograms(nextPrograms);

      setExpandedId((current) => {
        if (current && nextPrograms.some((program) => program.id === current)) {
          return current;
        }

        return nextPrograms[0]?.id || null;
      });
    } catch (err) {
      setError("Erreur lors du chargement des programmes");
    }
  };

  const openEdit = (program) => {
    setError("");
    setSuccess("");
    setEditingId(program.id);
    setExpandedId(program.id);

    setEditForm({
      name: program.name,
      goal: program.goal,
      level: program.level,
      duration_weeks: String(program.duration_weeks || ""),
      description: program.description || "",
      session_minutes: String(program.session_minutes || 35),
      banner_image: program.banner_image || "",
      coach_notes: program.coach_notes || "",
      location: program.location || "Domicile",
    });
  };

  const closeEdit = () => {
    setEditingId(null);
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.put(`/api/admin/programs/${editingId}`, editForm);
      setSuccess("Programme mis à jour");
      closeEdit();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour");
    }
  };

  const handleDuplicateProgram = async (programId) => {
    setError("");
    setSuccess("");

    try {
      await api.post(`/api/admin/programs/${programId}/duplicate`);
      setSuccess("Programme dupliqué");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la duplication");
    }
  };

  const requestDeleteProgram = (program) => {
    setError("");
    setSuccess("");
    setProgramToDelete(program);
  };

  const handleDeleteProgram = async () => {
    if (!programToDelete) return;

    const programId = programToDelete.id;
    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/admin/programs/${programId}`);
      setSuccess("Programme supprimé");
      setProgramToDelete(null);

      if (expandedId === programId) {
        setExpandedId(null);
      }

      if (editingId === programId) {
        closeEdit();
      }

      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  return (
    <CoachLayout headerLabel="Programmes" title="Tous les programmes">
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 rounded-md border border-[#4cae68] bg-[#e8f7ea] px-4 py-3 text-sm text-[#34824a]">
          {success}
        </p>
      )}

      <div className="mb-7 flex items-center gap-4">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un programme..."
            className="h-[60px] w-full rounded-full border border-brand-tamarillo bg-transparent pl-6 pr-14 text-base text-brand-tamarillo placeholder:text-brand-tamarillo/80 outline-none focus:ring-2 focus:ring-brand-tamarillo/20"
          />

          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-tamarillo">
            <SearchIcon />
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/programs/new")}
          className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-brand-tamarillo text-brand-beige shadow-float"
          aria-label="Créer un programme"
        >
          <PlusIcon />
        </button>
      </div>

      <div className="-mx-5">
        {filteredPrograms.map((program) => {
          const isExpanded = expandedId === program.id;

          return (
            <article
              key={program.id}
              className="border-b border-brand-peach/70 px-5"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : program.id)}
                className="flex w-full items-center gap-5 py-5 text-left text-brand-tamarillo"
              >
                <ChevronIcon open={isExpanded} />

                <h2 className="min-w-0 flex-1 truncate text-lg font-normal">
                  {program.name}
                </h2>
              </button>

              {isExpanded && (
                <div className="pb-7 pl-7 pr-2 text-brand-brown">
                  <dl className="grid grid-cols-[90px_1fr] gap-y-3 text-base">
                    <dt className="font-semibold text-[#3b0825]">Type</dt>
                    <dd>
                      {program.type || program.activity_type || "Course à pied"}
                    </dd>

                    <dt className="font-semibold text-[#3b0825]">Durée</dt>
                    <dd>{program.session_minutes || 35} min</dd>

                    <dt className="font-semibold text-[#3b0825]">Lieu</dt>
                    <dd>{program.location || "Domicile"}</dd>
                  </dl>

                  <div className="mt-7 grid grid-cols-[90px_1fr] items-center">
                    <p className="font-semibold text-[#3b0825]">Actions</p>

                    <div className="flex flex-wrap gap-5">
                      <ActionButton
                        label="Modifier le programme"
                        onClick={() => openEdit(program)}
                      >
                        <EditIcon />
                      </ActionButton>

                      <ActionButton
                        label="Voir le programme"
                        onClick={() => setExpandedId(program.id)}
                      >
                        <EyeIcon />
                      </ActionButton>

                      <ActionButton
                        label="Dupliquer le programme"
                        onClick={() => handleDuplicateProgram(program.id)}
                      >
                        <DuplicateIcon />
                      </ActionButton>

                      <ActionButton
                        label="Supprimer le programme"
                        danger
                        onClick={() => requestDeleteProgram(program)}
                      >
                        <TrashIcon />
                      </ActionButton>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        {filteredPrograms.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-brand-brown">
            {query.trim()
              ? `Aucun programme trouvé pour "${query.trim()}".`
              : "Aucun programme trouvé."}
          </p>
        )}
      </div>

      {editingId && (
        <section className="mt-6 rounded-md border border-brand-peach/70 bg-brand-beige p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium text-brand-brown">
              Modifier le programme
            </h2>

            <button
              type="button"
              onClick={closeEdit}
              className="text-sm text-brand-tamarillo"
            >
              Fermer
            </button>
          </div>

          <form onSubmit={handleUpdateProgram} className="space-y-3">
            <input
              type="text"
              placeholder="Titre"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="field-input"
              required
            />

            <textarea
              placeholder="Description"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="field-area"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={editForm.goal}
                onChange={(e) =>
                  setEditForm({ ...editForm, goal: e.target.value })
                }
                className="field-input"
                required
              >
                <option value="">Objectif</option>
                <option value="Prendre de la masse">Prendre de la masse</option>
                <option value="Perdre du poids">Perdre du poids</option>
                <option value="Améliorer la condition physique">
                  Améliorer la condition physique
                </option>
              </select>

              <select
                value={editForm.level}
                onChange={(e) =>
                  setEditForm({ ...editForm, level: e.target.value })
                }
                className="field-input"
                required
              >
                <option value="">Niveau</option>
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
              </select>
            </div>

            <input
              type="number"
              min="1"
              placeholder="Durée séance en minutes"
              value={editForm.session_minutes}
              onChange={(e) =>
                setEditForm({ ...editForm, session_minutes: e.target.value })
              }
              className="field-input"
              required
            />

            <input
              type="text"
              placeholder="Lieu"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              className="field-input"
            />

            <input
              type="number"
              min="1"
              placeholder="Durée en semaines"
              value={editForm.duration_weeks}
              onChange={(e) =>
                setEditForm({ ...editForm, duration_weeks: e.target.value })
              }
              className="field-input"
              required
            />

            <button
              type="submit"
              className="w-full rounded-md bg-brand-tamarillo px-5 py-3 text-sm font-semibold text-brand-beige"
            >
              Enregistrer
            </button>
          </form>
        </section>
      )}

      {programToDelete ? (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/35">
          <div className="w-full rounded-t-[28px] bg-brand-beige px-6 pb-10 pt-8 text-center shadow-float">
            <div className="mx-auto max-w-md">
              <h2 className="font-display text-2xl font-normal text-brand-tamarillo">
                Supprimer ce programme ?
              </h2>
              <p className="mx-auto mt-3 max-w-[300px] text-sm leading-5 text-brand-brown">
                Le programme "{programToDelete.name}" sera supprimé définitivement.
              </p>

              <button
                type="button"
                onClick={handleDeleteProgram}
                className="mt-8 w-full rounded-md bg-brand-tamarillo px-5 py-4 text-base font-bold text-brand-beige"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setProgramToDelete(null)}
                className="mt-4 w-full rounded-md border border-brand-tamarillo px-5 py-4 text-base font-bold text-brand-tamarillo"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </CoachLayout>
  );
};

export default CoachProgramsPage;
