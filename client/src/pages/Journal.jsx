import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import api from "../services/api.js";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import Heatmap from "../components/common/Heatmap.jsx";
import Modal from "../components/common/Modal.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatDate, formatDateShort, todayISO } from "../utils/dates.js";
import "../styles/components/journal.css";

export default function Journal() {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [content, setContent] = useState("");
  const [dayScore, setDayScore] = useState(7);
  const [analysis, setAnalysis] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id of entry to delete

  const pastEntriesRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [e] = await Promise.all([api.get("/journal?limit=30")]);
      setEntries(e.data.entries);
      setHeatmap(
        e.data.entries.map((en) => ({
          date: en.createdAt.split("T")[0],
          value: en.dayScore || 5,
        })),
      );
    } catch {
      addToast("Failed to load journal", "error");
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  function newEntry() {
    setActiveEntry(null);
    setContent("");
    setDayScore(7);
    setAnalysis(null);
  }

  async function saveEntry() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      if (activeEntry) {
        const res = await api.put(`/journal/${activeEntry.id}`, {
          content,
          dayScore,
        });
        setActiveEntry(res.data);
      } else {
        const res = await api.post("/journal", { content, dayScore });
        setActiveEntry(res.data);
      }
      setLastSaved(new Date());
      addToast("Entry saved", "success");
      load();
    } catch {
      addToast("Failed to save entry", "error");
    } finally {
      setSaving(false);
    }
  }

  // Auto-save after 3s of inactivity
  function handleContentChange(val) {
    setContent(val);
    clearTimeout(autoSaveTimeout);
    if (activeEntry && val.trim()) {
      const t = setTimeout(() => {
        api
          .put(`/journal/${activeEntry.id}`, { content: val, dayScore })
          .then(() => setLastSaved(new Date()))
          .catch(() => {});
      }, 3000);
      setAutoSaveTimeout(t);
    }
  }

  async function analyseEntry() {
    if (!activeEntry) {
      addToast("Save the entry first", "warning");
      return;
    }
    setAnalysing(true);
    setAnalysis(null);
    try {
      const res = await api.post(`/journal/${activeEntry.id}/analyse`);
      setAnalysis(res.data.analysis);
    } catch {
      addToast("AI analysis failed. Check your Groq API key.", "error");
    } finally {
      setAnalysing(false);
    }
  }

  function loadEntry(entry) {
    setActiveEntry(entry);
    setContent(entry.content);
    setDayScore(entry.dayScore || 7);
    setAnalysis(entry.analysis || null);
  }

  async function confirmDeleteEntry() {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/journal/${deleteConfirm}`);
      setEntries((prev) => prev.filter((e) => e.id !== deleteConfirm));
      if (activeEntry?.id === deleteConfirm) {
        setActiveEntry(null);
        setContent("");
        setDayScore(7);
        setAnalysis(null);
      }
      setDeleteConfirm(null);
      addToast("Entry deleted", "success");
    } catch {
      addToast("Failed to delete entry", "error");
    }
  }

  function scrollToPastEntries() {
    setExpandedId(null);
    pastEntriesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Velocity chart: last 30 entries' scores
  const velocityEntries = [...entries].slice(0, 30).reverse();

  return (
    <div className="journal-page page-enter">
      <div className="journal-header">
        <div>
          <h2>Journal</h2>
          <p>Recording the interior landscape.</p>
        </div>
        <div className="journal-header-actions">
          <Button
            variant="ghost"
            icon={Calendar}
            size="sm"
            onClick={scrollToPastEntries}
          >
            History
          </Button>
          <Button variant="primary" icon={Plus} size="sm" onClick={newEntry}>
            New Entry
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="journal-editor">
        <div className="journal-editor-top">
          <span className="journal-date">
            {formatDate(
              activeEntry ? new Date(activeEntry.createdAt) : new Date(),
            )}
          </span>
          <div className="journal-score-row">
            <span className="journal-score-label">Day Score</span>
            <input
              className="journal-score-input"
              type="number"
              min={1}
              max={10}
              value={dayScore}
              onChange={(e) =>
                setDayScore(Math.min(10, Math.max(1, Number(e.target.value))))
              }
            />
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>/10</span>
          </div>
        </div>

        <textarea
          className="journal-textarea"
          placeholder="Write from the heart. What happened today? How did you feel? What did you build?"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
        />

        <div className="journal-editor-footer">
          <span className="journal-autosave">
            {lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString()}`
              : "Not saved yet"}
          </span>
          <div className="journal-editor-actions">
            <Button
              variant="ghost"
              size="sm"
              loading={analysing}
              onClick={analyseEntry}
              disabled={!content.trim()}
            >
              {analysing ? "Thinking..." : "Analyse with AI"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={saveEntry}
            >
              Save Entry
            </Button>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {(analysing || analysis) && (
        <div className="journal-analysis">
          {analysing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="skeleton" style={{ height: 16, width: "60%" }} />
              <div className="skeleton" style={{ height: 12, width: "100%" }} />
              <div className="skeleton" style={{ height: 12, width: "80%" }} />
            </div>
          ) : (
            analysis && (
              <>
                <div className="journal-analysis-header">
                  <Flame size={18} />
                  <h3>AI Reflection</h3>
                </div>
                <div className="journal-analysis-grid">
                  {["reflection", "patterns", "suggestions"].map((key) => (
                    <div key={key} className="journal-analysis-section">
                      <h4>{key}</h4>
                      <p>{analysis[key]}</p>
                    </div>
                  ))}
                </div>
                <div className="journal-analysis-footer">
                  <span>Context: recent entries</span>
                  <span>Powered by Groq</span>
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* Velocity */}
      <Card title="Journal Velocity" subtitle="Day scores — last 30 entries">
        <div className="journal-velocity" style={{ marginTop: 12 }}>
          {velocityEntries.map((e, i) => (
            <div
              key={e.id}
              className="journal-velocity-bar"
              style={{ height: `${((e.dayScore || 5) / 10) * 100}%` }}
              title={`${e.createdAt.split("T")[0]}: ${e.dayScore || "?"}/10`}
            />
          ))}
          {velocityEntries.length === 0 && (
            <p
              style={{ margin: "auto", fontSize: 12, color: "var(--text-dim)" }}
            >
              No entries yet
            </p>
          )}
        </div>
      </Card>

      {/* Heatmap */}
      <Card title="Entry Heatmap" subtitle="Color intensity = day score">
        <Heatmap data={heatmap} mode="score" valueLabel="/10" />
      </Card>

      {/* Past entries */}
      <div ref={pastEntriesRef}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
          Past Entries
        </h3>
        <div className="journal-entries-list">
          {entries.map((entry) => {
            const expanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="journal-entry-row">
                <div
                  className="journal-entry-row-header"
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                >
                  <div className="journal-entry-row-left">
                    <span className="journal-entry-date">
                      {formatDateShort(entry.createdAt)}
                    </span>
                    {!expanded && (
                      <span className="journal-entry-preview">
                        {entry.content.slice(0, 80)}
                        {entry.content.length > 80 ? "..." : ""}
                      </span>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {entry.dayScore && (
                      <Badge variant="primary">{entry.dayScore}/10</Badge>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "4px 8px", minWidth: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        loadEntry(entry);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="journal-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(entry.id);
                      }}
                      title="Delete entry"
                      aria-label="Delete entry"
                    >
                      <Trash2 size={13} />
                    </button>
                    {expanded ? (
                      <ChevronUp size={14} color="var(--text-dim)" />
                    ) : (
                      <ChevronDown size={14} color="var(--text-dim)" />
                    )}
                  </div>
                </div>
                {expanded && (
                  <div className="journal-entry-expand">
                    {entry.content}
                    {entry.analysis && (
                      <div
                        style={{
                          marginTop: 16,
                          padding: "12px 0",
                          borderTop: "1px solid var(--border)",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 16,
                        }}
                      >
                        {["reflection", "patterns", "suggestions"].map(
                          (key) => (
                            <div key={key}>
                              <p
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  color: "var(--primary)",
                                  marginBottom: 6,
                                }}
                              >
                                {key}
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                  lineHeight: 1.6,
                                }}
                              >
                                {entry.analysis[key]}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {entries.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: 13,
                padding: "24px 0",
              }}
            >
              No entries yet. Start writing above.
            </p>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Entry"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDeleteEntry}>
              Delete
            </Button>
          </>
        }
      >
        <p
          style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}
        >
          Are you sure you want to delete this entry? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
